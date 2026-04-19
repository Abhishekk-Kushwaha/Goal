import React from "react";
import { ChevronDown } from "lucide-react";
import { TaskPreviewCard } from "../components/TaskPreviewCard";

const ACCENT = "#34d399";
const ACCENT_DEEP = "#0f766e";
const AMBER = "#f59e0b";

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function TodayView(props: any) {
  const {
    motion,
    AnimatePresence,
    cn,
    format,
    setView,
    setIsFocusMode,
    handleArenaComplete,
    handleToggleToday,
    getItemsForDate,
    isFocusMode,
    todayMilestones = [],
    todayProgress = 0,
    yesterdayProgress = 0,
    todayCompletedCount = 0,
    todayTotalCount = 0,
    pendingTodayTaskKeys = new Set(),
    getTodayTaskKey,
    completedExpanded,
    setCompletedExpanded,
    showBreather,
    breatherMessage,
    lastCompleted,
    breatherTimeout,
    setBreatherTimeout,
    setShowBreather,
    X,
    Zap,
    Plus,
    CheckCircle2,
    TrendingUp,
    Trophy,
    ChevronRight,
    Flame,
    Target,
  } = props;

  const today = new Date();
  const incompleteTasks = todayMilestones.filter((task: any) => !task.done);
  const completedTasks = todayMilestones.filter((task: any) => task.done);
  const visibleTasks = incompleteTasks;
  const [previewTask, setPreviewTask] = React.useState<any | null>(null);
  const remainingCount = Math.max(todayTotalCount - todayCompletedCount, 0);
  const aheadOfYesterday = todayProgress >= yesterdayProgress;
  const focusTask = incompleteTasks[0];
  const focusTaskSaving = Boolean(
    focusTask &&
      getTodayTaskKey &&
      pendingTodayTaskKeys.has(getTodayTaskKey(focusTask)),
  );

  const weekStats = React.useMemo(() => {
    return [...Array(7)].map((_, index) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - index));
      const items = getItemsForDate(day);
      const done = items.filter((item: any) => item.done).length;
      const progress = items.length === 0 ? 0 : Math.round((done / items.length) * 100);
      return {
        day,
        progress,
        hasWork: items.length > 0,
        label: format(day, "EEEEE"),
      };
    });
  }, [format, getItemsForDate]);

  const chart = {
    width: 320,
    height: 170,
    baseline: 128,
    labelY: 154,
    minBarHeight: 38,
    maxBarHeight: 112,
    left: 23,
    step: 45.6,
  };

  const momentumPoints = weekStats.map((day, index) => {
    const visualHeight =
      chart.minBarHeight +
      (day.progress / 100) * (chart.maxBarHeight - chart.minBarHeight);
    const x = chart.left + index * chart.step;
    const y = chart.baseline - visualHeight;
    return { ...day, visualHeight, x, y };
  });

  const momentumPath = momentumPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const openFocus = () => {
    if (focusTask) setIsFocusMode(true);
  };

  const TaskIcon = ({
    color = ACCENT,
    isHabit = false,
  }: {
    color?: string;
    isHabit?: boolean;
  }) => (
    <div
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[15px] border bg-[#0b0f12]"
      style={{
        borderColor: hexToRgba(color, 0.28),
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.055), 0 0 20px ${hexToRgba(color, 0.12)}`,
      }}
    >
      <div className="absolute inset-1 rounded-[12px] bg-white/[0.025]" />
      {isHabit ? (
        <Flame className="relative h-3.5 w-3.5" style={{ color }} />
      ) : (
        <Target className="relative h-3.5 w-3.5" style={{ color }} />
      )}
    </div>
  );

  const PremiumSurface = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/[0.06] bg-[linear-gradient(145deg,rgba(22,26,30,0.96),rgba(13,16,19,0.98))] shadow-[0_18px_48px_-38px_rgba(0,0,0,1)]",
        className,
      )}
    >
      {children}
    </div>
  );

  const HeroCard = () => (
    <PremiumSurface className="p-4">
      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="whitespace-nowrap text-[25px] font-semibold leading-none tracking-[-0.02em] text-white tabular-nums">
            {todayCompletedCount}/{todayTotalCount} <span className="text-[18px] font-medium text-white/58">complete</span>
          </h1>
          <p className="mt-2 max-w-[170px] text-[13px] font-medium leading-snug text-white/34">
            {remainingCount} remaining · {aheadOfYesterday ? "Ahead of yesterday" : "Behind yesterday"}
          </p>
        </div>

        <div className="relative flex h-[84px] w-[84px] shrink-0 items-center justify-center">
          <div className="absolute inset-3 rounded-full bg-emerald-400/8 blur-xl" />
          <svg className="relative h-full w-full -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r="48"
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="10"
            />
            <circle
              cx="64"
              cy="64"
              r="48"
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="18"
            />
            <circle
              cx="64"
              cy="64"
              r="48"
              fill="none"
              stroke="url(#todayRing)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={301.59}
              strokeDashoffset={301.59 - (301.59 * todayProgress) / 100}
              style={{ filter: "drop-shadow(0 0 10px rgba(52,211,153,0.35))" }}
            />
            <defs>
              <linearGradient id="todayRing" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#d1fae5" />
                <stop offset="0.42" stopColor={ACCENT} />
                <stop offset="1" stopColor={ACCENT_DEEP} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`font-semibold text-white tabular-nums ${
                Math.round(todayProgress) >= 100
                  ? "text-[16px] tracking-[-0.01em]"
                  : "text-[21px] tracking-[-0.02em]"
              }`}
            >
              {Math.round(todayProgress)}%
            </span>
          </div>
        </div>
      </div>
    </PremiumSurface>
  );

  const MomentumCard = () => (
    <PremiumSurface className="p-4">
      <div className="relative h-[190px]">
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${chart.width} ${chart.height}`} preserveAspectRatio="none">
          <path
            d={momentumPath}
            fill="none"
            stroke="rgba(110,231,183,0.42)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {momentumPoints.map((day, index) => {
            const isHighlight = index >= 5 || day.progress >= 80;
            return (
              <React.Fragment key={day.day.toISOString()}>
                <line
                  x1={day.x}
                  x2={day.x}
                  y1={chart.baseline}
                  y2={chart.baseline - day.visualHeight}
                  stroke={isHighlight ? "url(#momentumBar)" : "rgba(255,255,255,0.25)"}
                  strokeWidth="16"
                  strokeLinecap="round"
                  style={{
                    filter: isHighlight ? "drop-shadow(0 0 14px rgba(52,211,153,0.36))" : undefined,
                  }}
                />
                <text
                  x={day.x}
                  y={chart.labelY}
                  textAnchor="middle"
                  className="fill-white/25 text-[10px] font-semibold"
                >
                  {day.label}
                </text>
              </React.Fragment>
            );
          })}
          <defs>
            <linearGradient id="momentumBar" x1="0" y1={chart.baseline} x2="0" y2="16" gradientUnits="userSpaceOnUse">
              <stop stopColor="#059669" />
              <stop offset="0.55" stopColor={ACCENT} />
              <stop offset="1" stopColor="#a7f3d0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </PremiumSurface>
  );

  const FocusTaskCard = ({ task, index }: { task: any; index: number; key?: React.Key }) => {
    const isHabit = Boolean(task.isHabit);
    const color = task.categoryColor || (isHabit ? ACCENT : "#2dd4bf");
    const title = task.title || (index === 0 ? "jjhk" : "hkj");
    const metadata = isHabit
      ? `Habit streak: ${task.streak || 9} days`
      : [task.goalTitle, task.category].filter(Boolean).join(" · ") || "General Tasks";
    const metadataAccent = isHabit ? ACCENT : color;
    const isSaving = Boolean(
      getTodayTaskKey && pendingTodayTaskKeys.has(getTodayTaskKey(task)),
    );

    return (
      <motion.div
        layout
        whileTap={isSaving ? undefined : { scale: 0.992 }}
        className={cn(
          "relative overflow-hidden rounded-xl border border-white/[0.06] bg-[linear-gradient(145deg,rgba(22,26,30,0.96),rgba(13,16,19,0.98))] px-3.5 py-3 shadow-[0_18px_48px_-38px_rgba(0,0,0,1)] transition-opacity",
          isSaving && "opacity-75",
        )}
      >
        <div
          className="absolute -left-10 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full blur-2xl"
          style={{ backgroundColor: hexToRgba(color, 0.02) }}
        />
        <div className="relative flex items-center gap-3">
          <TaskIcon color={color} isHabit={isHabit} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => !task.__placeholder && setPreviewTask(task)}
                disabled={Boolean(task.__placeholder)}
                className="min-w-0 flex-1 text-left disabled:cursor-default"
                aria-label={`Preview ${title}`}
              >
                <h3 className="truncate text-[16px] font-semibold leading-tight tracking-[-0.01em] text-white/88">
                  {title}
                </h3>
                <p className="mt-1 flex min-w-0 items-center gap-1.5 truncate text-[12px] font-medium text-white/32">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: metadataAccent }}
                  />
                  <span className="truncate">{metadata}</span>
                </p>
              </button>
              <button
                type="button"
                onClick={(event) => handleArenaComplete(task, event)}
                disabled={Boolean(task.__placeholder) || isSaving}
                className="flex h-9 min-w-[68px] shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 text-[12px] font-semibold tracking-[-0.01em] text-white/68 transition-colors hover:bg-white/[0.06] hover:text-white/88 disabled:cursor-wait disabled:opacity-55"
                aria-label={`Complete ${title}`}
              >
                <span>{isSaving ? "Saving" : "Done"}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const EmptyFocusCard = ({ index }: { index: number }) => (
    <FocusTaskCard
      index={index}
      task={{
        title: index === 0 ? "jjhk" : "hkj",
        goalTitle: index === 0 ? "Goal" : "Habit",
        category: index === 0 ? "General Tasks" : undefined,
        isHabit: index === 1,
        streak: 9,
        categoryColor: index === 0 ? "#2dd4bf" : ACCENT,
        __placeholder: true,
      }}
    />
  );

  return (
    <motion.div
      key="today"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen w-full overflow-x-hidden bg-[#090b0f] px-4 pb-56 pt-5 text-white md:px-8 md:pb-10"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#101319_0%,#090b0f_190px,#090b0f_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_50%_0%,rgba(52,211,153,0.08),transparent_58%)]" />

      <AnimatePresence>
        {isFocusMode && focusTask ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#07090c]/95 p-8 backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(52,211,153,0.14),transparent_35%)]" />
            <button
              onClick={() => setIsFocusMode(false)}
              className="absolute right-6 top-8 rounded-full border border-white/[0.08] bg-white/[0.04] p-4 text-white/70 transition-colors hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative w-full max-w-md text-center">
              <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-[24px] border border-emerald-300/16 bg-emerald-400/[0.07] text-emerald-200 shadow-[0_0_48px_rgba(52,211,153,0.16)]">
                <Zap className="h-7 w-7" />
              </div>
              <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-emerald-200/70">
                Continue focus
              </p>
              <h2 className="text-4xl font-semibold tracking-[-0.03em] text-white">
                {focusTask.title}
              </h2>
              <p className="mt-4 text-[15px] font-medium text-white/40">
                {[focusTask.goalTitle, focusTask.category].filter(Boolean).join(" · ") || "General Tasks"}
              </p>
              <button
                onClick={(event) => {
                  handleArenaComplete(focusTask, event);
                  setIsFocusMode(false);
                }}
                disabled={focusTaskSaving}
                className="mt-10 h-14 w-full rounded-full border border-emerald-300/20 bg-emerald-400/[0.08] text-[16px] font-semibold text-emerald-100 shadow-[0_18px_42px_-32px_rgba(52,211,153,1)] transition-colors hover:bg-emerald-400/[0.12] disabled:cursor-wait disabled:opacity-60"
              >
                {focusTaskSaving ? "Saving" : "Complete focus"}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="relative mx-auto flex w-full max-w-[430px] flex-col gap-5 md:max-w-3xl">
        <MomentumCard />
        <HeroCard />

        <section className="mt-1">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-[17px] font-semibold tracking-tight text-white/88">Focus</h2>
            <span className="text-[13px] font-medium text-white/28">
              {remainingCount} open
            </span>
          </div>
          <div className="space-y-2.5">
            {visibleTasks.length > 0 ? (
              visibleTasks.map((task: any, index: number) => (
                <FocusTaskCard key={task.id || index} task={task} index={index} />
              ))
            ) : (
              <>
                <EmptyFocusCard index={0} />
                <EmptyFocusCard index={1} />
              </>
            )}
          </div>
        </section>

        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          onClick={() => setView("planner")}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-[linear-gradient(145deg,rgba(22,26,30,0.96),rgba(13,16,19,0.98))] text-[14px] font-semibold text-white/52 shadow-[0_18px_48px_-38px_rgba(0,0,0,1)] transition-colors hover:border-white/[0.09]"
        >
          <span>More for today</span>
          <ChevronRight className="h-4 w-4" />
        </motion.button>

        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[linear-gradient(145deg,rgba(22,26,30,0.96),rgba(13,16,19,0.98))] shadow-[0_18px_48px_-38px_rgba(0,0,0,1)]">
          <button
            type="button"
            onClick={() => setCompletedExpanded(!completedExpanded)}
            className="flex min-h-[60px] w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-white/[0.025]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-amber-300/16 bg-amber-400/[0.08] text-amber-300">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-white/78">Completed Tasks</p>
                <p className="mt-0.5 text-[11px] font-medium text-white/28">
                  Tap a checked item to reopen it
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-amber-300/12 bg-amber-400/[0.08] px-2.5 py-1 text-[12px] font-semibold text-amber-200 tabular-nums">
                {completedTasks.length}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-white/28 transition-transform duration-200",
                  completedExpanded && "rotate-180",
                )}
              />
            </div>
          </button>
          <AnimatePresence>
            {completedExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="space-y-2 border-t border-white/[0.055] p-3">
                  {completedTasks.length > 0 ? completedTasks.map((task: any) => {
                    const isSaving = Boolean(
                      getTodayTaskKey && pendingTodayTaskKeys.has(getTodayTaskKey(task)),
                    );

                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => handleToggleToday(task, false)}
                        disabled={isSaving}
                        className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-white/[0.025] disabled:cursor-wait disabled:opacity-55"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-amber-300/18 bg-amber-400/[0.12] text-amber-200">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-medium text-white/54 line-through">
                            {task.title}
                          </p>
                          <p className="truncate text-[11px] text-white/24">
                            {task.goalTitle || task.category || "Completed"}
                          </p>
                        </div>
                        <span className="min-w-[58px] shrink-0 rounded-full border border-white/[0.06] bg-white/[0.035] px-2.5 py-1 text-center text-[11px] font-semibold text-white/34">
                          {isSaving ? "Saving" : "Reopen"}
                        </span>
                      </button>
                    );
                  }) : (
                    <p className="px-2 py-3 text-[13px] font-medium text-white/28">
                      Nothing completed yet.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showBreather && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-4 right-4 top-20 z-[200] flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#111418]/95 px-4 py-3 shadow-[0_20px_60px_-38px_rgba(0,0,0,1)] backdrop-blur-xl md:left-auto md:right-8 md:top-auto md:bottom-8 md:max-w-sm"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/[0.09] text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white/86">{breatherMessage}</p>
              <p className="truncate text-xs text-white/35">{lastCompleted}</p>
            </div>
            <button
              onClick={() => {
                if (breatherTimeout) {
                  clearTimeout(breatherTimeout);
                  setBreatherTimeout(null);
                }
                setShowBreather(false);
              }}
              className="rounded-xl bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/58"
            >
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <TaskPreviewCard
        open={Boolean(previewTask)}
        onClose={() => setPreviewTask(null)}
        title={previewTask?.title || ""}
        subtitle={previewTask?.isHabit ? "Habit" : "Task"}
        accentColor={previewTask?.categoryColor || (previewTask?.isHabit ? ACCENT : "#2dd4bf")}
        metadata={[
          {
            label: previewTask?.isHabit ? "Streak" : "Goal",
            value: previewTask?.isHabit
              ? `${previewTask?.streak || 0} days`
              : previewTask?.goalTitle || "General Tasks",
            icon: previewTask?.isHabit ? "status" : "tag",
          },
          {
            label: "Category",
            value: previewTask?.category,
            icon: "tag",
          },
        ]}
      />
    </motion.div>
  );
}
