import React, { useState, useMemo } from "react";
import { 
  subDays, 
  eachDayOfInterval, 
  format, 
  startOfMonth, 
  endOfMonth,
} from "date-fns";
import { 
  Plus, 
  Activity, 
  Flame, 
  Check, 
  Settings, 
} from "lucide-react";

const HABIT_SURFACE =
  "rounded-xl overflow-hidden border border-white/[0.06] bg-[linear-gradient(145deg,rgba(22,26,30,0.96),rgba(13,16,19,0.98))] shadow-[0_18px_48px_-38px_rgba(0,0,0,1)]";
const HABIT_SURFACE_UNCLIPPED =
  "rounded-xl border border-white/[0.06] bg-[linear-gradient(145deg,rgba(22,26,30,0.96),rgba(13,16,19,0.98))] shadow-[0_18px_48px_-38px_rgba(0,0,0,1)]";

type RgbColor = { r: number; g: number; b: number };

function parseHexColor(color: string): RgbColor {
  const fallback = { r: 16, g: 185, b: 129 };
  if (!color || !color.startsWith("#")) return fallback;

  const raw = color.slice(1);
  const hex = raw.length === 3
    ? raw.split("").map((char) => `${char}${char}`).join("")
    : raw;

  if (hex.length !== 6) return fallback;

  const value = Number.parseInt(hex, 16);
  if (Number.isNaN(value)) return fallback;

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function mixColors(base: RgbColor, target: RgbColor, amount: number): RgbColor {
  return {
    r: Math.round(base.r + (target.r - base.r) * amount),
    g: Math.round(base.g + (target.g - base.g) * amount),
    b: Math.round(base.b + (target.b - base.b) * amount),
  };
}

function rgbToString(color: RgbColor, alpha = 1) {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

function createHabitPalette(color: string) {
  const base = parseHexColor(color);
  const soft = mixColors(base, { r: 255, g: 255, b: 255 }, 0.1);
  const bright = mixColors(base, { r: 255, g: 255, b: 255 }, 0.24);
  const glow = mixColors(base, { r: 255, g: 255, b: 255 }, 0.36);
  const inactive = mixColors(base, { r: 35, g: 39, b: 44 }, 0.9);

  return {
    accent: rgbToString(soft),
    badgeFill: rgbToString(base, 0.13),
    badgeBorder: rgbToString(base, 0.42),
    pillFill: rgbToString(base, 0.15),
    pillBorder: rgbToString(base, 0.42),
    buttonFill: rgbToString(base, 0.14),
    buttonBorder: rgbToString(base, 0.42),
    inactiveDot: rgbToString(inactive, 0.95),
    completeDots: [
      rgbToString(base, 0.78),
      rgbToString(soft, 0.92),
      rgbToString(bright, 1),
      rgbToString(glow, 1),
    ],
  };
}

// --- Sub-components ---

const HabitCard = ({ 
  habit, 
  categories, 
  isCompletedOnDate, 
  toggleHabitOptimistic, 
  setEditingHabit, 
  setNewHabit, 
  setIsAddingHabit,
  motion,
  cn 
}: any) => {
  const cat = categories.find((c: any) => c.name === habit.category) || { color: "#64748b", icon: "✨" };
  // Per-habit color takes priority, falls back to category color
  const accentColor = habit.color || cat.color;
  const palette = useMemo(() => createHabitPalette(accentColor), [accentColor]);
  const isDoneToday = isCompletedOnDate(habit, new Date());
  const openEditHabit = () => {
    setEditingHabit(habit);
    setNewHabit(habit);
    setIsAddingHabit(true);
  };

  // Calculate roughly 60-day heatmap (4 rows x ~15 columns)
  const heatmapDays = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 59);
    return eachDayOfInterval({ start, end }).map(date => ({
      date,
      isCompleted: isCompletedOnDate(habit, date)
    }));
  }, [habit, isCompletedOnDate]);

  // Calculate monthly percentage
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const daysInterval = eachDayOfInterval({ start, end });
    const completedInMonth = daysInterval.filter(d => isCompletedOnDate(habit, d));
    return Math.round((completedInMonth.length / daysInterval.length) * 100);
  }, [habit, isCompletedOnDate]);

  // Subtitle: use description if available, otherwise fallback to category + repeat
  const subtitle = habit.description || `${habit.category} · ${habit.repeat}`;

  return (
    <div
      onClick={() => {
        if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
          openEditHabit();
        }
      }}
      className={`${HABIT_SURFACE} p-4 md:p-5 flex flex-col gap-3 md:gap-4 transition-all duration-300 group max-w-full cursor-pointer md:cursor-default`}
    >
      {/* Header Row */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Circular icon badge */}
          <div
            className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-lg md:text-xl shrink-0 border"
            style={{
              backgroundColor: palette.badgeFill,
              borderColor: palette.badgeBorder,
              color: palette.accent
            }}
          >
            {cat.icon || "✨"}
          </div>
          <div className="min-w-0 pr-2">
            <h4 className="text-[16px] md:text-[17px] font-semibold text-white tracking-tight leading-tight truncate">
              {habit.title}
            </h4>
            <p className="text-[12px] md:text-[13px] text-white/38 font-medium mt-0.5 truncate">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Settings — hover reveal */}
          <button
            onClick={(event) => {
              event.stopPropagation();
              openEditHabit();
            }}
            className="p-2 border border-transparent hover:border-white/[0.08] hover:bg-white/[0.035] rounded-lg text-transparent group-hover:text-white/36 hover:!text-white transition-all duration-200"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Streak pill — gradient presentation */}
          <div
            className="px-2.5 py-1 rounded-lg flex items-center gap-1 text-[12px] font-bold border"
            style={{
              backgroundColor: palette.pillFill,
              borderColor: palette.pillBorder,
              color: palette.accent
            }}
          >
            <Flame className="w-3.5 h-3.5 opacity-90" />
            <span className="opacity-80 pb-[1px] ml-[1px]">↑</span> {habit.streak || 0}
          </div>
        </div>
      </div>

      {/* Heatmap Area - 4-row grid */}
      <div className="w-full">
        <div className="grid grid-rows-4 grid-flow-col gap-[3px] overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {heatmapDays.map((day, i) => {
            const tone = palette.completeDots[(day.date.getDate() + i) % palette.completeDots.length];
            return (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  opacity: day.isCompleted ? 1 : 0.72,
                }}
                style={{ backgroundColor: day.isCompleted ? tone : palette.inactiveDot }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-[8px] h-[8px] md:w-[10px] md:h-[10px] rounded-[3px] shrink-0"
                title={format(day.date, 'MMM d')}
              />
            );
          })}
        </div>
      </div>

      {/* Footer Row */}
      <div className="flex items-center justify-between pt-1">
        {/* Monthly stat */}
        <span className="text-[13px]">
          <span className="font-semibold" style={{ color: palette.accent }}>{monthlyStats}%</span>
          <span className="text-white/32 font-medium ml-1.5">this month</span>
        </span>

        {/* Action button */}
        <motion.button
          onClick={(event) => {
            event.stopPropagation();
            toggleHabitOptimistic(habit.id);
          }}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "px-3.5 md:px-4 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-all duration-300 border",
            isDoneToday
              ? "border-white/[0.04] bg-white/[0.02] text-white/34"
              : "border-transparent" // overriden by style
          )}
          style={{
            backgroundColor: isDoneToday ? undefined : palette.buttonFill,
            borderColor: isDoneToday ? undefined : palette.buttonBorder,
            color: isDoneToday ? undefined : palette.accent,
          }}
        >
          {isDoneToday ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Completed <span className="text-[9px] ml-1 opacity-50">&gt;</span>
            </>
          ) : (
            <>
              Mark complete <span className="text-[10px] ml-1.5 opacity-80" style={{color: palette.accent}}>&gt;</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export function HabitsView(props: any) {
  const {
    motion,
    AnimatePresence,
    cn,
    isCompletedOnDate,
    setIsAddingHabit,
    setEditingHabit,
    setNewHabit,
    toggleHabitOptimistic,
    habits = [],
    categories = [],
    CircularProgress,
  } = props;

  const [filter, setFilter] = useState<'all' | 'today' | 'completed'>('all');

  // --- Calculations ---
  const stats = useMemo(() => {
    const today = new Date();
    const dueToday = habits.filter((h: any) => {
      if (h.repeat === 'Daily') return true;
      const created = new Date(h.created_at || Date.now());
      if (h.repeat === 'Weekly') return today.getDay() === created.getDay();
      if (h.repeat === 'Monthly') return today.getDate() === created.getDate();
      return true;
    });
    const completedToday = dueToday.filter((h: any) => isCompletedOnDate(h, today));
    return {
      total: dueToday.length,
      completed: completedToday.length,
      percent: dueToday.length > 0 ? Math.round((completedToday.length / dueToday.length) * 100) : 0
    };
  }, [habits, isCompletedOnDate]);

  // Real monthly consistency across all habits
  const monthlyConsistency = useMemo(() => {
    if (habits.length === 0) return 0;
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const daysInMonth = eachDayOfInterval({ start, end });

    let totalPoints = 0;
    let possiblePoints = 0;

    habits.forEach((h: any) => {
      daysInMonth.forEach(day => {
        if (day <= now) {
          possiblePoints++;
          if (isCompletedOnDate(h, day)) totalPoints++;
        }
      });
    });

    return possiblePoints > 0 ? Math.round((totalPoints / possiblePoints) * 100) : 0;
  }, [habits, isCompletedOnDate]);

  const filteredHabits = useMemo(() => {
    const today = new Date();
    switch (filter) {
      case 'today':
        return habits.filter((h: any) => {
          if (h.repeat === 'Daily') return true;
          const created = new Date(h.created_at || Date.now());
          if (h.repeat === 'Weekly') return today.getDay() === created.getDay();
          if (h.repeat === 'Monthly') return today.getDate() === created.getDate();
          return true;
        });
      case 'completed':
        return habits.filter((h: any) => isCompletedOnDate(h, today));
      default:
        return habits;
    }
  }, [habits, filter, isCompletedOnDate]);

  return (
    <motion.div
      key="habits-premium"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-8 lg:p-10 max-w-6xl mx-auto w-full flex flex-col gap-5 md:gap-10 pb-28 md:pb-32 min-h-screen pt-5 md:pt-16"
    >

      {/* ───── 1. TOP SUMMARY CARD (Replica style) ───── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`${HABIT_SURFACE_UNCLIPPED} min-h-[132px] p-4 sm:min-h-[148px] sm:p-6 relative overflow-visible`}
      >
        <div className="grid grid-cols-[60px_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[64px_minmax(0,1fr)] sm:gap-5">
          <div className="shrink-0 overflow-visible">
            <CircularProgress progress={stats.percent} size={60} strokeWidth={6} color="#a3e635" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-[24px] sm:text-[28px] font-bold text-white tracking-tight leading-none">
              {stats.percent}%
              <span className="ml-2 text-[14px] sm:text-[16px] font-normal text-white/42">complete</span>
            </h2>
            <p className="mt-2 text-[13px] sm:text-[14px] text-white/42 font-medium leading-snug">
              {stats.total - stats.completed === 0
                ? "All habits crushed today"
                : `${stats.total - stats.completed} habit${stats.total - stats.completed !== 1 ? 's' : ''} left to win today`}
            </p>
          </div>
        </div>

        <div className="mt-4 sm:mt-6">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[12px] font-medium text-white/32 tracking-wide uppercase">Today</span>
            <span className="text-[13px] font-bold text-[#a3e635]">
              {monthlyConsistency}% <span className="text-white/24 font-medium ml-1">Avg</span>
            </span>
          </div>
          <div className="h-[4px] w-full bg-white/[0.07] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.percent}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-[#A3E635]"
            />
          </div>
        </div>
      </motion.div>

      {/* ───── 2. FILTER ROW ───── */}
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {(['all', 'due today', 'completed'] as const).map((t) => {
            const filterValue = t === 'due today' ? 'today' : t;
            return (
              <button
                key={t}
                onClick={() => setFilter(filterValue)}
                className={cn(
                  "px-3 sm:px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 border tracking-wide whitespace-nowrap",
                  filter === filterValue
                    ? "border-white/[0.08] bg-white/[0.08] text-white"
                    : "border-white/[0.04] bg-[linear-gradient(145deg,rgba(22,26,30,0.78),rgba(13,16,19,0.84))] text-white/38 hover:text-white/62 hover:border-white/[0.07]"
                )}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setIsAddingHabit(true)}
          className="ml-auto shrink-0 h-8 px-3 rounded-lg border border-[#A3E635]/20 bg-[#A3E635]/10 text-[#A3E635] hover:bg-[#A3E635]/14 transition-colors duration-200 flex items-center justify-center gap-1.5 text-[12px] font-semibold"
          aria-label="Add habit"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add habit</span>
        </button>
      </div>

      {/* ───── 3. HABIT CARDS ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        <AnimatePresence mode="popLayout">
          {filteredHabits.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-32 text-center flex flex-col items-center gap-6"
            >
              <div className="w-20 h-20 border border-white/[0.06] rounded-xl bg-[linear-gradient(145deg,rgba(22,26,30,0.96),rgba(13,16,19,0.98))] flex items-center justify-center text-white/32">
                <Activity className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-[#e4e4e7] tracking-tight">
                  No habits here yet
                </h3>
                <p className="text-[#71717a] max-w-sm mx-auto text-[15px] leading-relaxed">
                  Start tracking your daily progress to build long-lasting consistency.
                </p>
              </div>
            </motion.div>
          ) : (
            filteredHabits.map((habit: any) => (
              <motion.div
                layout
                key={habit.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <HabitCard 
                  habit={habit} 
                  categories={categories}
                  isCompletedOnDate={isCompletedOnDate}
                  toggleHabitOptimistic={toggleHabitOptimistic}
                  setEditingHabit={setEditingHabit}
                  setNewHabit={setNewHabit}
                  setIsAddingHabit={setIsAddingHabit}
                  motion={motion}
                  cn={cn}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* ───── 4. BOTTOM NEW HABIT BUTTON ───── */}
      <div className="mt-8 mb-8">
        <button
          onClick={() => setIsAddingHabit(true)}
          className={`${HABIT_SURFACE} w-full py-4 text-white font-medium text-[15px] flex items-center justify-center gap-2 transition-colors duration-200 hover:border-white/[0.09]`}
        >
          <Plus className="w-5 h-5 text-[#A3E635]" />
          New Habit
        </button>
      </div>
    </motion.div>
  );
}
