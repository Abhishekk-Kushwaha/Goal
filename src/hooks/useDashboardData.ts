import { useMemo } from "react";
import { format, startOfDay } from "date-fns";
import { isCompletedOnDate, isDueOnDate, type Category, type Goal } from "../storage";

export function useDashboardData({
  goals,
  categories,
  allCalendarItems,
  activeGoalId,
}: {
  goals: Goal[];
  categories: Category[];
  allCalendarItems: any[];
  activeGoalId: string | null;
}) {
  const activeGoal = useMemo(
    () => goals.find((g) => g.id === activeGoalId),
    [goals, activeGoalId],
  );

  const stats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((g) => g.progress === 100).length;
    const avgProgress = total
      ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / total)
      : 0;
    const totalMilestones = goals.reduce(
      (acc, g) => acc + (g.milestones || []).length,
      0,
    );
    const completedMilestones = goals.reduce(
      (acc, g) =>
        acc +
        (g.milestones || []).filter((m) => m.done).length,
      0,
    );

    return {
      total,
      completed,
      avgProgress,
      totalMilestones,
      completedMilestones,
    };
  }, [goals]);

  const chartData = useMemo(() => {
    return goals
      .map((g) => ({
        name: g.title.length > 15 ? g.title.substring(0, 12) + "..." : g.title,
        progress: g.progress,
        color: (
          categories.find((c) => c.name === g.category) || { color: "#64748b" }
        ).color,
      }))
      .slice(0, 8);
  }, [goals, categories]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    goals.forEach((g) => {
      counts[g.category] = (counts[g.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: (categories.find((c) => c.name === name) || { color: "#64748b" })
        .color,
    }));
  }, [goals, categories]);

  const trendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    return last7Days.map((date) => {
      const items = allCalendarItems
        .filter((item) => isDueOnDate(item, date))
        .map((item) => ({
          ...item,
          done: isCompletedOnDate(item, date),
        }));

      const count = items.filter((m) => m.done).length;
      return { name: format(date, "MMM dd"), completions: count };
    });
  }, [allCalendarItems]);

  const productivityInsights = useMemo(() => {
    const totalCompletions = trendData.reduce((sum, d) => sum + d.completions, 0);
    const avgCompletions = totalCompletions / trendData.length;
    const peakDay = [...trendData].sort((a, b) => b.completions - a.completions)[0];

    let insight =
      "Keep pushing! Completing milestones consistently builds momentum.";
    if (totalCompletions > 5) {
      insight = "You're on a roll! Your productivity is trending upwards.";
    }
    if (avgCompletions > 1) {
      insight =
        "Great consistency! You're averaging more than one milestone per day.";
    }

    return {
      total: totalCompletions,
      avg: avgCompletions.toFixed(1),
      peak: peakDay.name,
      peakValue: peakDay.completions,
      message: insight,
    };
  }, [trendData]);

  const repeatabilityData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    return last7Days.map((day) => {
      const dayStr = format(day, "MMM dd");
      let completed = 0;
      let missed = 0;

      allCalendarItems.forEach((item) => {
        if (item.repeat && item.repeat !== "None") {
          if (isDueOnDate(item, day)) {
            if (isCompletedOnDate(item, day)) {
              completed++;
            } else if (startOfDay(day) <= startOfDay(new Date())) {
              missed++;
            }
          }
        }
      });

      return { name: dayStr, Completed: completed, Missed: missed };
    });
  }, [allCalendarItems]);

  return {
    activeGoal,
    stats,
    chartData,
    categoryData,
    trendData,
    productivityInsights,
    repeatabilityData,
  };
}
