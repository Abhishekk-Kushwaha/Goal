import React from "react";

export function GoalsView(props: any) {
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
              key="goals"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 md:p-8 max-w-6xl mx-auto w-full pb-24"
            >

              {goals.length === 0 ? (
                <div className="py-32 text-center border border-dashed dark:border-white/5 border-stone-200 rounded-3xl dark:bg-white/[0.01] bg-stone-50">
                  <div className="w-20 h-20 dark:bg-white/5 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="w-10 h-10 dark:text-stone-500 text-stone-600" />
                  </div>
                  <h3 className="text-xl font-bold dark:text-white text-stone-900 mb-2">
                    No goals yet
                  </h3>
                  <p className="dark:text-stone-500 text-stone-600 text-sm mb-8 max-w-xs mx-auto">
                    Start by creating your first goal to track your progress and
                    achieve your dreams.
                  </p>
                  <button
                    onClick={() => setIsAddingGoal(true)}
                    className="px-8 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20"
                  >
                    Create First Goal
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  {goals.map((goal, i) => {
                    const cat = categories.find(
                      (c) => c.name === goal.category,
                    ) || { color: "#64748b", icon: "⚡" };
                    const progressVal = Math.round(goal.progress || 0);
                    const milestoneDone = (goal.milestones || []).filter(m => m.done).length;
                    const milestoneTotal = (goal.milestones || []).length;
                    
                    return (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => {
                          setActiveGoalId(goal.id);
                          setView("detail");
                        }}
                        className="group cursor-pointer relative overflow-hidden rounded-2xl border dark:border-white/[0.06] border-stone-200/80 dark:bg-white/[0.02] bg-white hover:dark:bg-white/[0.04] hover:bg-stone-50 hover:dark:border-white/10 hover:border-stone-300 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/5"
                      >
                        {/* Category color accent bar */}
                        <div
                          className="absolute top-0 left-0 w-full h-[3px] opacity-60 group-hover:opacity-100 transition-opacity"
                          style={{ background: `linear-gradient(to right, ${cat.color}, transparent)` }}
                        />

                        <div className="p-5 flex items-center gap-4">
                          {/* Progress Ring */}
                          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                              <circle
                                cx="18" cy="18" r="15.5"
                                fill="none"
                                className="dark:stroke-white/[0.06] stroke-stone-200"
                                strokeWidth="2.5"
                              />
                              <circle
                                cx="18" cy="18" r="15.5"
                                fill="none"
                                stroke={cat.color}
                                strokeWidth="2.5"
                                strokeDasharray={`${(progressVal / 100) * 97.4} 97.4`}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                              />
                            </svg>
                            <span
                              className="text-[11px] font-black relative z-10"
                              style={{ color: cat.color }}
                            >
                              {progressVal}%
                            </span>
                          </div>

                          {/* Title & Meta */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[15px] font-bold dark:text-white text-stone-900 truncate mb-1.5 group-hover:text-orange-400 transition-colors">
                              {goal.title}
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Priority pill */}
                              <span className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider",
                                goal.priority === 'High' ? 'bg-rose-500/10 text-rose-400' :
                                goal.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-emerald-500/10 text-emerald-400'
                              )}>
                                <span className={`w-1 h-1 rounded-full ${goal.priority === 'High' ? 'bg-rose-400' : goal.priority === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                {goal.priority}
                              </span>
                              {/* Category pill */}
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
                                style={{ 
                                  background: `${cat.color}15`,
                                  color: cat.color 
                                }}
                              >
                                {goal.category}
                              </span>
                              {/* Milestone count */}
                              {milestoneTotal > 0 && (
                                <span className="text-[9px] font-semibold dark:text-stone-500 text-stone-400 tracking-wider uppercase">
                                  {milestoneDone}/{milestoneTotal} done
                                </span>
                              )}
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Floating Action Button */}
              <motion.button
                onClick={() => setIsAddingGoal(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-24 md:bottom-8 right-6 md:right-8 z-[100] w-14 h-14 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xl shadow-orange-500/30 hover:bg-orange-400 hover:shadow-orange-500/40 transition-colors"
              >
                <Plus className="w-6 h-6" />
              </motion.button>
            </motion.div>
  );
}
