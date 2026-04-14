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
  CheckCircle2,
  ChevronRight,
  TrendingUp
} from "lucide-react";

// --- Sub-components ---

const HabitCard = ({ 
  habit, 
  categories, 
  isCompletedOnDate, 
  toggleHabitOptimistic, 
  setEditingHabit, 
  setNewHabit, 
  setIsAddingHabit,
  CircularProgress,
  cn 
}: any) => {
  const cat = categories.find((c: any) => c.name === habit.category) || { color: "#64748b", icon: "✨" };
  const accentColor = cat.color;
  const isDoneToday = isCompletedOnDate(habit, new Date());

  // Calculate 30-day heatmap
  const heatmapDays = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 29);
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

  return (
    <div className="bg-[#1A1A18] border border-white/[0.05] rounded-[2rem] p-6 flex flex-col gap-6 hover:border-white/10 transition-all duration-300 group shadow-2xl">
      {/* Header Area */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner bg-opacity-10"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            {cat.icon || "✨"}
          </div>
          <div>
            <h4 className="text-lg font-bold text-white group-hover:text-white/90 transition-colors tracking-tight">
              {habit.title}
            </h4>
            <p className="text-xs text-white/40 font-medium tracking-wide uppercase">
               Target: {habit.repeat}
            </p>
          </div>
        </div>

        <div 
          className="px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold"
          style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
        >
          <Flame className="w-3.5 h-3.5" />
          {habit.streak || 0}
        </div>
      </div>

      {/* Heatmap Area */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          {heatmapDays.map((day, i) => (
            <div
              key={i}
              className={cn(
                "w-3 h-3 rounded-[3px] transition-all duration-500",
                day.isCompleted 
                  ? "opacity-100" 
                  : "bg-white/[0.03] opacity-40"
              )}
              style={{ 
                backgroundColor: day.isCompleted ? accentColor : undefined,
                boxShadow: day.isCompleted ? `0 0 12px ${accentColor}60` : undefined
              }}
              title={format(day.date, 'MMM d')}
            />
          ))}
        </div>
      </div>

      {/* Footer Area */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
            Monthly Progress
          </span>
          <span className="text-sm font-black text-white">
            {monthlyStats}% <span className="text-xs font-medium text-white/40">consistency</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
           <button
              onClick={() => {
                setEditingHabit(habit);
                setNewHabit(habit);
                setIsAddingHabit(true);
              }}
              className="p-2 text-white/20 hover:text-white/60 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          <button
            onClick={() => toggleHabitOptimistic(habit.id)}
            className={cn(
              "px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-300",
              isDoneToday
                ? "bg-white/5 text-white/40"
                : "text-white shadow-lg"
            )}
            style={{ 
              backgroundColor: isDoneToday ? undefined : accentColor,
              boxShadow: isDoneToday ? undefined : `0 4px 12px ${accentColor}40`
            }}
          >
            {isDoneToday ? (
              <>
                <Check className="w-4 h-4" />
                Completed
              </>
            ) : (
              <>Mark Complete</>
            )}
          </button>
        </div>
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
      // In a real app we'd use storage.isDueOnDate, but here we simplify
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
      className="p-4 md:p-10 max-w-5xl mx-auto w-full flex flex-col gap-10 pb-32 min-h-screen"
    >
      {/* Top Summary Card */}
      <div className="bg-[#1A1A18] border border-white/[0.05] rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14 relative z-10">
          <div className="shrink-0 scale-125 md:scale-150 transform">
            <CircularProgress progress={stats.percent} size={110} color="#bef264" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-3 leading-none">
              {stats.percent}% <span className="text-2xl md:text-3xl font-bold text-white/40 block md:inline md:ml-2 tracking-normal">complete</span>
            </h2>
            <p className="text-xl text-white/50 font-medium">
              {stats.total - stats.completed === 0 
                ? "You've crushed all your habits today! 🔥" 
                : `${stats.total - stats.completed} habits left to win today`}
            </p>
          </div>

          <div className="hidden lg:flex flex-col items-end gap-1">
             <div className="flex items-center gap-2 text-lime-400">
                <TrendingUp className="w-5 h-5" />
                <span className="text-3xl font-black">91%</span>
             </div>
             <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Monthly consistency</span>
          </div>
        </div>

        <div className="w-full mt-10 md:mt-12">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Daily Progress</span>
            <span className="text-[10px] font-bold text-lime-400">{stats.percent}%</span>
          </div>
          <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${stats.percent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-lime-400 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-2 bg-white/[0.03] p-1.5 rounded-2xl w-fit border border-white/[0.05]">
        {(['all', 'today', 'completed'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              "px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              filter === t 
                ? "bg-white/10 text-white shadow-xl" 
                : "text-white/30 hover:text-white/60"
            )}
          >
            {t === 'today' ? 'Due Today' : t}
          </button>
        ))}
      </div>

      {/* Habits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredHabits.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-24 text-center flex flex-col items-center gap-4 bg-white/[0.01] rounded-[3rem] border border-dashed border-white/10"
            >
              <div className="w-20 h-20 bg-lime-400/10 rounded-full flex items-center justify-center text-lime-400 mb-2">
                <Activity className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  Build consistency, one habit at a time
                </h3>
                <p className="text-white/30 max-w-sm mx-auto text-base">
                  Create your first habit to start tracking daily progress and building your streaks.
                </p>
              </div>
            </motion.div>
          ) : (
            filteredHabits.map((habit: any) => (
              <motion.div
                layout
                key={habit.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <HabitCard 
                  habit={habit} 
                  categories={categories}
                  isCompletedOnDate={isCompletedOnDate}
                  toggleHabitOptimistic={toggleHabitOptimistic}
                  setEditingHabit={setEditingHabit}
                  setNewHabit={setNewHabit}
                  setIsAddingHabit={setIsAddingHabit}
                  CircularProgress={CircularProgress}
                  cn={cn}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Floating Action Button */}
      <div className="fixed bottom-32 md:bottom-12 left-0 right-0 p-4 flex justify-center pointer-events-none z-50">
        <button
          onClick={() => setIsAddingHabit(true)}
          className="pointer-events-auto px-10 py-5 bg-[#1A1A18] text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all flex items-center gap-3 border border-white/10 group"
        >
          <div className="bg-lime-400 text-black rounded-full p-1 group-hover:rotate-90 transition-transform">
            <Plus className="w-4 h-4" />
          </div>
          New Habit
        </button>
      </div>
    </motion.div>
  );
}
