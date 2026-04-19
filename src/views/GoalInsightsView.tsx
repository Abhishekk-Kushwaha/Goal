import React, { useEffect, useMemo, useState } from "react";
import {
  format,
  eachDayOfInterval,
  isAfter,
  isBefore,
  isValid,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flag,
  Flame,
  Home,
  MoreHorizontal,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

const RANGE_OPTIONS = [
  { key: "7d", label: "Last 7 Days", days: 7 },
  { key: "30d", label: "Last 30 Days", days: 30 },
  { key: "90d", label: "Last 90 Days", days: 90 },
  { key: "all", label: "All Time", days: null },
] as const;

type RangeKey = (typeof RANGE_OPTIONS)[number]["key"];
type ChartMode = "total" | "goal";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function safeDate(dateStr?: string | null) {
  if (!dateStr) return null;
  const parsed = parseISO(dateStr);
  return isValid(parsed) ? parsed : null;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function formatDelta(value: number) {
  if (value > 0) return `+${Math.round(value)}%`;
  if (value < 0) return `${Math.round(value)}%`;
  return "0%";
}

function getAccentColor(goal: any, fallback: string) {
  const category = (goal.category || "").toLowerCase();
  if (category.includes("health")) return "#7ce5bd";
  if (category.includes("finance")) return "#f5b955";
  if (category.includes("learn")) return "#86b7ff";
  if (goal.priority === "High") return "#67b8ff";
  return fallback;
}

function getDaysUntil(dateStr?: string | null) {
  const parsed = safeDate(dateStr);
  if (!parsed) return null;
  const today = startOfDay(new Date());
  return Math.round((startOfDay(parsed).getTime() - today.getTime()) / 86400000);
}

function getTotalOccurrences(item: {
  created_at?: string;
  repeat?: string;
  due_date?: string;
  deadline?: string;
}) {
  if (!item.repeat || item.repeat === "None") return 1;
  const start = safeDate(item.created_at) || startOfDay(new Date());
  const end = safeDate(item.due_date || item.deadline);
  if (!end) return 1;

  const dayDiff = Math.max(
    0,
    Math.round((startOfDay(end).getTime() - startOfDay(start).getTime()) / 86400000),
  );
  if (item.repeat === "Daily") return Math.max(1, dayDiff + 1);
  if (item.repeat === "Weekly") return Math.max(1, Math.ceil((dayDiff + 1) / 7));
  if (item.repeat === "Monthly") return Math.max(1, Math.ceil((dayDiff + 1) / 30));
  return 1;
}

function buildActivityEvents(goal: any) {
  const events: Array<{ date: Date; value: number }> = [];
  const milestones = goal.milestones || [];
  const milestoneCount = milestones.length;
  const milestoneShare = milestoneCount > 0 ? 100 / milestoneCount : 0;

  if (milestoneCount > 0) {
    milestones.forEach((milestone: any) => {
      if (milestone.repeat && milestone.repeat !== "None") {
        const totalOccurrences = getTotalOccurrences({
          created_at: milestone.created_at,
          repeat: milestone.repeat,
          due_date: milestone.due_date,
        });
        const completionWeight = milestoneShare / Math.max(1, totalOccurrences);
        (milestone.completed_dates || []).forEach((dateStr: string) => {
          const date = safeDate(dateStr);
          if (date) events.push({ date: startOfDay(date), value: completionWeight });
        });
        return;
      }

      if (milestone.done || milestone.completed_at) {
        const date =
          safeDate(milestone.completed_at) ||
          safeDate(milestone.due_date) ||
          safeDate(goal.created_at) ||
          startOfDay(new Date());
        events.push({ date: startOfDay(date), value: milestoneShare });
      }
    });
    return events;
  }

  if (goal.repeat && goal.repeat !== "None" && (goal.completed_dates || []).length > 0) {
    const totalOccurrences = getTotalOccurrences({
      created_at: goal.created_at,
      repeat: goal.repeat,
      deadline: goal.deadline,
    });
    const completionWeight = 100 / Math.max(1, totalOccurrences);
    (goal.completed_dates || []).forEach((dateStr: string) => {
      const date = safeDate(dateStr);
      if (date) events.push({ date: startOfDay(date), value: completionWeight });
    });
  }

  return events;
}

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1118]/95 px-3 py-2 shadow-2xl backdrop-blur-md">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
        {label}
      </p>
      <div className="mt-1 space-y-1">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2 text-white/70">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color || entry.stroke }}
              />
              {entry.name}
            </span>
            <span className="font-semibold text-white">{Math.round(entry.value)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GoalInsightsView(props: any) {
  const { goals, categories, setView, setActiveGoalId } = props;

  const visibleGoals = useMemo(
    () => goals.filter((goal: any) => goal.title !== "General Tasks"),
    [goals],
  );

  const [rangeKey, setRangeKey] = useState<RangeKey>("7d");
  const [chartMode, setChartMode] = useState<ChartMode>("total");
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(
    () => props.activeGoalId || null,
  );

  const today = useMemo(() => startOfDay(new Date()), []);

  const allTimeStart = useMemo(() => {
    const candidates: Date[] = [];
    visibleGoals.forEach((goal: any) => {
      const goalDates = [
        safeDate(goal.created_at),
        safeDate(goal.deadline),
        ...(goal.completed_dates || []).map((dateStr: string) => safeDate(dateStr)),
      ].filter(Boolean) as Date[];
      goalDates.forEach((date) => candidates.push(startOfDay(date)));

      (goal.milestones || []).forEach((milestone: any) => {
        const milestoneDates = [
          safeDate(milestone.created_at),
          safeDate(milestone.due_date),
          safeDate(milestone.completed_at),
          ...(milestone.completed_dates || []).map((dateStr: string) => safeDate(dateStr)),
        ].filter(Boolean) as Date[];
        milestoneDates.forEach((date) => candidates.push(startOfDay(date)));
      });
    });
    return candidates.length === 0 ? today : startOfDay(new Date(Math.min(...candidates.map((date) => date.getTime()))));
  }, [today, visibleGoals]);

  const rangeDays = useMemo(() => {
    const selected = RANGE_OPTIONS.find((option) => option.key === rangeKey);
    if (!selected || selected.days === null) {
      return eachDayOfInterval({ start: allTimeStart, end: today });
    }
    return eachDayOfInterval({ start: subDays(today, selected.days - 1), end: today });
  }, [allTimeStart, rangeKey, today]);

  const activityByDate = useMemo(() => {
    const map = new Map<string, number>();
    visibleGoals.forEach((goal: any) => {
      buildActivityEvents(goal).forEach((event) => {
        const key = format(startOfDay(event.date), "yyyy-MM-dd");
        map.set(key, (map.get(key) || 0) + 1);
      });
    });
    return map;
  }, [visibleGoals]);

  const analyses = useMemo(() => {
    return visibleGoals
      .map((goal: any) => {
        const events = buildActivityEvents(goal).sort((a, b) => a.date.getTime() - b.date.getTime());
        const firstActivity = events[0]?.date || null;
        const lastActivity = events[events.length - 1]?.date || null;

        const cumulativeSeries = rangeDays.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const total = events
            .filter((event) => format(event.date, "yyyy-MM-dd") === dayKey)
            .reduce((sum, event) => sum + event.value, 0);

          const prior = events
            .filter((event) => isBefore(event.date, day))
            .reduce((sum, event) => sum + event.value, 0);

          if (events.length === 0 && typeof goal.progress === "number") return clamp(goal.progress);
          return clamp(prior + total);
        });

        const targetSeries = rangeDays.map((day) => {
          const deadline = safeDate(goal.deadline);
          const createdAt = safeDate(goal.created_at) || firstActivity || rangeDays[0];
          if (!deadline || !isAfter(deadline, createdAt)) return cumulativeSeries[rangeDays.indexOf(day)] || 0;
          const span = Math.max(1, deadline.getTime() - createdAt.getTime());
          return clamp(((day.getTime() - createdAt.getTime()) / span) * 100);
        });

        const progressVal = clamp(typeof goal.progress === "number" ? goal.progress : cumulativeSeries[cumulativeSeries.length - 1] || 0);
        const activeDays = rangeDays.filter((day) => (activityByDate.get(format(day, "yyyy-MM-dd")) || 0) > 0).length;
        const consistency = rangeDays.length > 0 ? Math.round((activeDays / rangeDays.length) * 100) : 0;
        const weeklyGain = Math.round((cumulativeSeries[cumulativeSeries.length - 1] || 0) - (cumulativeSeries[0] || 0));
        const latestTarget = targetSeries[targetSeries.length - 1] || progressVal;
        const paceGap = Math.round(progressVal - latestTarget);
        const daysLeft = getDaysUntil(goal.deadline);
        const hasActivity = events.length > 0;
        const completed = progressVal >= 100;

        let status: "on-track" | "behind" | "inactive" | "completed" = "on-track";
        if (completed) status = "completed";
        else if (!hasActivity) status = "inactive";
        else if (daysLeft !== null && daysLeft < 0) status = "behind";
        else if (paceGap < -5) status = "behind";

        let attentionScore = 0;
        if (status === "behind") attentionScore += 120;
        if (status === "inactive") attentionScore += 100;
        if (daysLeft !== null && daysLeft <= 7) attentionScore += 40 + Math.max(0, 7 - daysLeft) * 4;
        attentionScore += Math.max(0, 60 - progressVal);
        attentionScore += Math.max(0, 35 - weeklyGain * 2);

        return {
          id: goal.id,
          goal,
          accent: getAccentColor(goal, categories.find((item: any) => item.name === goal.category)?.color || "#67b8ff"),
          progressVal,
          weeklyGain,
          consistency,
          paceGap,
          daysLeft,
          status,
          attentionScore,
          targetSeries,
          cumulativeSeries,
          subtitle:
            (goal.milestones || []).length > 0
              ? `${(goal.milestones || []).filter((m: any) => m.done).length} / ${(goal.milestones || []).length} milestones done`
              : "Goal is ready for deeper planning",
          firstActivity,
          lastActivity,
        };
      })
      .sort((a: any, b: any) => b.attentionScore - a.attentionScore || a.progressVal - b.progressVal);
  }, [activityByDate, categories, rangeDays, visibleGoals]);

  useEffect(() => {
    if (!selectedGoalId && analyses.length > 0) {
      setSelectedGoalId(props.activeGoalId || analyses[0].id);
    }
  }, [analyses, props.activeGoalId, selectedGoalId]);

  const selectedGoal =
    analyses.find((item: any) => item.id === selectedGoalId) ||
    analyses.find((item: any) => item.id === props.activeGoalId) ||
    analyses[0] ||
    null;

  const statusCounts = useMemo(() => {
    const active = analyses.filter((item: any) => item.status !== "completed");
    return {
      active: active.length,
      onTrack: analyses.filter((item: any) => item.status === "on-track").length,
      behind: analyses.filter((item: any) => item.status === "behind").length,
      inactive: analyses.filter((item: any) => item.status === "inactive").length,
    };
  }, [analyses]);

  const chartData = useMemo(() => {
    const selectedIndexSeries = selectedGoal?.cumulativeSeries || rangeDays.map(() => 0);
    const totalSeries =
      rangeDays.length === 0
        ? []
        : rangeDays.map((_, index) => {
            const total = analyses.reduce((sum: number, item: any) => sum + (item.cumulativeSeries[index] || 0), 0);
            return Math.round(total / Math.max(1, analyses.length));
          });

    const targetSeries =
      rangeDays.length === 0
        ? []
        : rangeDays.map((_, index) => {
            const total = analyses.reduce((sum: number, item: any) => sum + (item.targetSeries[index] || 0), 0);
            return Math.round(total / Math.max(1, analyses.length));
          });

    return rangeDays.map((day, index) => ({
      label: rangeDays.length <= 10 ? format(day, "EEE") : rangeDays.length <= 35 ? format(day, "d") : format(day, "MMM d"),
      total: totalSeries[index] || 0,
      target: targetSeries[index] || 0,
      goal: selectedIndexSeries[index] || 0,
      goalTarget: selectedGoal?.targetSeries?.[index] ?? selectedIndexSeries[index] ?? 0,
    }));
  }, [analyses, rangeDays, selectedGoal]);

  const latestActual = chartData[chartData.length - 1]?.[chartMode === "goal" ? "goal" : "total"] || 0;
  const startActual = chartData[0]?.[chartMode === "goal" ? "goal" : "total"] || 0;
  const weeklyGain = Math.round(latestActual - startActual);
  const latestTarget =
    chartData[chartData.length - 1]?.[chartMode === "goal" ? "goalTarget" : "target"] || latestActual;
  const paceGap = Math.round(latestActual - latestTarget);
  const paceLabel = paceGap >= 0 ? "Ahead of target" : paceGap >= -5 ? "On pace" : "Behind target";

  const heatmapDays = useMemo(() => eachDayOfInterval({ start: subDays(today, 27), end: today }), [today]);
  const heatmapRows: Date[][] = [];
  for (let index = 0; index < heatmapDays.length; index += 7) {
    heatmapRows.push(heatmapDays.slice(index, index + 7));
  }

  const heatmapRates = useMemo(() => {
    const countActiveDays = (days: Date[]) =>
      days.filter((day) => (activityByDate.get(format(day, "yyyy-MM-dd")) || 0) > 0).length;

    const currentRate = Math.round((countActiveDays(heatmapDays) / Math.max(1, heatmapDays.length)) * 100);
    const previousDays = eachDayOfInterval({
      start: subDays(heatmapDays[0], heatmapDays.length),
      end: subDays(heatmapDays[0], 1),
    });
    const previousRate = Math.round((countActiveDays(previousDays) / Math.max(1, previousDays.length)) * 100);

    return {
      currentRate,
      delta: currentRate - previousRate,
    };
  }, [activityByDate, heatmapDays]);

  const insight = useMemo(() => {
    if (analyses.length === 0) {
      return {
        title: "No goals yet",
        detail: "Create your first goal to unlock pace tracking, consistency heatmaps, and attention signals.",
      };
    }

    const urgent = analyses[0];
    const fastest = [...analyses].sort((a: any, b: any) => b.weeklyGain - a.weeklyGain)[0];
    const mostConsistent = [...analyses].sort((a: any, b: any) => b.consistency - a.consistency)[0];

    if (urgent.status === "behind") {
      return {
        title: `${urgent.goal.title} needs attention`,
        detail: `It is ${Math.abs(Math.round(urgent.paceGap))}% behind pace and should be your next focus block.`,
      };
    }
    if (urgent.status === "inactive") {
      return {
        title: `${urgent.goal.title} has gone quiet`,
        detail: "There has been no meaningful activity in the selected range, so this goal is drifting.",
      };
    }

    return {
      title: `${fastest.goal.title} is building momentum`,
      detail: `${fastest.goal.title} gained ${formatDelta(fastest.weeklyGain)} in the selected range. ${mostConsistent.goal.title} is the most consistent goal right now.`,
    };
  }, [analyses]);

  const openGoalDetail = (goalId: string) => {
    setActiveGoalId(goalId);
    setView("detail");
  };

  const goBack = () => setView("goals");

  const overviewCards = [
    { label: "Active Goals", value: statusCounts.active, bg: "from-[#2f55a8]/85 to-[#1f3f86]/85" },
    { label: "On Track", value: statusCounts.onTrack, bg: "from-[#344d56]/85 to-[#273841]/85" },
    { label: "Behind", value: statusCounts.behind, bg: "from-[#7f5a4a]/85 to-[#4d352d]/85" },
    { label: "Inactive", value: statusCounts.inactive, bg: "from-[#71658b]/85 to-[#4c4360]/85" },
  ];

  const bottomCards = [
    {
      label: "Average Consistency",
      value: `${heatmapRates.currentRate}%`,
      sub: `${heatmapRates.delta >= 0 ? "+" : ""}${heatmapRates.delta}%`,
    },
    {
      label: "Avg. Completion",
      value: `${Math.max(0, Math.round(weeklyGain))}%`,
      sub: `${Math.max(1, Math.min(7, analyses.length))} of 7 tasks finished`,
    },
  ];

  return (
    <motion.div
      key="goal-insights"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="relative min-h-full bg-[#0e0d18] px-3 py-4 pb-28 text-white md:px-6 md:pb-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(109,83,173,0.46),transparent_34%),radial-gradient(circle_at_bottom,rgba(49,71,150,0.24),transparent_30%),linear-gradient(180deg,#24153f_0%,#171425_44%,#0b0c12_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(87,166,255,0.12),transparent_58%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5">
        <header className="flex items-center gap-3 px-1">
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-sm font-semibold text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex-1 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/35">
              Goal Insights
            </p>
            <h1 className="mt-1 text-[20px] font-bold tracking-[-0.04em] text-white">
              Dashboard
            </h1>
          </div>
        </header>

        {visibleGoals.length === 0 ? (
          <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(31,25,48,0.92),rgba(12,14,20,0.94))] p-6 text-center shadow-[0_24px_60px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
              <Target className="h-6 w-6 text-white/75" />
            </div>
            <h2 className="mt-4 text-[18px] font-semibold tracking-[-0.03em] text-white">
              No goals yet
            </h2>
            <p className="mx-auto mt-2 max-w-[240px] text-[12px] leading-6 text-white/58">
              Create your first goal to unlock pace tracking, consistency heatmaps, and
              attention signals.
            </p>
            <button
              type="button"
              onClick={() => props.setIsAddingGoal?.(true)}
              className="mt-5 rounded-full border border-sky-400/20 bg-sky-400/12 px-4 py-2 text-[12px] font-semibold text-sky-200 transition-colors hover:bg-sky-400/16"
            >
              Create goal
            </button>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            <section>
              <h2 className="mb-2 px-1 text-[14px] font-semibold tracking-[-0.02em] text-white/92">
                Goal Overview
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {overviewCards.map((card) => (
                  <div
                    key={card.label}
                    className={`min-h-[72px] rounded-[10px] border border-white/10 bg-gradient-to-br ${card.bg} px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`}
                  >
                    <div className="text-[22px] font-semibold leading-none tracking-[-0.05em] text-white">
                      {card.value}
                    </div>
                    <div className="mt-1 text-[9px] leading-[1.15] text-white/76">{card.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {bottomCards.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-[10px] border border-white/10 bg-white/[0.08] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md"
                  >
                    <div className="flex items-end justify-between gap-2">
                      <div className="text-[22px] font-semibold tracking-[-0.05em] text-white">{card.value}</div>
                      <div className="text-[11px] font-semibold text-emerald-300">{card.sub}</div>
                    </div>
                    <div className="mt-0.5 text-[9px] text-white/72">{card.label}</div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-end justify-between gap-3 px-1">
                <h2 className="text-[14px] font-semibold tracking-[-0.02em] text-white/92">
                  Progress Over Time
                </h2>
                <div className="flex flex-wrap items-center justify-end gap-2 text-[10px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setChartMode("total")}
                    className={cn(
                      "rounded-full px-3 py-1 transition-colors",
                      chartMode === "total"
                        ? "bg-white/15 text-white"
                        : "border border-white/10 bg-white/[0.04] text-white/55",
                    )}
                  >
                    Total Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode("goal")}
                    className={cn(
                      "rounded-full px-3 py-1 transition-colors",
                      chartMode === "goal"
                        ? "bg-white/15 text-white"
                        : "border border-white/10 bg-white/[0.04] text-white/55",
                    )}
                  >
                    By Goal
                  </button>
                  <div className="flex items-center gap-1">
                    {RANGE_OPTIONS.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setRangeKey(option.key)}
                        className={cn(
                          "rounded-full px-2.5 py-1 transition-colors",
                          rangeKey === option.key
                            ? "bg-white/15 text-white"
                            : "border border-white/10 bg-white/[0.04] text-white/55",
                        )}
                      >
                        {option.label.replace("Last ", "").replace(" Days", "D")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[14px] border border-white/10 bg-[linear-gradient(180deg,rgba(48,41,74,0.72),rgba(24,27,40,0.82))] px-2 py-3 backdrop-blur-md">
                <div className="mb-1 flex items-center justify-end px-1">
                  <div className="text-[18px] font-semibold tracking-[-0.04em] text-white/92">
                    {Math.round(latestActual)}%
                  </div>
                </div>
                <div className="h-[138px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 6, right: 4, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#9da8cf", fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9da8cf", fontSize: 10 }} allowDecimals={false} />
                      <Tooltip content={<TrendTooltip />} />
                      {chartMode === "goal" ? (
                        <>
                          <Line
                            type="monotone"
                            dataKey="goal"
                            name={selectedGoal?.goal.title || "Goal"}
                            stroke="#8cc2ff"
                            strokeWidth={2.5}
                            dot={{ r: 3, fill: "#9fd0ff", strokeWidth: 0 }}
                            activeDot={{ r: 4, fill: "#fff" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="goalTarget"
                            name="Target"
                            stroke="#ffffff"
                            strokeOpacity={0.55}
                            strokeWidth={1.5}
                            strokeDasharray="5 5"
                            dot={false}
                          />
                        </>
                      ) : (
                        <>
                          <Line
                            type="monotone"
                            dataKey="total"
                            name="Total Progress"
                            stroke="#8cc2ff"
                            strokeWidth={2.5}
                            dot={{ r: 3, fill: "#9fd0ff", strokeWidth: 0 }}
                            activeDot={{ r: 4, fill: "#fff" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="target"
                            name="Target"
                            stroke="#ffffff"
                            strokeOpacity={0.55}
                            strokeWidth={1.5}
                            strokeDasharray="5 5"
                            dot={false}
                          />
                        </>
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-2 px-1 text-[14px] font-semibold tracking-[-0.02em] text-white/92">
                Goal Performance
              </h2>
              <div className="rounded-[14px] border border-white/10 bg-[linear-gradient(180deg,rgba(35,32,50,0.8),rgba(17,18,26,0.9))] px-3 py-2.5 backdrop-blur-md">
                <div className="space-y-2">
                  {analyses.slice(0, 4).map((item: any) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div
                        className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-white/10 text-[8px]"
                        style={{ color: item.accent }}
                      >
                        {categories.find((c: any) => c.name === item.goal.category)?.icon || "•"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="truncate text-[11px] text-white/86">{item.goal.title}</div>
                          <div className="text-[11px] text-white/82">{item.progressVal}%</div>
                        </div>
                        <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-[#39425f]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${item.progressVal}%`,
                              background: `linear-gradient(90deg, ${item.accent}, rgba(140,194,255,0.95))`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2 rounded-[12px] border border-white/10 bg-white/[0.05] px-3 py-2 text-[11px] text-white/72">
                <span className="font-semibold text-[#d3d9ff]">{insight.title}</span>{" "}
                <span className="text-white/56">{insight.detail}</span>
              </div>
            </section>

            <section>
              <h2 className="mb-2 px-1 text-[14px] font-semibold tracking-[-0.02em] text-white/92">
                Consistency
              </h2>
              <div className="grid grid-cols-[1.2fr_0.9fr] gap-2">
                <div className="rounded-[14px] border border-white/10 bg-[linear-gradient(180deg,rgba(35,32,50,0.78),rgba(17,18,26,0.9))] px-2 py-2 backdrop-blur-md">
                  <div className="mb-1 flex items-center justify-between px-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-white/42">
                    <span>W1</span>
                    <span>W2</span>
                    <span>W3</span>
                    <span>W4</span>
                  </div>
                  <div className="space-y-1">
                    {heatmapRows.slice(0, 4).map((row, rowIndex) => (
                      <div key={`heat-${rowIndex}`} className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 7 }).map((_, columnIndex) => {
                          const day = row[columnIndex];
                          if (!day) {
                            return <div key={`empty-${rowIndex}-${columnIndex}`} className="h-3.5 rounded-[3px] bg-white/[0.03]" />;
                          }
                          const key = format(day, "yyyy-MM-dd");
                          const activity = activityByDate.get(key) || 0;
                          const intensity =
                            activity === 0 ? "bg-[#2f3952]" :
                            activity === 1 ? "bg-[#4f86c9]" :
                            activity === 2 ? "bg-[#69a9d9]" :
                            activity === 3 ? "bg-[#7fd3b0]" :
                            "bg-[#a7e9c5]";
                          return <div key={key} className={`h-3.5 rounded-[3px] ${intensity}`} />;
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[14px] border border-white/10 bg-[linear-gradient(180deg,rgba(35,32,50,0.78),rgba(17,18,26,0.9))] px-3 py-2.5 backdrop-blur-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[18px] font-semibold tracking-[-0.05em] text-[#9fc4ff]">
                        +{Math.max(0, heatmapRates.delta)}%
                      </div>
                      <div className="text-[10px] text-white/56">this Week</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-semibold text-[#e39a5e]">Behind</div>
                      <div className="text-[10px] text-white/56">Target</div>
                    </div>
                  </div>
                  <div className="mt-2 h-[78px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.slice(-3)} margin={{ top: 6, right: 4, left: -14, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#9da8cf", fontSize: 8 }} />
                        <YAxis axisLine={false} tickLine={false} hide />
                        <Tooltip content={<TrendTooltip />} />
                        <Line type="monotone" dataKey={chartMode === "goal" ? "goal" : "total"} stroke="#b5d3ff" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey={chartMode === "goal" ? "goalTarget" : "target"} stroke="#e6b48c" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        <div className="rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(32,28,55,0.95),rgba(14,15,22,0.97))] px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.2)]">
          <div className="grid grid-cols-5 items-center text-white/78">
            {[
              { icon: Home, label: "Home", active: false },
              { icon: CheckCircle2, label: "Done", active: false },
              { icon: Flag, label: "Goal", active: false },
              { icon: BarChart3, label: "Chart", active: true },
              { icon: MoreHorizontal, label: "More", active: false },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex flex-col items-center gap-1">
                  <Icon className={cn("h-5 w-5", item.active ? "text-white" : "text-white/55")} />
                  <span className={cn("text-[9px] font-medium", item.active ? "text-white" : "text-white/45")}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
