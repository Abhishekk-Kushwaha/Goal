import React from "react";
import {
  eachDayOfInterval,
  endOfYear,
  format,
  parseISO,
  startOfDay,
  startOfYear,
} from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import {
  Archive,
  Calendar,
  CheckCircle,
  ChevronRight,
  Download,
  LogOut,
  User,
  X,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { cn } from "../lib/utils";
import type { Category, Goal, Habit } from "../storage";
import type { ViewType } from "../hooks/useAppRouter";

type ProfileWidget = {
  id: "stats" | "progress";
  label: string;
  visible: boolean;
};

type ProfileStats = {
  total: number;
  completed: number;
  avgProgress: number;
  totalMilestones: number;
  completedMilestones: number;
};

type ProfileChartItem = {
  name: string;
  progress: number;
  color: string;
};

type ProfileDayItem = {
  done?: boolean;
};

type ProfileViewProps = {
  setView: React.Dispatch<React.SetStateAction<ViewType>>;
  setIsCustomizingLayout: React.Dispatch<React.SetStateAction<boolean>>;
  session: { user?: { email?: string | null; created_at?: string | null } } | null;
  supabase: { auth: { signOut: () => Promise<unknown> } } | null;
  theme: string;
  currentDate: Date;
  dashboardLayout: ProfileWidget[];
  stats: ProfileStats;
  chartData: ProfileChartItem[];
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

export function ProfileView(props: ProfileViewProps) {
  const {
    setView,
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
    getItemsForDate,
  } = props;

  const archivedItemCount = archivedGoals.length + archivedHabits.length;
  const archivedItemLabel = `${archivedItemCount} ${archivedItemCount === 1 ? "item" : "items"}`;
  const [isAccountMenuOpen, setIsAccountMenuOpen] = React.useState(false);
  const [isYearCardFlipped, setIsYearCardFlipped] = React.useState(false);
  const accountMenuRef = React.useRef<HTMLDivElement | null>(null);
  const userEmail = session?.user?.email || "Welcome back";

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

  React.useEffect(() => {
    if (!isAccountMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAccountMenuOpen]);

  return (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 md:p-8 max-w-6xl mx-auto w-full"
            >
              <header className="mb-8 flex flex-wrap items-center justify-end gap-2 md:mb-10">
                <div className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto">
                  <div className="flex h-10 items-center gap-2 rounded-[9px] border dark:border-white/[0.07] border-stone-200 dark:bg-white/[0.035] bg-stone-100 px-3 text-sm font-medium dark:text-white/58 text-stone-600">
                    <Calendar className="h-4 w-4 dark:text-white/38 text-stone-500" />
                    <span className="whitespace-nowrap">
                      {format(currentDate, "EEEE, MMM do")}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={requestInstallApp}
                    className={cn(
                      "flex h-10 items-center gap-2 rounded-[9px] border px-3 text-sm font-semibold transition-colors",
                      isAppInstalled
                        ? "border-emerald-300/14 bg-emerald-400/[0.07] text-emerald-200/82"
                        : "border-white/[0.07] bg-white/[0.035] text-white/62 hover:bg-white/[0.055] hover:text-white/84",
                    )}
                  >
                    {isAppInstalled ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span>{isAppInstalled ? "Installed" : "Install"}</span>
                  </button>

                  {supabase && session && (
                    <div ref={accountMenuRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setIsAccountMenuOpen((open) => !open)}
                        aria-label="Open account menu"
                        aria-expanded={isAccountMenuOpen}
                        className="flex h-10 w-10 items-center justify-center rounded-[9px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.065),rgba(255,255,255,0.025))] text-sm font-bold uppercase text-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors hover:bg-white/[0.07] hover:text-white"
                      >
                        <User className="h-4 w-4" />
                      </button>

                      {isAccountMenuOpen && (
                        <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[236px] overflow-visible">
                          <div className="absolute right-3 top-[-5px] h-2.5 w-2.5 rotate-45 border-l border-t border-white/[0.08] bg-[#11161c]" />
                          <div className="overflow-hidden rounded-[12px] border border-white/[0.08] bg-[#11161c]/95 shadow-[0_24px_70px_-42px_rgba(0,0,0,1)] backdrop-blur-xl">
                            <div className="border-b border-white/[0.06] p-3.5">
                              <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-[9px] border border-white/[0.07] bg-white/[0.04] text-white/68">
                                <User className="h-4 w-4" />
                              </div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                                Signed in as
                              </p>
                              <p className="mt-1 truncate text-sm font-semibold text-white/82">
                                {userEmail}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setIsAccountMenuOpen(false);
                                void supabase.auth.signOut();
                              }}
                              className="flex h-11 w-full items-center gap-3 px-3.5 text-left text-sm font-semibold text-rose-200/82 transition-colors hover:bg-rose-400/[0.08] hover:text-rose-100"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </header>

              <Card
                className="mb-6 overflow-hidden border border-emerald-200/10 bg-[radial-gradient(circle_at_16%_0%,rgba(52,211,153,0.14),transparent_34%),radial-gradient(circle_at_88%_8%,rgba(249,115,22,0.1),transparent_30%),linear-gradient(145deg,rgba(18,22,26,0.98),rgba(8,10,13,0.99))] shadow-[0_28px_80px_-48px_rgba(52,211,153,0.58)]"
                delay={0.16}
              >
                <motion.div
                  role="button"
                  tabIndex={0}
                  aria-pressed={isYearCardFlipped}
                  initial={false}
                  animate={{
                    rotateY: isYearCardFlipped ? [0, 88, 0] : [0, -88, 0],
                    opacity: [1, 0.72, 1],
                    scale: [1, 0.985, 1],
                  }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setIsYearCardFlipped((flipped) => !flipped)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setIsYearCardFlipped((flipped) => !flipped);
                    }
                  }}
                  className="min-h-[260px] cursor-pointer outline-none [transform-style:preserve-3d]"
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
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/28">
                        {isYearCardFlipped ? "Back to chart" : "Tap for details"}
                      </p>
                      {isYearCardFlipped && (
                        <p className="mt-1 max-w-xl text-[13px] font-medium leading-relaxed text-white/38">
                          Every dot mirrors the same daily completion logic used in Today. Blank days before signup and future dates stay visible but muted.
                        </p>
                      )}
                    </div>
                    <div className={cn("grid-cols-3 gap-2 sm:min-w-[360px]", isYearCardFlipped ? "grid" : "hidden")}>
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
                  <div className={cn("overflow-x-auto pb-2 custom-scrollbar", isYearCardFlipped && "hidden")}>
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

                  <div className={cn("mt-4 flex-col gap-3 border-t border-white/[0.055] pt-4 sm:flex-row sm:items-center sm:justify-between", isYearCardFlipped ? "flex" : "hidden")}>
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
                </motion.div>
              </Card>

              <Card
                className="overflow-hidden border border-white/[0.07] bg-[linear-gradient(145deg,rgba(17,21,24,0.98),rgba(8,10,13,0.99))] shadow-[0_20px_56px_-44px_rgba(0,0,0,1)]"
                delay={0.22}
              >
                <button
                  type="button"
                  onClick={() => setView("archive")}
                  className="group flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.025] md:px-5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] border border-orange-300/14 bg-orange-400/[0.08] text-orange-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      <Archive className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-[17px] font-semibold tracking-[-0.01em] text-white/88">
                          Archive
                        </h3>
                      </div>
                      <p className="mt-1 truncate text-[12px] font-medium text-white/38 sm:text-[13px]">
                        Restore deleted goals and habits within 15 days.
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="rounded-[9px] border border-orange-300/14 bg-orange-400/[0.06] px-2.5 py-1 text-[11px] font-bold text-orange-200/82">
                      {archivedItemLabel}
                    </span>
                    <ChevronRight
                      className="h-5 w-5 text-white/42 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white/62"
                    />
                  </div>
                </button>
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
