import React from "react";
import { ChevronDown } from "lucide-react";

export function TodayView(props: any) {
  const {
    motion,
    AnimatePresence,
    DndContext,
    DragOverlay,
    defaultDropAnimationSideEffects,
    cn,
    format,
    parseISO,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    isPast,
    PlannerView,
    AssignTasksView,
    Card,
    Badge,
    DraggableMilestone,
    DroppableCalendarDay,
    CircularProgress,
    CustomBarTooltip,
    CustomTooltip,
    PRIORITY_COLORS,
    isValidDate,
    isCompletedOnDate,
    setView,
    setTheme,
    setSelectedDate,
    setActiveGoalId,
    setCurrentMonth,
    setIsFocusMode,
    setIsAddingGoal,
    setIsAddingHabit,
    setIsAddingMilestone,
    setIsCustomizingLayout,
    setDismissedConquered,
    setNewMilestone,
    setEditingGoal,
    setNewGoal,
    setEditingHabit,
    setNewHabit,
    toggleHabitOptimistic,
    toggleGoalCompletionOptimistic,
    toggleMilestone,
    deleteMilestone,
    editMilestone,
    handleAddPlannerTask,
    handleDeleteGoal,
    handleDeleteHabit,
    handleDeleteCategory,
    handleMarkAllDone,
    handleToggleToday,
    handleArenaComplete,
    handleCalendarDragStart,
    handleCalendarDragEnd,
    fetchGoals,
    session,
    supabase,
    theme,
    currentDate,
    dashboardLayout,
    stats,
    chartData,
    repeatabilityData,
    categoryData,
    trendData,
    productivityInsights,
    currentMonth,
    selectedDate,
    milestonesForSelectedDate,
    todayMilestones,
    todayProgress,
    yesterdayProgress,
    yesterdayCompletedCount,
    dismissedConquered,
    personalBest,
    highestStreak,
    barPulse,
    floatingPoints,
    slidingOut,
    showBreather,
    breatherMessage,
    lastCompleted,
    breatherTimeout,
    setBreatherTimeout,
    setShowBreather,
    setSlidingOut,
    goals,
    habits,
    categories,
    activeGoal,
    activeGoalId,
    unassignedMilestones,
    sensors,
    activeCalendarDragId,
    activeCalendarMilestone,
    getItemsForDate,
    getHeroTheme,
    getBarColor,
    getHypeText,
    getStreakMessage,
    isFocusMode,
    setTodayGraphView,
    todayGraphView,
    todayCompletedCount,
    todayTotalCount,
    setCompletedExpanded,
    completedExpanded,
    setShowMomentumMobile,
    showMomentumMobile,
    X,
    Zap,
    Plus,
    CheckCircle2,
    TrendingUp,
    TrendingDown,
    Trophy,
    Target,
    Settings,
    Trash2,
    ChevronRight,
    ArrowLeft,
    Activity,
    Flame,
    Calendar,
    CalendarDays,
    Sun,
    Moon,
    Award,
    Clock,
    LayoutDashboard,
    User,
  } = props;
  return (
            <motion.div
              key="today"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 md:p-8 max-w-6xl mx-auto w-full"
            >
              <AnimatePresence>
                {isFocusMode && todayMilestones.some((m) => !m.done) ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-center p-8"
                  >
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/10 blur-[150px] rounded-full animate-pulse" />
                    </div>

                    <button
                      onClick={() => setIsFocusMode(false)}
                      className="absolute top-8 right-8 p-4 rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>

                    <div className="relative text-center max-w-2xl w-full">
                      <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-10 shadow-xl shadow-orange-500/5">
                        <Zap className="w-8 h-8 text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)] fill-orange-500" />
                      </div>

                      <p className="text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)] font-bold uppercase tracking-[0.2em] text-xs mb-4">
                        Current Protocol
                      </p>

                      {(() => {
                        const mainTask = todayMilestones.find((m) => !m.done);
                        return (
                          <>
                            <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                              {mainTask?.title}
                            </h2>
                            <p className="text-white/50 text-lg font-medium mb-12 uppercase tracking-widest flex items-center justify-center gap-2">
                              {mainTask?.goalTitle}{" "}
                              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />{" "}
                              {mainTask?.category}
                            </p>

                            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                              <button
                                onClick={async () => {
                                  handleToggleToday(mainTask);
                                  if (
                                    todayMilestones.filter((m) => !m.done)
                                      .length <= 1
                                  ) {
                                    setIsFocusMode(false);
                                  }
                                }}
                                className="w-full md:w-auto px-10 py-5 bg-orange-500 text-white rounded-2xl font-bold text-lg hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                              >
                                Task Complete
                              </button>
                              <button
                                onClick={() => setIsFocusMode(false)}
                                className="w-full md:w-auto px-10 py-5 bg-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all active:scale-95"
                              >
                                Exit Focus
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {todayMilestones.length === 0 ? (
                <div className="space-y-6 md:space-y-8">
                  {/* Desktop Hero */}
                  <div
                    className="hidden md:block relative overflow-hidden rounded-[1.5rem] p-8 text-white"
                    style={{ background: getHeroTheme().bg }}
                  >
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <p className="text-[9px] font-semibold tracking-widest uppercase uppercase tracking-widest text-white/60 mb-2">
                          {getHeroTheme().label}
                        </p>
                        <h2 className="text-4xl font-extrabold tracking-tight mb-2">
                          Daily Mission
                        </h2>
                        <p className="text-white/60 text-sm">
                          Your schedule is clear â€” assign tasks from the
                          Calendar
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-extrabold">
                          {todayProgress}%
                        </div>
                        <div className="text-[10px] text-white/50 uppercase tracking-widest">
                          completed today
                        </div>
                        {todayProgress !== yesterdayProgress && (
                          <div
                            className={cn(
                              "text-xs mt-1",
                              todayProgress > yesterdayProgress
                                ? "text-green-400"
                                : "text-red-400",
                            )}
                          >
                            {todayProgress > yesterdayProgress ? "â†‘" : "â†“"} vs
                            yesterday
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="h-5 rounded-full bg-white/10 relative overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
                        style={{ width: "0%", backgroundColor: getBarColor(0) }}
                      />
                    </div>
                  </div>

                  {/* Mobile Hero & Streak (Compact) */}
                  <div className="md:hidden flex items-center justify-between bg-white/40 dark:bg-[#1a1a1a]/40 backdrop-blur-md border border-stone-200/50 dark:border-white/5 rounded-2xl p-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                        <svg
                          className="absolute inset-0 w-full h-full -rotate-90"
                          viewBox="0 0 36 36"
                        >
                          <path
                            className="text-stone-200 dark:text-white/10"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            strokeWidth="3"
                            strokeDasharray={`0, 100`}
                            strokeLinecap="round"
                            stroke={getBarColor(0)}
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="text-[9px] font-semibold tracking-widest uppercase text-stone-900 dark:text-white">
                          0%
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-stone-900 dark:text-white leading-none mb-1">
                          {todayProgress}
                          <span className="text-[10px] text-stone-500 uppercase tracking-widest font-semibold">
                            %
                          </span>
                        </div>
                        <div className="text-[10px] font-medium text-stone-500">
                          Schedule is clear
                        </div>
                      </div>
                    </div>
                    {todayProgress !== yesterdayProgress && (
                      <div
                        className={cn(
                          "text-[9px] font-semibold tracking-widest uppercase px-2 py-1 rounded-full",
                          todayProgress > yesterdayProgress
                            ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                        )}
                      >
                        {todayProgress > yesterdayProgress ? "â†‘" : "â†“"} vs yday
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-white/5 rounded-[2rem] border border-stone-100 dark:border-white/5">
                    <div className="text-6xl mb-6">ðŸ“…</div>
                    <h3 className="text-2xl font-bold font-mono-nums text-stone-900 dark:text-white mb-2">
                      Your Arena Awaits
                    </h3>
                    <p className="text-stone-500 mb-8 text-center max-w-md">
                      No tasks assigned for today. Head to the Calendar to
                      schedule your milestones.
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setView("calendar")}
                        className="px-6 py-3 bg-stone-100 dark:bg-white/10 text-stone-900 dark:text-white rounded-xl font-bold hover:bg-stone-200 dark:hover:bg-white/20 transition-colors"
                      >
                        Go to Calendar
                      </button>
                      <button
                        onClick={() => setIsAddingMilestone(true)}
                        className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
                      >
                        Add Milestone
                      </button>
                    </div>
                  </div>
                </div>
              ) : todayProgress === 100 && !dismissedConquered ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] rounded-[2rem] bg-stone-50 dark:bg-white/5 relative overflow-hidden border border-stone-200 dark:border-white/10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md p-8"
                  >
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h2 className="text-3xl font-black text-stone-900 dark:text-white tracking-tight mb-2">
                        Day Conquered
                      </h2>
                      <p className="text-stone-500 dark:text-stone-400">
                        You've completed all your tasks for today.
                      </p>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="bg-white dark:bg-black/20 rounded-2xl p-4 border border-stone-100 dark:border-white/5 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Today</p>
                          <p className="text-2xl font-black text-stone-900 dark:text-white">{todayMilestones.length} <span className="text-sm font-medium text-stone-500">tasks</span></p>
                        </div>
                        
                        <div className="flex flex-col items-center gap-1">
                          <div className="h-8 w-px bg-stone-200 dark:bg-white/10"></div>
                          {(() => {
                            const todayCount = todayMilestones.length;
                            const yesterdayCount = yesterdayCompletedCount;
                            const diff = todayCount - yesterdayCount;
                            const percent = yesterdayCount > 0 
                              ? Math.round((Math.abs(diff) / yesterdayCount) * 100) 
                              : (todayCount > 0 ? 100 : 0);
                            
                            if (diff > 0) {
                              return (
                                <div className="flex items-center gap-0.5 text-green-500 text-[10px] font-bold bg-green-500/10 px-1.5 py-0.5 rounded-full">
                                  <TrendingUp className="w-2.5 h-2.5" />
                                  {percent}%
                                </div>
                              );
                            } else if (diff < 0) {
                              return (
                                <div className="flex items-center gap-0.5 text-rose-500 text-[10px] font-bold bg-rose-500/10 px-1.5 py-0.5 rounded-full">
                                  <TrendingDown className="w-2.5 h-2.5" />
                                  {percent}%
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Yesterday</p>
                          <p className="text-2xl font-black text-stone-900 dark:text-white">{yesterdayCompletedCount} <span className="text-sm font-medium text-stone-500">tasks</span></p>
                        </div>
                      </div>

                      {personalBest.count > 0 && (
                        <div className="bg-orange-500/10 rounded-2xl p-4 border border-orange-500/20 flex items-center gap-4">
                          <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-500 shrink-0">
                            <Trophy className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-orange-700 dark:text-orange-400">Personal Best: {personalBest.count} tasks</p>
                            <p className="text-xs text-orange-600/70 dark:text-orange-400/70">Achieved on {format(new Date(personalBest.date), "MMM d, yyyy")}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setView("planner");
                      }}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl font-bold hover:opacity-90 transition-opacity"
                    >
                      <Plus className="w-5 h-5" />
                      Add a task for tomorrow
                    </button>

                    <button
                      onClick={() => setDismissedConquered(true)}
                      className="w-full mt-3 px-6 py-4 bg-stone-200/50 dark:bg-white/5 text-stone-600 dark:text-stone-300 rounded-xl font-bold hover:bg-stone-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                      View Dashboard
                    </button>
                  </motion.div>
                </div>
              ) : (
                <div className="space-y-8 relative">

                  {floatingPoints.map((fp) => (
                    <motion.div
                      key={fp.id}
                      initial={{ opacity: 1, y: 0 }}
                      animate={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.6 }}
                      className="fixed z-50 font-black text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)] text-lg pointer-events-none"
                      style={{ left: fp.x, top: fp.y }}
                    >
                      +{fp.points}%
                    </motion.div>
                  ))}

                  <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT COLUMN: Main Pipeline */}
                    <div className="lg:col-span-8 flex flex-col space-y-6 w-full">

                    {/* Streak at absolute top */}
                    {highestStreak > 0 && (
                      <div className="flex justify-center w-full">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 text-sm font-bold shadow-sm">
                          <Flame className="w-4 h-4" />
                          {highestStreak} Day Streak
                          <span className="text-amber-600/50 dark:text-amber-500/50 mx-1">â€¢</span>
                          <span className="font-medium">{getStreakMessage()}</span>
                        </div>
                      </div>
                    )}

                    

                    {/* Desktop Hero */}
                    <div className="hidden lg:flex flex-col justify-end pt-4 pb-4">
                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#f97316' }} />
                            <p className="text-[10px] font-bold tracking-widest uppercase text-stone-500">
                              {getHeroTheme().label}
                            </p>
                          </div>
                          <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-stone-900 dark:text-white">
                            Daily Mission
                          </h2>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black text-stone-900 dark:text-white leading-none">
                            {todayCompletedCount}<span className="text-xl text-stone-400">/{todayTotalCount}</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-stone-100 dark:bg-white/5 relative overflow-hidden">
                        <motion.div
                          className="absolute top-0 left-0 h-full rounded-full transition-all duration-800"
                          style={{ width: `${todayProgress}%`, backgroundColor: getBarColor(todayProgress) }}
                        />
                      </div>
                      <p className="text-stone-500 text-sm mt-3 font-medium">
                        {getHypeText(todayCompletedCount, todayTotalCount)}
                      </p>
                    </div>

                    {/* Mobile Hero & Streak (Compact) */}
                    <div className="md:hidden relative overflow-hidden rounded-2xl p-4 mb-4 bg-white/5 backdrop-blur-xl border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center overflow-hidden">
                            <svg
                              className="absolute inset-0 w-full h-full -rotate-90"
                              viewBox="0 0 36 36"
                            >
                              <path
                                className="text-white/10"
                                strokeWidth="2.5"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                strokeWidth="2.5"
                                strokeDasharray={`${todayProgress}, 100`}
                                strokeLinecap="round"
                                stroke="#f97316"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                className="transition-all duration-1000 ease-out"
                              />
                            </svg>
                            <span className="text-[10px] font-black tracking-tight text-orange-400">
                              {Math.round(todayProgress)}%
                            </span>
                          </div>
                          <div>
                            <div className="flex items-baseline gap-1.5 mb-0.5">
                              <span className="text-xl font-black tracking-tight leading-none text-white">{todayCompletedCount}</span>
                              <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">/ {todayTotalCount}</span>
                            </div>
                            <div className="text-[10px] font-medium text-white/40">
                              {todayTotalCount - todayCompletedCount === 0 ? "All done!" : `${todayTotalCount - todayCompletedCount} remaining`}
                            </div>
                          </div>
                        </div>
                        {todayProgress !== yesterdayProgress && (
                          <div
                            className={cn(
                              "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                              todayProgress > yesterdayProgress
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-rose-500/10 text-rose-400",
                            )}
                          >
                            {todayProgress > yesterdayProgress ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            vs yday
                          </div>
                        )}
                      </div>
                    </div>

                    
                      <div className="space-y-8">
                        {(() => {
                          if (todayMilestones.length === 0 && !showBreather)
                            return null;

                          // Sort tasks: Incomplete first, then High priority first
                          const sortedTasks = [...todayMilestones].sort(
                            (a, b) => {
                              if (a.done !== b.done) return a.done ? 1 : -1;
                              const pA =
                                a.priority === "High"
                                  ? 3
                                  : a.priority === "Medium"
                                    ? 2
                                    : 1;
                              const pB =
                                b.priority === "High"
                                  ? 3
                                  : b.priority === "Medium"
                                    ? 2
                                    : 1;
                              return pB - pA;
                            },
                          );

                          return (
                            <div className="space-y-3 relative">
                              {/* Non-blocking completion toast */}
                              <AnimatePresence>
                                {showBreather && (
                                  <motion.div
                                    key="toast"
                                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-w-sm"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-white truncate">{breatherMessage}</p>
                                      <p className="text-xs text-white/50 truncate">{lastCompleted}</p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        if (breatherTimeout) {
                                          clearTimeout(breatherTimeout);
                                          setBreatherTimeout(null);
                                        }
                                        setShowBreather(false);
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white/70 text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-colors shrink-0"
                                    >
                                      Undo
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <AnimatePresence mode="popLayout">
                                {sortedTasks.filter(t => !t.done).map((task) => {
                                  const catColor = task.categoryColor || "#10b981";
                                  // Convert hex to rgba for the pill background
                                  const hex2rgba = (hex: string, alpha = 0.1) => {
                                    const [r, g, b] = hex.match(/\w\w/g)?.map(x => parseInt(x, 16)) || [16, 185, 129];
                                    return `rgba(${r},${g},${b},${alpha})`;
                                  };
                                  
                                  return (
                                    <motion.div
                                      key={task.id}
                                      layout
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      className="group relative overflow-hidden bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 border-none"
                                    >
                                      <div className="flex items-center gap-4 relative z-10">
                                        <button
                                          onClick={(e) => handleArenaComplete(task, e)}
                                          className="w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-90 bg-stone-50 dark:bg-[#222] shadow-inner"
                                          style={{
                                            borderColor: catColor,
                                          }}
                                        >
                                          <div className="w-0 h-0 rounded-full transition-all duration-300" style={{ backgroundColor: catColor }} />
                                        </button>
                                        
                                        <div className="flex-1 min-w-0">
                                          <h3 className="text-lg font-bold text-stone-900 dark:text-white truncate tracking-tight">
                                            {task.title}
                                          </h3>
                                          <div className="flex items-center gap-2 mt-1.5">
                                            <span 
                                              className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full flex items-center gap-1"
                                              style={{ 
                                                backgroundColor: hex2rgba(catColor, 0.15),
                                                color: catColor
                                              }}
                                            >
                                              {task.goalTitle}
                                            </span>
                                            {task.priority === "High" && (
                                              <span className="text-[9px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-widest">
                                                <Flame className="w-3 h-3" /> High
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Edge Glow */}
                                      <div 
                                        className="absolute top-0 bottom-0 left-0 w-12 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                                        style={{ 
                                          background: `linear-gradient(to right, ${catColor}, transparent)` 
                                        }}
                                      />
                                    </motion.div>
                                  );
                                })}
                              </AnimatePresence>
                            </div>
                          );
                        })()}

                        {todayMilestones.filter((m) => m.done).length > 0 && (
                          <div className="border border-stone-200 dark:border-white/10 rounded-2xl overflow-hidden mt-8">
                            <button
                              onClick={() =>
                                setCompletedExpanded(!completedExpanded)
                              }
                              className="w-full flex items-center justify-between p-4 bg-stone-50 dark:bg-white/5 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Trophy className="w-4 h-4 text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)]" />
                                <span className="text-sm font-bold text-stone-700 dark:text-stone-300">
                                  Task Completed
                                </span>
                                <motion.span
                                  key={
                                    todayMilestones.filter((m) => m.done).length
                                  }
                                  initial={{ scale: 1.5 }}
                                  animate={{ scale: 1 }}
                                  className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] font-semibold tracking-widest uppercase"
                                >
                                  {todayMilestones.filter((m) => m.done).length}
                                </motion.span>
                              </div>
                              <ChevronDown
                                className={cn(
                                  "w-4 h-4 text-stone-400 transition-transform",
                                  completedExpanded && "rotate-180",
                                )}
                              />
                            </button>
                            <AnimatePresence>
                              {completedExpanded && (
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: "auto" }}
                                  exit={{ height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-4 space-y-2 bg-white dark:bg-transparent">
                                    {todayMilestones
                                      .filter((m) => m.done)
                                      .map((task) => (
                                        <button
                                          key={task.id}
                                          onClick={() => handleToggleToday(task)}
                                          className="w-full flex items-center text-left gap-3 opacity-60 hover:opacity-100 transition-opacity"
                                        >
                                          <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-3 h-3 text-white" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="text-sm text-stone-600 dark:text-stone-400 line-through truncate">
                                              {task.title}
                                            </h4>
                                            <p className="text-[10px] text-stone-400">
                                              {task.goalTitle}
                                            </p>
                                          </div>
                                        </button>
                                      ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Side Widgets */}
                    <div className="lg:col-span-4 flex flex-col gap-6 w-full lg:sticky lg:top-8 order-first lg:order-none">
{/* Activity Graph (Absolute Top) */}
                    <div className="p-6 rounded-[1.5rem] bg-white dark:bg-[#1a1a1a] border border-stone-200 dark:border-white/10 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[9px] font-bold tracking-widest uppercase text-stone-400">
                          Activity
                        </span>
                        <div className="flex bg-stone-100 dark:bg-white/5 p-1 rounded-lg">
                          <button
                            onClick={() => setTodayGraphView('week')}
                            className={cn(
                              "px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all",
                              todayGraphView === 'week' ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                            )}
                          >
                            Week
                          </button>
                          <button
                            onClick={() => setTodayGraphView('month')}
                            className={cn(
                              "px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all",
                              todayGraphView === 'month' ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                            )}
                          >
                            Month
                          </button>
                        </div>
                      </div>

                      {todayGraphView === 'week' ? (
                        <div className="flex items-end justify-between h-32 gap-2 relative">
                          {[...Array(7)].map((_, i) => {
                            const d = new Date();
                            d.setDate(d.getDate() - (6 - i));
                            const isToday = i === 6;
                            const items = getItemsForDate(d);
                            const total = items.length;
                            const done = items.filter(m => m.done).length;
                            const progress = total === 0 ? 0 : (done / total) * 100;
                            
                            return (
                              <div key={i} className="flex flex-col items-center flex-1 gap-2 group relative h-full">
                                <div className={cn(
                                  "w-full flex-1 rounded-t-md relative overflow-hidden flex items-end",
                                  total === 0 ? "bg-stone-50 dark:bg-white/5 border border-dashed border-stone-200 dark:border-white/10" : "bg-stone-100 dark:bg-white/10"
                                )}>
                                  {total > 0 && (
                                    <motion.div 
                                      initial={{ height: 0 }}
                                      animate={{ height: `${Math.max(2, progress)}%` }}
                                      transition={{ type: "spring", stiffness: 100, damping: 12, delay: i * 0.05 }}
                                      className="w-full rounded-t-md opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all origin-bottom bg-gradient-to-t from-blue-600 via-indigo-500 to-emerald-400"
                                    />
                                  )}
                                </div>
                                <span className={cn(
                                  "text-[9px] font-bold",
                                  isToday ? "text-stone-900 dark:text-white" : "text-stone-400"
                                )}>
                                  {format(d, "EE").charAt(0)}
                                </span>
                                
                                {/* Tooltip */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                  {Math.round(progress)}%
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                          {[...Array(28)].map((_, i) => {
                            const d = new Date();
                            d.setDate(d.getDate() - (27 - i));
                            const items = getItemsForDate(d);
                            const total = items.length;
                            const done = items.filter(m => m.done).length;
                            const progress = total === 0 ? 0 : (done / total) * 100;
                            
                            let bgClass = "bg-stone-50 dark:bg-white/5 border border-dashed border-stone-200 dark:border-white/10";
                            if (total > 0) {
                              if (progress === 100) bgClass = "bg-emerald-600";
                              else if (progress >= 75) bgClass = "bg-emerald-400";
                              else if (progress >= 50) bgClass = "bg-emerald-200";
                              else if (progress > 0) bgClass = "bg-red-400";
                              else bgClass = "bg-red-700";
                            }
                            
                            return (
                              <div 
                                key={i} 
                                className={cn("aspect-square rounded-sm group relative transition-colors duration-300", bgClass)}
                              >
                                {/* Tooltip */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                  {format(d, "MMM d")}: {Math.round(progress)}%
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Desktop-only: Goal Progress in right sidebar */}
                    <div className="hidden lg:block p-6 rounded-[1.5rem] bg-white dark:bg-white/[0.02] border border-stone-100 dark:border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-semibold tracking-widest uppercase text-stone-400">
                          Goal Progress
                        </span>
                        <button
                          onClick={() => setView("goals")}
                          className="text-[9px] font-semibold tracking-widest uppercase text-orange-500 hover:text-orange-600"
                        >
                          see all →
                        </button>
                      </div>
                      <div className="space-y-4">
                        {goals.slice(0, 4).map((goal) => {
                          const cat = categories.find(
                            (c) => c.name === goal.category,
                          );
                          return (
                            <div key={goal.id} className="space-y-1.5">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-stone-700 dark:text-stone-300 truncate max-w-[120px]">
                                  {goal.title}
                                </span>
                                <span
                                  className="font-bold"
                                  style={{
                                    color: cat?.color || "#10b981",
                                  }}
                                >
                                  {Math.round(goal.progress)}%
                                </span>
                              </div>
                              <div className="h-1 w-full bg-stone-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${goal.progress}%`,
                                    backgroundColor: cat?.color || "#10b981",
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Desktop-only: Motivational quote */}
                    <div className="hidden lg:block p-6 rounded-[1.5rem] bg-orange-500/10 border border-orange-500/20">
                      <p className="text-sm font-medium text-orange-400">
                        {todayProgress === 100
                          ? "100% complete. Your consistency is compounding."
                          : todayProgress > 50
                            ? "Past halfway. The hardest part is behind you."
                            : new Date().getHours() < 12 && todayProgress === 0
                              ? "The best time to start is right now."
                              : "Don't let the day close without finishing."}
                      </p>
                    </div>
                  </div>
                  {/* End of grid */}
                  </div>
                  {/* Momentum Section — bottom on mobile, right column on desktop handled by lg:hidden */}
                  <div className="lg:hidden mt-6">
                    <button
                      onClick={() =>
                        setShowMomentumMobile(!showMomentumMobile)
                      }
                      className="w-full py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-bold text-stone-300 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                    >
                      {showMomentumMobile
                        ? "Hide Momentum"
                        : "Show Momentum"}
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform",
                          showMomentumMobile && "rotate-180",
                        )}
                      />
                    </button>

                    {showMomentumMobile && (
                      <div className="space-y-6 mt-4">
                        <div className="p-6 rounded-[1.5rem] bg-white dark:bg-white/[0.02] border border-stone-100 dark:border-white/5">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[9px] font-semibold tracking-widest uppercase text-stone-400">
                              Goal Progress
                            </span>
                            <button
                              onClick={() => setView("goals")}
                              className="text-[9px] font-semibold tracking-widest uppercase text-orange-500 hover:text-orange-600"
                            >
                              see all →
                            </button>
                          </div>
                          <div className="space-y-4">
                            {goals.slice(0, 4).map((goal) => {
                              const cat = categories.find(
                                (c) => c.name === goal.category,
                              );
                              return (
                                <div key={goal.id} className="space-y-1.5">
                                  <div className="flex justify-between text-xs">
                                    <span className="font-semibold text-stone-700 dark:text-stone-300 truncate max-w-[120px]">
                                      {goal.title}
                                    </span>
                                    <span
                                      className="font-bold"
                                      style={{
                                        color: cat?.color || "#10b981",
                                      }}
                                    >
                                      {Math.round(goal.progress)}%
                                    </span>
                                  </div>
                                  <div className="h-1 w-full bg-stone-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${goal.progress}%`,
                                        backgroundColor:
                                          cat?.color || "#10b981",
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="p-6 rounded-[1.5rem] bg-orange-500/10 border border-orange-500/20">
                          <p
                            className="text-sm font-medium text-orange-400"
                          >
                            {todayProgress === 100
                              ? "100% complete. Your consistency is compounding."
                              : todayProgress > 50
                                ? "Past halfway. The hardest part is behind you."
                                : new Date().getHours() < 12 &&
                                    todayProgress === 0
                                  ? "The best time to start is right now."
                                  : "Don't let the day close without finishing."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </motion.div>
  );
}
