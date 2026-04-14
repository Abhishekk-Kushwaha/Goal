import React, { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { type Goal } from "../storage";

const uid = () => crypto.randomUUID();

type TodayItem = any;

type UseTodayOptions = {
  allCalendarItems: TodayItem[];
  goals: Goal[];
  getItemsForDate: (date: Date) => TodayItem[];
  toggleHabitOptimistic: (id: string, date?: string) => void | Promise<void>;
  toggleGoalCompletionOptimistic: (
    id: string,
    date?: string,
  ) => void | Promise<void>;
  toggleMilestone: (id: string, date?: string) => void | Promise<void>;
  setDismissedConquered?: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useToday({
  allCalendarItems,
  goals,
  getItemsForDate,
  toggleHabitOptimistic,
  toggleGoalCompletionOptimistic,
  toggleMilestone,
  setDismissedConquered,
}: UseTodayOptions) {
  const [yesterdayProgress, setYesterdayProgress] = useState<number>(() => {
    const saved = localStorage.getItem("gf_yesterday_progress");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [barPulse, setBarPulse] = useState(false);
  const [lastCompleted, setLastCompleted] = useState<string | null>(null);
  const [showBreather, setShowBreather] = useState(false);
  const [breatherMessage, setBreatherMessage] = useState("");
  const [breatherTimeout, setBreatherTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [slidingOut, setSlidingOut] = useState<Set<string>>(new Set());
  const [floatingPoints, setFloatingPoints] = useState<
    { id: string; points: number; x: number; y: number }[]
  >([]);

  const todayMilestones = useMemo(() => {
    return getItemsForDate(new Date());
  }, [getItemsForDate, allCalendarItems]);

  const todayCompletedCount = useMemo(() => {
    return todayMilestones.filter((m) => m.done).length;
  }, [todayMilestones]);

  const todayTotalCount = useMemo(() => {
    return todayMilestones.length;
  }, [todayMilestones]);

  const todayProgress = useMemo(() => {
    if (todayTotalCount === 0) return 0;
    return Math.round((todayCompletedCount / todayTotalCount) * 100);
  }, [todayCompletedCount, todayTotalCount]);

  useEffect(() => {
    if (todayProgress < 100) {
      setDismissedConquered?.(false);
    }
  }, [todayProgress, setDismissedConquered]);

  const highestStreak = useMemo(() => {
    return Math.max(0, ...goals.map((g) => g.streak));
  }, [goals]);

  const yesterdayCompletedCount = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return getItemsForDate(yesterday).filter((m) => m.done).length;
  }, [getItemsForDate, allCalendarItems]);

  const personalBest = useMemo(() => {
    const counts: Record<string, number> = {};

    allCalendarItems.forEach((item) => {
      if (!item.repeat || item.repeat === "None") {
        if (item.done && item.completed_at) {
          const dateStr = new Date(item.completed_at).toDateString();
          counts[dateStr] = (counts[dateStr] || 0) + 1;
        }
      } else if (item.completed_dates) {
        item.completed_dates.forEach((d: string) => {
          const dateStr = new Date(d).toDateString();
          counts[dateStr] = (counts[dateStr] || 0) + 1;
        });
      }
    });

    let bestCount = 0;
    let bestDate = "";

    Object.entries(counts).forEach(([date, count]) => {
      if (count > bestCount) {
        bestCount = count;
        bestDate = date;
      }
    });

    return { count: bestCount, date: bestDate };
  }, [allCalendarItems]);

  useEffect(() => {
    const lastDate = localStorage.getItem("gf_last_date");
    const todayStr = new Date().toDateString();

    if (lastDate && lastDate !== todayStr) {
      const lastProgress = localStorage.getItem("gf_today_progress") || "0";
      localStorage.setItem("gf_yesterday_progress", lastProgress);
      setYesterdayProgress(parseInt(lastProgress, 10));
    }
    localStorage.setItem("gf_last_date", todayStr);
  }, []);

  useEffect(() => {
    localStorage.setItem("gf_today_progress", todayProgress.toString());
  }, [todayProgress]);

  const getHeroTheme = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12)
      return {
        label: "FRESH START",
        bg: "linear-gradient(135deg, #0f766e 0%, #064e3b 100%)",
        msg: "Today is yours.",
      };
    if (h >= 12 && h < 17)
      return {
        label: "STAY FOCUSED",
        bg: "linear-gradient(135deg, #4338ca 0%, #312e81 100%)",
        msg: "You're in the zone. Keep pushing.",
      };
    if (h >= 17 && h < 22)
      return {
        label: "FINISH STRONG",
        bg: "linear-gradient(135deg, #b45309 0%, #78350f 100%)",
        msg: "The day isn't over yet. Finish strong.",
      };
    return {
      label: "ONE LAST PUSH",
      bg: "linear-gradient(135deg, #991b1b 0%, #450a0a 100%)",
      msg: "Don't carry this to tomorrow.",
    };
  };

  const getHypeText = (completed: number, total: number) => {
    if (total === 0) return "Schedule is clear";
    if (completed === 0) return "Ready to crush it today?";
    if (completed === total) return "You're unstoppable! All done.";
    if (completed / total >= 0.5) return "Great start! Keep it up.";
    return "You're on your way.";
  };

  const getStreakMessage = () => {
    if (highestStreak === 0) return "Start your streak today!";
    if (highestStreak < 3) return "You're building momentum!";
    if (highestStreak < 7) return "You're on fire! Keep it going.";
    if (highestStreak < 30) return "Incredible consistency!";
    return "You are unstoppable!";
  };

  const getTaskPoints = (_task: TodayItem) => {
    if (todayMilestones.length === 0) return 0;
    return Math.round(100 / todayMilestones.length);
  };

  const getBarColor = (progress: number) => {
    if (progress <= 33) return "#EF4444";
    if (progress <= 66) return "#F59E0B";
    if (progress < 100) return "#22C55E";
    return "#C8F55A";
  };

  const handleToggleToday = async (ms: TodayItem) => {
    const targetDate = new Date();
    const isCompleting = !ms.done;

    if (ms.isHabit) {
      toggleHabitOptimistic(ms.id, targetDate.toISOString());
    } else if (ms.isGoalAsMilestone) {
      toggleGoalCompletionOptimistic(ms.id, targetDate.toISOString());
    } else {
      toggleMilestone(ms.id, targetDate.toISOString());
    }

    const doneCount = todayMilestones.filter((m) => m.done).length;
    if (
      isCompleting &&
      doneCount + 1 === todayMilestones.length &&
      todayMilestones.length > 0
    ) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#34d399", "#6ee7b7"],
      });
    }
  };

  const handleArenaComplete = async (
    task: TodayItem,
    e?: React.MouseEvent | TouchEvent | PointerEvent,
  ) => {
    if (!task.done) {
      setBarPulse(true);
      setTimeout(() => setBarPulse(false), 300);

      const points = getTaskPoints(task);
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;

      if (e && e.currentTarget instanceof HTMLElement) {
        const rect = e.currentTarget.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top;
      }

      const newPoint = { id: uid(), points, x, y };
      setFloatingPoints((prev) => [...prev, newPoint]);
      setTimeout(() => {
        setFloatingPoints((prev) => prev.filter((p) => p.id !== newPoint.id));
      }, 1000);

      const messages = [
        "One down. You're moving.",
        "That's the momentum. Next.",
        "Streak intact. Keep going.",
        "Clean. Next challenge.",
        "Locked in. What's next?",
      ];
      setBreatherMessage(messages[Math.floor(Math.random() * messages.length)]);
      setLastCompleted(task.title);

      // Immediately complete the task — no delay
      handleToggleToday(task);

      // Show non-blocking toast
      setShowBreather(true);
      if (breatherTimeout) clearTimeout(breatherTimeout);
      const timeoutId = setTimeout(() => {
        setShowBreather(false);
        setBreatherTimeout(null);
      }, 3000);
      setBreatherTimeout(timeoutId);
    } else {
      handleToggleToday(task);
    }
  };

  return {
    todayMilestones,
    todayCompletedCount,
    todayTotalCount,
    todayProgress,
    highestStreak,
    yesterdayCompletedCount,
    personalBest,
    yesterdayProgress,
    barPulse,
    showBreather,
    breatherMessage,
    floatingPoints,
    slidingOut,
    lastCompleted,
    breatherTimeout,
    setYesterdayProgress,
    setBarPulse,
    setShowBreather,
    setBreatherMessage,
    setFloatingPoints,
    setSlidingOut,
    setLastCompleted,
    setBreatherTimeout,
    getHeroTheme,
    getHypeText,
    getStreakMessage,
    getBarColor,
    getTaskPoints,
    handleToggleToday,
    handleArenaComplete,
  };
}
