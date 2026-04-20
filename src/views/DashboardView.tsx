import React from "react";
import {
  eachDayOfInterval,
  endOfYear,
  format,
  isAfter,
  parseISO,
  startOfDay,
  startOfYear,
  subDays,
} from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import {
  Archive,
  Calendar,
  RotateCcw,
  Target,
  X,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { cn } from "../lib/utils";
import type { Category, Goal, Habit } from "../storage";

type DashboardWidget = {
  id: "stats" | "progress";
  label: string;
  visible: boolean;
};

type DashboardStats = {
  total: number;
  completed: number;
  avgProgress: number;
  totalMilestones: number;
  completedMilestones: number;
};

type DashboardChartItem = {
  name: string;
  progress: number;
  color: string;
};

type ProfileDayItem = {
  done?: boolean;
};

type DashboardViewProps = {
  setIsCustomizingLayout: React.Dispatch<React.SetStateAction<boolean>>;
  session: { user?: { email?: string | null; created_at?: string | null } } | null;
  supabase: { auth: { signOut: () => Promise<unknown> } } | null;
  theme: string;
  currentDate: Date;
  dashboardLayout: DashboardWidget[];
  stats: DashboardStats;
  chartData: DashboardChartItem[];
  requestInstallApp: () => void;
  showInstallHelp: boolean;
  setShowInstallHelp: React.Dispatch<React.SetStateAction<boolean>>;
  installPlatform: "prompt" | "ios" | "manual" | "installed";
  isAppInstalled: boolean;
  archivedGoals: Goal[];
  archivedHabits: Habit[];
  categories: Category[];
  handleRestoreGoal: (id: string) => Promise<void>;
  handleRestoreHabit: (id: string) => Promise<void>;
  getItemsForDate: (date: Date) => ProfileDayItem[];
};

function getHeatmapDotClass(progress: number, isMuted: boolean, hasWork: boolean) {
  if (isMuted) {
    return "border-white/[0.045] bg-white/[0.025] opacity-45";
  }

  if (!hasWork) {
    return "border-white/[0.055] bg-white/[0.04]";
  }

  if (progress >= 100) {
    return "border-emerald-200/45 bg-emerald-300 shadow-[0_0_11px_rgba(52,211,153,0.44)]";
  }

  if (progress >= 67) {
    return "border-emerald-300/34 bg-emerald-400/70 shadow-[0_0_9px_rgba(52,211,153,0.25)]";
  }

  if (progress >= 34) {
    return "border-amber-300/32 bg-amber-300/65 shadow-[0_0_8px_rgba(245,158,11,0.2)]";
  }

  return "border-orange-300/28 bg-orange-400/42";
}

export function DashboardView(props: DashboardViewProps) {
  const {
    session,
    supabase,
    currentDate,
    requestInstallApp,
    showInstallHelp,
    setShowInstallHelp,
    installPlatform,
    isAppInstalled,
    archivedGoals,
    archivedHabits,
    categories,
    handleRestoreGoal,
    handleRestoreHabit,
    getItemsForDate,
  } = props;

  const categoryByName = React.useMemo(() => {
    return new Map(categories.map((category) => [category.name, category]));
  }, [categories]);

  const archiveWindowStart = React.useMemo(() => subDays(currentDate, 15), [currentDate]);
  const todayStart = React.useMemo(() => startOfDay(currentDate), [currentDate]);
  const signupStart = React.useMemo(() => {
    const rawSignupDate = session?.user?.created_at;
    if (!rawSignupDate) return todayStart;

    const parsedSignupDate = parseISO(rawSignupDate);
    return Number.isNaN(parsedSignupDate.getTime())
      ? todayStart
      : startOfDay(parsedSignupDate);
  }, [session?.user?.created_at, todayStart]);

  const heatmapDays = React.useMemo(() => {
    const yearDays = eachDayOfInterval({
      start: startOfYear(currentDate),
      end: endOfYear(currentDate),
    });

    return yearDays.map((day) => {
      const normalizedDay = startOfDay(day);
      const items = getItemsForDate(normalizedDay);
      const completed = items.filter((item) => item.done).length;
      const total = items.length;
      const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
      const isBeforeSignup = normalizedDay.getTime() < signupStart.getTime();
      const isFuture = normalizedDay.getTime() > todayStart.getTime();

      return {
        date: normalizedDay,
        key: format(normalizedDay, "yyyy-MM-dd"),
        completed,
        total,
        progress,
        hasWork: total > 0,
        isBeforeSignup,
        isFuture,
      };
    });
  }, [currentDate, getItemsForDate, signupStart, todayStart]);

  const heatmapStats = React.useMemo(() => {
    const eligibleDays = heatmapDays.filter(
      (day) => !day.isBeforeSignup && !day.isFuture && day.hasWork,
    );
    const completedDays = eligibleDays.filter((day) => day.progress === 100).length;
    const averageProgress = eligibleDays.length
      ? Math.round(
          eligibleDays.reduce((sum, day) => sum + day.progress, 0) /
            eligibleDays.length,
        )
      : 0;
    const totalCompletedItems = eligibleDays.reduce(
      (sum, day) => sum + day.completed,
      0,
    );

    return {
      completedDays,
      averageProgress,
      totalCompletedItems,
      activeDays: eligibleDays.length,
    };
  }, [heatmapDays]);

  const getRecentCompletionCount = (habit: Habit) => {
    return (habit.completed_dates || []).filter((date) => {
      const completedDate = parseISO(date);
      return isAfter(completedDate, archiveWindowStart);
    }).length;
  };

  const getRecentGoalPerformanceCount = (goal: Goal) => {
    const goalRepeats = (goal.completed_dates || []).filter((date) =>
      isAfter(parseISO(date), archiveWindowStart),
    ).length;

    const milestoneCompletions = goal.milestones.reduce((count, milestone) => {
      if (milestone.repeat && milestone.repeat !== "None") {
        return count + (milestone.completed_dates || []).filter((date) =>
          isAfter(parseISO(date), archiveWindowStart),
        ).length;
      }

      if (milestone.done && milestone.completed_at) {
        return isAfter(parseISO(milestone.completed_at), archiveWindowStart)
          ? count + 1
          : count;
      }

      return count;
    }, 0);

    return goalRepeats + milestoneCompletions;
  };

  return (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 md:p-8 max-w-6xl mx-auto w-full"
            >
              <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold font-mono-nums dark:text-white text-stone-900 tracking-tight mb-2">
                    Profile
                  </h2>
                  <p className="dark:text-stone-400 dark:text-stone-500 text-stone-600 text-sm">
                    {session?.user?.email || "Welcome back"}
                  </p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <button
                    onClick={requestInstallApp}
                    className={cn(
                      "px-4 py-2 rounded-xl border transition-colors flex items-center gap-2 text-sm font-medium",
                      isAppInstalled
                        ? "dark:bg-emerald-500/10 bg-emerald-50 border-emerald-400/20 text-emerald-400"
                        : "dark:bg-sky-500/10 bg-sky-50 border-sky-400/20 text-sky-400 hover:dark:bg-sky-500/15 hover:bg-sky-100",
                    )}
                  >
                    <span>{isAppInstalled ? "App Installed" : "Install App"}</span>
                  </button>
                  {supabase && session && (
                    <button
                      onClick={() => supabase.auth.signOut()}
                      className="p-2 dark:bg-rose-500/10 bg-rose-50 border dark:border-rose-500/20 border-rose-200 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  )}
                  <div className="px-4 py-2 dark:bg-white/5 bg-stone-100 border dark:border-white/5 border-stone-200 rounded-xl flex items-center gap-3">
                    <Calendar className="w-4 h-4 dark:text-stone-500 text-stone-600" />
                    <span className="text-sm font-medium dark:text-stone-300 text-stone-700">
                      {format(currentDate, "EEEE, MMM do")}
                    </span>
                  </div>
                </div>
              </header>

              <Card
                className="mb-6 overflow-hidden border border-emerald-200/10 bg-[radial-gradient(circle_at_16%_0%,rgba(52,211,153,0.14),transparent_34%),radial-gradient(circle_at_88%_8%,rgba(249,115,22,0.1),transparent_30%),linear-gradient(145deg,rgba(18,22,26,0.98),rgba(8,10,13,0.99))] shadow-[0_28px_80px_-48px_rgba(52,211,153,0.58)]"
                delay={0.16}
              >
                <div className="border-b border-white/[0.06] px-4 py-4 md:px-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-200/58">
                        Year Progress
                      </p>
                      <h3 className="mt-2 text-[24px] font-extrabold tracking-tight text-white md:text-[28px]">
                        {format(currentDate, "yyyy")} at a glance
                      </h3>
                      <p className="mt-1 max-w-xl text-[13px] font-medium leading-relaxed text-white/38">
                        Every dot mirrors the same daily completion logic used in Today. Blank days before signup and future dates stay visible but muted.
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
                      {[
                        {
                          label: "Complete days",
                          value: `${heatmapStats.completedDays}/${heatmapStats.activeDays}`,
                        },
                        {
                          label: "Avg progress",
                          value: `${heatmapStats.averageProgress}%`,
                        },
                        {
                          label: "Wins logged",
                          value: heatmapStats.totalCompletedItems,
                        },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-[10px] border border-white/[0.06] bg-white/[0.035] px-3 py-2"
                        >
                          <p className="truncate text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">
                            {stat.label}
                          </p>
                          <p className="mt-1 text-[18px] font-extrabold tabular-nums text-white/84">
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-5">
                  <div className="overflow-x-auto pb-2 custom-scrollbar">
                    <div className="min-w-[760px]">
                      <div
                        className="grid grid-flow-col grid-rows-7 gap-[5px]"
                        style={{
                          gridTemplateColumns: `repeat(${Math.ceil(
                            heatmapDays.length / 7,
                          )}, minmax(0, 1fr))`,
                        }}
                      >
                        {heatmapDays.map((day) => {
                          const isMuted = day.isBeforeSignup || day.isFuture;
                          const title = `${format(day.date, "MMM d, yyyy")} - ${
                            isMuted
                              ? day.isBeforeSignup
                                ? "Before signup"
                                : "Future date"
                              : day.hasWork
                                ? `${day.completed}/${day.total} complete (${day.progress}%)`
                                : "No tasks scheduled"
                          }`;

                          return (
                            <span
                              key={day.key}
                              title={title}
                              aria-label={title}
                              className={cn(
                                "h-[9px] w-[9px] rounded-full border transition-transform duration-150 hover:scale-[1.75]",
                                getHeatmapDotClass(day.progress, isMuted, day.hasWork),
                              )}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.055] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-white/34">
                      <span>Less</span>
                      {[0, 25, 50, 75, 100].map((progress) => (
                        <span
                          key={progress}
                          className={cn(
                            "h-[9px] w-[9px] rounded-full border",
                            getHeatmapDotClass(progress, false, progress > 0),
                          )}
                        />
                      ))}
                      <span>More</span>
                    </div>
                    <p className="text-[11px] font-medium text-white/30">
                      {heatmapDays.length} days shown · starts from {format(signupStart, "MMM d")}
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                className="overflow-hidden border border-orange-300/12 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.13),transparent_34%),linear-gradient(145deg,rgba(18,21,25,0.98),rgba(8,10,13,0.99))] shadow-[0_24px_70px_-44px_rgba(249,115,22,0.55)]"
                delay={0.22}
              >
                <div className="border-b border-white/[0.06] px-4 py-4 md:px-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Archive className="h-4 w-4 text-orange-300/86" />
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">
                          Archive
                        </h3>
                      </div>
                      <p className="mt-1 text-[12px] font-medium text-white/36">
                        Restore deleted goals and habits within 15 days.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-[9px] border border-white/[0.07] bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-white/52">
                        {archivedGoals.length} goals
                      </span>
                      <span className="rounded-[9px] border border-white/[0.07] bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-white/52">
                        {archivedHabits.length} habits
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
                  <section className="border-b border-white/[0.06] p-4 md:p-5 lg:border-b-0 lg:border-r">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-orange-300/82" />
                          <h4 className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/68">
                            Goal Archive
                          </h4>
                        </div>
                        <p className="mt-1 text-[12px] font-medium text-white/34">
                          Progress and milestones stay intact.
                        </p>
                      </div>
                      <span className="rounded-[9px] border border-white/[0.07] bg-white/[0.035] px-2.5 py-1 text-[11px] font-semibold text-white/44">
                        {archivedGoals.length}
                      </span>
                    </div>

                    {archivedGoals.length === 0 ? (
                      <div className="mt-4 rounded-[10px] border border-white/[0.06] bg-white/[0.025] px-3 py-3 text-[12px] font-medium text-white/34">
                        No archived goals right now.
                      </div>
                    ) : (
                      <div className="mt-4 grid grid-cols-1 gap-2">
                        {archivedGoals.map((goal) => {
                          const category = categoryByName.get(goal.category);
                          const performanceCount = getRecentGoalPerformanceCount(goal);
                          const completedMilestones = goal.milestones.filter((milestone) => milestone.done).length;
                          return (
                            <div
                              key={goal.id}
                              className="flex flex-col gap-3 rounded-[10px] border border-white/[0.06] bg-white/[0.025] p-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border text-[15px]"
                                  style={{
                                    backgroundColor: `${category?.color || "#f97316"}18`,
                                    borderColor: `${category?.color || "#f97316"}44`,
                                  }}
                                >
                                  {category?.icon || "*"}
                                </div>
                                <div className="min-w-0">
                                  <h5 className="truncate text-[14px] font-semibold text-white/86">
                                    {goal.title}
                                  </h5>
                                  <p className="mt-0.5 truncate text-[11px] font-medium text-white/36">
                                    {goal.category} / {goal.progress}% progress / {completedMilestones}/{goal.milestones.length} milestones
                                  </p>
                                  <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-white/26">
                                    {performanceCount} recent wins / Until {goal.archive_expires_at ? format(parseISO(goal.archive_expires_at), "MMM d") : "soon"}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => void handleRestoreGoal(goal.id)}
                                className="h-9 shrink-0 rounded-[9px] border border-orange-300/18 bg-orange-400/10 px-3 text-[12px] font-bold text-orange-200 transition-colors hover:border-orange-200/28 hover:bg-orange-400/14"
                              >
                                <span className="flex items-center justify-center gap-1.5">
                                  <RotateCcw className="h-3.5 w-3.5" />
                                  Restore
                                </span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  <section className="p-4 md:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Archive className="h-4 w-4 text-orange-300/82" />
                          <h4 className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/68">
                            Habit Archive
                          </h4>
                        </div>
                        <p className="mt-1 text-[12px] font-medium text-white/34">
                          Completion history stays saved.
                        </p>
                      </div>
                      <span className="rounded-[9px] border border-white/[0.07] bg-white/[0.035] px-2.5 py-1 text-[11px] font-semibold text-white/44">
                        {archivedHabits.length}
                      </span>
                    </div>

                    {archivedHabits.length === 0 ? (
                      <div className="mt-4 rounded-[10px] border border-white/[0.06] bg-white/[0.025] px-3 py-3 text-[12px] font-medium text-white/34">
                        No archived habits right now.
                      </div>
                    ) : (
                      <div className="mt-4 grid grid-cols-1 gap-2">
                        {archivedHabits.map((habit) => {
                          const category = categoryByName.get(habit.category);
                          const completionCount = getRecentCompletionCount(habit);
                          return (
                            <div
                              key={habit.id}
                              className="flex flex-col gap-3 rounded-[10px] border border-white/[0.06] bg-white/[0.025] p-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border text-[15px]"
                                  style={{
                                    backgroundColor: `${habit.color || category?.color || "#f97316"}18`,
                                    borderColor: `${habit.color || category?.color || "#f97316"}44`,
                                  }}
                                >
                                  {category?.icon || "*"}
                                </div>
                                <div className="min-w-0">
                                  <h5 className="truncate text-[14px] font-semibold text-white/86">
                                    {habit.title}
                                  </h5>
                                  <p className="mt-0.5 truncate text-[11px] font-medium text-white/36">
                                    {habit.category} / {habit.repeat} / {completionCount} completions in 15 days
                                  </p>
                                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/26">
                                    Until {habit.archive_expires_at ? format(parseISO(habit.archive_expires_at), "MMM d") : "soon"}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => void handleRestoreHabit(habit.id)}
                                className="h-9 shrink-0 rounded-[9px] border border-orange-300/18 bg-orange-400/10 px-3 text-[12px] font-bold text-orange-200 transition-colors hover:border-orange-200/28 hover:bg-orange-400/14"
                              >
                                <span className="flex items-center justify-center gap-1.5">
                                  <RotateCcw className="h-3.5 w-3.5" />
                                  Restore
                                </span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>
              </Card>

              <AnimatePresence>
                {showInstallHelp && !isAppInstalled && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 18, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.98 }}
                      className="w-full max-w-md rounded-3xl border dark:border-white/10 border-stone-200 dark:bg-[#0f141d] bg-white p-6 shadow-2xl"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400">
                            Install GoalForge
                          </p>
                          <h3 className="mt-2 text-2xl font-bold dark:text-white text-stone-900">
                            Add the app to your device
                          </h3>
                        </div>
                        <button
                          onClick={() => setShowInstallHelp(false)}
                          className="rounded-xl border dark:border-white/10 border-stone-200 px-2.5 py-2 dark:text-stone-400 text-stone-500 hover:dark:text-white hover:text-stone-900 transition-colors"
                          aria-label="Close install help"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="mt-3 text-sm leading-6 dark:text-stone-400 text-stone-600">
                        {installPlatform === "ios"
                          ? "On iPhone, Safari does not show the standard install popup. Use the Share menu to add GoalForge to your home screen."
                          : "Your browser did not expose the install popup right now, but you can still install GoalForge from the browser menu."}
                      </p>

                      <div className="mt-5 rounded-2xl border dark:border-white/6 border-stone-200 dark:bg-white/[0.03] bg-stone-50 p-4">
                        {installPlatform === "ios" ? (
                          <div className="space-y-3 text-sm dark:text-stone-300 text-stone-700">
                            <p>1. Open this app in Safari.</p>
                            <p>2. Tap the Share button.</p>
                            <p>3. Tap <span className="font-semibold">Add to Home Screen</span>.</p>
                          </div>
                        ) : (
                          <div className="space-y-3 text-sm dark:text-stone-300 text-stone-700">
                            <p>1. Open the browser menu.</p>
                            <p>2. Choose <span className="font-semibold">Install app</span> or <span className="font-semibold">Add to Home screen</span>.</p>
                            <p>3. Confirm the install prompt.</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => setShowInstallHelp(false)}
                          className="rounded-full border border-sky-400/20 bg-sky-400/10 px-5 py-2.5 text-sm font-semibold text-sky-400"
                        >
                          Got it
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
  );
}
