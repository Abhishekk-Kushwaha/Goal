import React from "react";
import { motion } from "motion/react";
import { ChevronRight, Plus, Target } from "lucide-react";
import type { Category, Goal, Milestone } from "../storage";
import type { ViewType } from "../hooks/useAppRouter";

type GoalsViewProps = {
  setView: React.Dispatch<React.SetStateAction<ViewType>>;
  setActiveGoalId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsAddingGoal: React.Dispatch<React.SetStateAction<boolean>>;
  featuredGoalId: string | null;
  setFeaturedGoalId: React.Dispatch<React.SetStateAction<string | null>>;
  goals: Goal[];
  categories: Category[];
};

const HERO_RING = 320.44;
const SUMMARY_RING = 119.38;

function getDaysUntil(dateStr: string | undefined) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (Number.isNaN(target.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function formatDueText(daysLeft: number | null) {
  if (daysLeft === null) return "No deadline";
  if (daysLeft < 0) return `Due ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} ago`;
  if (daysLeft === 0) return "Due today";
  if (daysLeft === 1) return "Due tomorrow";
  return `Due in ${daysLeft} days`;
}

function formatCompactDueText(daysLeft: number | null, progress: number) {
  if (progress >= 100) return "Completed";
  if (daysLeft === null) return "On track";
  if (daysLeft < 0) return `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} overdue`;
  if (daysLeft === 0) return "Due today";
  if (daysLeft <= 7) return `Due in ${daysLeft} days`;
  return `Due ${daysLeft}d`;
}

function getAccentColor(goal: Goal, fallback: string) {
  if ((goal.category || "").toLowerCase().includes("health")) return "#7ce5bd";
  if ((goal.category || "").toLowerCase().includes("finance")) return "#f5b955";
  if ((goal.category || "").toLowerCase().includes("learn")) return "#f4b560";
  if (goal.priority === "High") return "#67b8ff";
  return fallback;
}

function getCompactValue(goal: Goal, progressVal: number) {
  if ((goal.category || "").toLowerCase().includes("finance")) {
    const total = goal.note?.match(/₹[\d,]+/)?.[0];
    const saved = goal.note?.match(/saved[:\s-]+(₹[\d,]+)/i)?.[1];
    return saved || total || `${progressVal}%`;
  }
  return `${progressVal}%`;
}

function truncateText(text: string | undefined, maxLength: number) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function GoalsView(props: GoalsViewProps) {
  const {
    setView,
    setActiveGoalId,
    setIsAddingGoal,
    featuredGoalId,
    setFeaturedGoalId,
    goals,
    categories,
  } = props;

  const cardSurface =
    "border border-white/[0.06] bg-[linear-gradient(145deg,rgba(22,26,30,0.96),rgba(13,16,19,0.98))] shadow-[0_18px_48px_-38px_rgba(0,0,0,1)]";

  const visibleGoals = React.useMemo(
    () => goals.filter((goal) => goal.title !== "General Tasks"),
    [goals],
  );

  const enrichedGoals = React.useMemo(() => {
    return visibleGoals.map((goal) => {
      const category =
        categories.find((c) => c.name === goal.category) || {
          color: "#67b8ff",
          icon: "•",
        };
      const milestones = goal.milestones || [];
      const progressVal = Math.max(0, Math.min(100, Math.round(goal.progress || 0)));
      const milestoneDone = milestones.filter((m: Milestone) => m.done).length;
      const milestoneTotal = milestones.length;
      const remainingMilestones = Math.max(milestoneTotal - milestoneDone, 0);
      const nextMilestone =
        [...milestones]
          .filter((m: Milestone) => !m.done)
          .sort((a: Milestone, b: Milestone) => {
            const aTime = a?.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
            const bTime = b?.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
            return aTime - bTime;
          })[0] || null;
      const daysLeft = getDaysUntil(goal.deadline);
      const needsAttention =
        progressVal < 100 &&
        ((daysLeft !== null && daysLeft < 0) ||
          (goal.priority === "High" && progressVal < 45) ||
          (daysLeft !== null && daysLeft <= 5 && progressVal < 70));
      const accent = getAccentColor(goal, category.color || "#67b8ff");

      let score = 0;
      if (progressVal < 100) score += 140;
      if (goal.priority === "High") score += 40;
      if (goal.priority === "Medium") score += 20;
      if (daysLeft !== null && daysLeft < 0) score += 70;
      if (daysLeft !== null && daysLeft >= 0) score += Math.max(0, 15 - daysLeft);
      score += remainingMilestones * 3;
      score += Math.max(0, 100 - progressVal) * 0.25;

      return {
        ...goal,
        category,
        accent,
        progressVal,
        milestoneDone,
        milestoneTotal,
        nextMilestone,
        daysLeft,
        needsAttention,
        dueText: formatDueText(daysLeft),
        compactDueText: formatCompactDueText(daysLeft, progressVal),
        compactMetaLeft: nextMilestone
          ? `Next: ${nextMilestone.title}`
          : milestoneTotal > 0
            ? `${milestoneDone} / ${milestoneTotal} completed`
            : "Add milestones",
        heroMeta: nextMilestone
          ? `Next: ${truncateText(nextMilestone.title, 22)}`
          : progressVal >= 100
            ? "All milestones complete"
            : "No milestone scheduled yet",
        summaryValue: getCompactValue(goal, progressVal),
        statusLabel: needsAttention
          ? "Needs focus"
          : progressVal >= 100
            ? "Completed"
            : "On track",
        score,
      };
    });
  }, [categories, visibleGoals]);

  const sortedGoals = React.useMemo(
    () => [...enrichedGoals].sort((a, b) => b.score - a.score),
    [enrichedGoals],
  );

  const featuredGoal =
    sortedGoals.find((goal) => goal.id === featuredGoalId) || sortedGoals[0] || null;
  const compactGoals = featuredGoal
    ? sortedGoals.filter((goal) => goal.id !== featuredGoal.id)
    : sortedGoals;

  const activeGoalsCount = enrichedGoals.filter((goal) => goal.progressVal < 100).length;
  const needsAttentionCount = enrichedGoals.filter((goal) => goal.needsAttention).length;
  const summaryProgress = Math.round(
    visibleGoals.length === 0
      ? 0
      : (activeGoalsCount / Math.max(visibleGoals.length, 1)) * 100,
  );

  const openGoal = (goalId: string) => {
    setActiveGoalId(goalId);
    setView("detail");
  };

  const openInsights = () => {
    if (featuredGoal) {
      setActiveGoalId(featuredGoal.id);
    }
    setView("goal-insights");
  };

  return (
    <motion.div
      key="goals"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen bg-[#090b0f] px-2 pb-36 pt-4 text-white md:px-8 md:pb-10"
    >
      <div className="relative mx-auto w-full max-w-5xl pb-24">
          <header className="relative flex h-[76px] items-center justify-between px-2">
            <button
              type="button"
              aria-label="Menu"
              className="flex h-11 w-11 items-center justify-center rounded-full text-white/85"
            >
              <span className="relative block h-4 w-5">
                <span className="absolute left-0 top-0 h-[1.5px] w-5 rounded-full bg-white/80" />
                <span className="absolute left-0 top-[6px] h-[1.5px] w-3.5 rounded-full bg-white/55" />
              </span>
            </button>

            <h1 className="text-[21px] font-bold tracking-[-0.02em] text-white/92">
              Goals
            </h1>

            <button
              type="button"
              onClick={() => setIsAddingGoal(true)}
              aria-label="Add goal"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.12] bg-[linear-gradient(180deg,rgba(133,154,193,0.22),rgba(62,80,115,0.16))] text-white/90 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-md"
            >
              <Plus className="h-[18px] w-[18px]" />
            </button>
          </header>

          <div className="space-y-[18px] px-2 pb-28 pt-[10px]">
            {visibleGoals.length === 0 ? (
              <div className="rounded-[24px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(47,61,88,0.36),rgba(20,28,43,0.34))] px-6 py-12 text-center shadow-[0_16px_36px_-20px_rgba(0,0,0,0.7)]">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03]">
                  <Target className="h-8 w-8 text-white/78" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-white">
                  No goals yet
                </h3>
                <p className="mx-auto mt-2 max-w-[240px] text-sm leading-relaxed text-white/58">
                  Create your first goal to bring this screen to life.
                </p>
              </div>
            ) : (
              <>
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={openInsights}
                  className={`relative flex h-[82px] w-full items-center gap-[14px] overflow-hidden rounded-[14px] px-4 text-left backdrop-blur-[18px] ${cardSurface}`}
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_8%,rgba(255,255,255,0.06),transparent_24%)]" />
                  <div className="relative flex h-[42px] w-[42px] shrink-0 items-center justify-center">
                    <svg className="h-[42px] w-[42px] -rotate-90" viewBox="0 0 44 44">
                      <circle
                        cx="22"
                        cy="22"
                        r="19"
                        fill="none"
                        stroke="rgba(82,99,126,0.75)"
                        strokeWidth="4.2"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="19"
                        fill="none"
                        stroke="url(#summaryRing)"
                        strokeWidth="4.2"
                        strokeLinecap="round"
                        strokeDasharray={`${(summaryProgress / 100) * SUMMARY_RING} ${SUMMARY_RING}`}
                      />
                      <defs>
                        <linearGradient id="summaryRing" x1="0" y1="0" x2="1" y2="1">
                          <stop stopColor="#87c4ff" />
                          <stop offset="1" stopColor="#57a6ff" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <div className="relative min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42">
                      Goal Insights
                    </p>
                    <p className="text-[15px] font-semibold text-white/90">
                      {activeGoalsCount} active / {visibleGoals.length} total
                    </p>
                    <p className="mt-1 truncate text-[13px] text-white/66">
                      {needsAttentionCount > 0
                        ? `${needsAttentionCount} goal${needsAttentionCount === 1 ? "" : "s"} need attention today`
                        : "Everything looks under control today"}
                    </p>
                  </div>

                  <ChevronRight className="relative h-[18px] w-[18px] shrink-0 text-white/55" />
                </motion.button>

                {featuredGoal && (
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 }}
                    onClick={() => openGoal(featuredGoal.id)}
                    className={`relative overflow-hidden rounded-[16px] px-4 py-4 backdrop-blur-[20px] ${cardSurface}`}
                  >
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background: `radial-gradient(circle at 82% 14%, ${featuredGoal.accent}10 0%, transparent 22%), linear-gradient(180deg, transparent, rgba(4,8,15,0.1))`,
                      }}
                    />

                    <div className="relative flex min-h-[104px] items-center gap-3">
                      <div className="relative flex h-[104px] w-[104px] shrink-0 items-center justify-center">
                        <div
                          className="absolute inset-[14px] rounded-full blur-[18px]"
                          style={{ backgroundColor: `${featuredGoal.accent}14` }}
                        />
                        <svg className="relative h-[104px] w-[104px] -rotate-90" viewBox="0 0 120 120">
                          <circle
                            cx="60"
                            cy="60"
                            r="51"
                            fill="none"
                            stroke="rgba(66,83,108,0.95)"
                            strokeWidth="10"
                          />
                          <motion.circle
                            cx="60"
                            cy="60"
                            r="51"
                            fill="none"
                            stroke={featuredGoal.accent}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={HERO_RING}
                            initial={{ strokeDashoffset: HERO_RING }}
                            animate={{
                              strokeDashoffset:
                                HERO_RING - (HERO_RING * featuredGoal.progressVal) / 100,
                            }}
                            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                              filter: `drop-shadow(0 0 10px ${featuredGoal.accent}28)`,
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span
                            className={`font-extrabold leading-none text-white ${
                              featuredGoal.progressVal >= 100
                                ? "text-[20px] tracking-[-0.03em]"
                                : "text-[24px] tracking-[-0.04em]"
                            }`}
                          >
                            {featuredGoal.progressVal}%
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 pr-1">
                        <h2
                          className="overflow-hidden text-[20px] font-bold leading-[1.05] tracking-[-0.03em] text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
                          title={featuredGoal.title}
                        >
                          {featuredGoal.title}
                        </h2>
                        <p className="mt-1.5 text-[14px] font-medium text-white/82">
                          {featuredGoal.progressVal}% Complete
                        </p>
                        <div className="mt-2 h-px w-full bg-white/[0.12]" />
                        <p
                          className="mt-2 overflow-hidden text-[13px] leading-[1.35] text-white/76 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
                          title={featuredGoal.heroMeta}
                        >
                          {featuredGoal.heroMeta}
                        </p>
                        <p className="mt-1.5 text-[13px] text-white/62">
                          {featuredGoal.dueText}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <section className="pt-1">
                  <h3 className="px-[1px] text-[16px] font-bold tracking-tight text-white/92">
                    Your Goals
                  </h3>

                  <div className="mt-[10px] space-y-2.5">
                    {compactGoals.map((goal, index) => (
                      <motion.button
                        key={goal.id}
                        type="button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + index * 0.03 }}
                        onClick={() => openGoal(goal.id)}
                        className={`relative flex min-h-[70px] w-full items-start gap-2.5 overflow-hidden rounded-[15px] px-4 py-[11px] text-left backdrop-blur-[15px] ${cardSurface}`}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_8%,rgba(255,255,255,0.04),transparent_22%)]" />
                        <div
                          className="relative mt-[2px] flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-[6px] border border-white/[0.04]"
                          style={{ backgroundColor: `${goal.accent}14` }}
                        >
                          <span
                            className="block h-[7px] w-[7px] rounded-[3px]"
                            style={{ backgroundColor: goal.accent }}
                          />
                        </div>

                        <div className="relative min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-[14px] font-semibold tracking-[-0.01em] text-white/90">
                              {goal.title}
                            </p>
                            <span className="shrink-0 text-[14px] font-semibold text-white/80">
                              {goal.summaryValue}
                            </span>
                          </div>

                          <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-[#334056]">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${goal.progressVal}%` }}
                              transition={{ duration: 0.8, delay: 0.08 + index * 0.03 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: goal.accent }}
                            />
                          </div>

                          <div className="mt-[9px] flex items-center justify-between gap-3 text-[11px] text-white/64">
                            <p className="truncate">{goal.compactMetaLeft}</p>
                            <p className="shrink-0">{goal.compactDueText}</p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
      </div>
    </motion.div>
  );
}
