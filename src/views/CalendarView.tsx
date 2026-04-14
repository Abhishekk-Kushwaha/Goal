import React from "react";

export function CalendarView(props: any) {
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
    newMilestone,
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
            <DndContext
              sensors={sensors}
              onDragStart={handleCalendarDragStart}
              onDragEnd={handleCalendarDragEnd}
            >
              <motion.div
                key="calendar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 md:p-8 max-w-6xl mx-auto w-full"
              >
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold font-mono-nums dark:text-white text-stone-900 tracking-tight mb-2">
                      Calendar
                    </h2>
                    <p className="dark:text-stone-500 text-stone-600 font-medium">
                      Track your daily milestones and achievements.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                    <button
                      onClick={() => setView("assign-tasks")}
                      className="w-full sm:w-auto justify-center px-4 py-2 bg-orange-500/10 text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)] rounded-xl font-bold text-sm hover:bg-orange-500/20 transition-colors flex items-center gap-2 border border-orange-500/20"
                    >
                      <Plus className="w-4 h-4" />
                      Assign Tasks
                    </button>
                    <div className="flex items-center justify-between gap-4 dark:bg-white/5 bg-stone-100 p-1 rounded-xl border dark:border-white/5 border-stone-200">
                      <button
                        onClick={() =>
                          setCurrentMonth(subMonths(currentMonth, 1))
                        }
                        className="p-2 dark:text-stone-400 dark:text-stone-500 text-stone-600 hover:dark:text-white text-stone-900 hover:dark:bg-white/5 bg-stone-100 rounded-lg transition-all"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-bold dark:text-white text-stone-900 min-w-[120px] text-center uppercase tracking-widest">
                        {format(currentMonth, "MMMM yyyy")}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentMonth(addMonths(currentMonth, 1))
                        }
                        className="p-2 dark:text-stone-400 dark:text-stone-500 text-stone-600 hover:dark:text-white text-stone-900 hover:dark:bg-white/5 bg-stone-100 rounded-lg transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Calendar Grid */}
                  <Card className="lg:col-span-2 p-6">
                    <div className="grid grid-cols-7 mb-4">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                          <div
                            key={day}
                            className="text-center text-[9px] font-semibold tracking-widest uppercase uppercase tracking-widest dark:text-stone-500 text-stone-600 py-2"
                          >
                            {day}
                          </div>
                        ),
                      )}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const monthStart = startOfMonth(currentMonth);
                        const monthEnd = endOfMonth(monthStart);
                        const startDate = startOfWeek(monthStart);
                        const endDate = endOfWeek(monthEnd);
                        const calendarDays = eachDayOfInterval({
                          start: startDate,
                          end: endDate,
                        });

                        return calendarDays.map((day, i) => {
                          const isCurrentMonth = isSameMonth(day, monthStart);
                          const isSelected = isSameDay(day, selectedDate);
                          const isTodayDay = isToday(day);
                          const dayMilestones = getItemsForDate(day);

                          return (
                            <DroppableCalendarDay
                              key={day.toString()}
                              day={day}
                              isCurrentMonth={isCurrentMonth}
                              isSelected={isSelected}
                              isTodayDay={isTodayDay}
                              dayMilestones={dayMilestones}
                              onClick={() => setSelectedDate(day)}
                            />
                          );
                        });
                      })()}
                    </div>
                  </Card>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Day Details */}
                    <Card className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-widest dark:text-stone-500 text-stone-600">
                            {isToday(selectedDate)
                              ? "Today's Schedule"
                              : format(selectedDate, "MMMM d, yyyy")}
                          </h3>
                          <p className="text-xs dark:text-stone-500 text-stone-600 mt-1">
                            {milestonesForSelectedDate.length} Milestones
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {milestonesForSelectedDate.some((m) => !m.done) && (
                            <button
                              onClick={() =>
                                handleMarkAllDone(
                                  milestonesForSelectedDate
                                    .filter((m) => !m.done)
                                    .map((m) => m.id),
                                )
                              }
                              className="px-3 py-1.5 bg-orange-500/10 text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)] text-[9px] font-semibold tracking-widest uppercase uppercase tracking-wider rounded-lg hover:bg-orange-500/20 transition-colors"
                            >
                              Mark All Done
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              setNewMilestone({
                                ...newMilestone,
                                due_date: format(selectedDate, "yyyy-MM-dd"),
                              });
                              setIsAddingMilestone(true);
                            }}
                            className="w-9 h-9 bg-orange-500/10 text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)] rounded-lg flex items-center justify-center hover:bg-orange-500/20 transition-colors"
                            title="Add milestone to this day"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selectedDate.toString()}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-3"
                        >
                          {milestonesForSelectedDate.length === 0 ? (
                            <div className="py-12 text-center border border-dashed dark:border-white/5 border-stone-200 rounded-2xl">
                              <p className="dark:text-stone-500 text-stone-600 text-xs italic">
                                No milestones scheduled for this day.
                              </p>
                            </div>
                          ) : (
                            milestonesForSelectedDate.map((ms, index) => (
                              <motion.div
                                key={ms.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(
                                  "p-4 rounded-2xl border transition-all duration-200 group",
                                  ms.done
                                    ? "bg-orange-500/5 border-orange-500/20 opacity-60"
                                    : "dark:bg-white/[0.02] bg-stone-50 dark:border-white/5 border-stone-200 hover:dark:border-white/10 hover:border-stone-300",
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <button
                                    onClick={async () => {
                                      if (ms.isHabit) {
                                        toggleHabitOptimistic(ms.id, selectedDate.toISOString());
                                      } else if (ms.isGoalAsMilestone) {
                                        toggleGoalCompletionOptimistic(ms.id, selectedDate.toISOString());
                                      } else {
                                        toggleMilestone(ms.id, selectedDate.toISOString());
                                      }
                                    }}
                                    className={cn(
                                      "mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-200",
                                      ms.done
                                        ? "bg-orange-500 text-[#431407] btn-extruded"
                                        : "border-2 dark:border-stone-700 border-stone-300 hover:dark:border-stone-500 hover:border-stone-400",
                                    )}
                                  >
                                    {ms.done && (
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <h4
                                      className={cn(
                                        "text-sm font-bold truncate",
                                        ms.done
                                          ? "dark:text-stone-500 text-stone-600 line-through"
                                          : "dark:text-white text-stone-900",
                                      )}
                                    >
                                      {ms.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{
                                          backgroundColor: ms.categoryColor,
                                        }}
                                      />
                                      <span className="text-[9px] font-semibold tracking-widest uppercase dark:text-stone-500 text-stone-600 uppercase truncate">
                                        {ms.goalTitle}
                                      </span>
                                      {ms.isGoalAsMilestone && (
                                        <span className="text-[10px] text-blue-400 bg-blue-400/10 px-1 rounded ml-1">
                                          Repeating Goal
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </Card>

                    {/* Unassigned Milestones Sidebar */}
                    <Card className="p-6 flex flex-col h-[400px]">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest dark:text-stone-500 text-stone-600">
                          Unassigned
                        </h3>
                        <Badge className="dark:bg-orange-500/10 bg-orange-50 text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)] border-orange-500/20">
                          {unassignedMilestones.length}
                        </Badge>
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                        {unassignedMilestones.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-4">
                            <CheckCircle2 className="w-8 h-8 text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)]/20 mb-2" />
                            <p className="dark:text-stone-500 text-stone-600 text-xs italic">
                              All milestones are assigned!
                            </p>
                          </div>
                        ) : (
                          unassignedMilestones.map((ms) => (
                            <DraggableMilestone
                              key={ms.id}
                              milestone={ms}
                              goalTitle={ms.goalTitle}
                            />
                          ))
                        )}
                      </div>
                      <p className="text-[10px] dark:text-stone-500 text-stone-600 mt-4 text-center italic">
                        Drag and drop onto the calendar to assign a due date.
                      </p>
                    </Card>

                    {/* Today's Summary Widget */}
                    {!isToday(selectedDate) && todayMilestones.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className="p-6 border-orange-500/20 bg-orange-500/[0.02]">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)]">
                              <TrendingUp className="w-4 h-4" />
                            </div>
                            <h3 className="text-[10px] font-semibold tracking-widest uppercase uppercase tracking-widest text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)]">
                              Today's Focus
                            </h3>
                          </div>
                          <div className="space-y-2">
                            {todayMilestones.map((ms) => (
                              <div
                                key={ms.id}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className={cn(
                                    "w-1 h-1 rounded-full",
                                    ms.done ? "bg-orange-500" : "bg-stone-700",
                                  )}
                                />
                                <span
                                  className={cn(
                                    "text-xs truncate",
                                    ms.done
                                      ? "dark:text-stone-500 text-stone-600 line-through"
                                      : "dark:text-stone-300 text-stone-700",
                                  )}
                                >
                                  {ms.title}
                                </span>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => setSelectedDate(new Date())}
                            className="w-full mt-4 py-2 rounded-xl bg-orange-500/10 text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)] text-[9px] font-semibold tracking-widest uppercase uppercase tracking-widest hover:bg-orange-500/20 transition-colors"
                          >
                            View Today
                          </button>
                        </Card>
                      </motion.div>
                    )}
                  </div>
                </div>
                <DragOverlay
                  dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                      styles: {
                        active: {
                          opacity: "0.5",
                        },
                      },
                    }),
                  }}
                >
                  {activeCalendarDragId && activeCalendarMilestone ? (
                    <div className="p-3 rounded-xl border border-orange-500/50 bg-orange-500/10 shadow-xl shadow-orange-500/20 pointer-events-none backdrop-blur-md">
                      <p className="text-[10px] font-semibold tracking-widest uppercase dark:text-white text-stone-900 truncate">
                        {activeCalendarMilestone.title}
                      </p>
                      <p className="text-[10px] dark:text-stone-500 text-stone-600 truncate">
                        {activeCalendarMilestone.goalTitle}
                      </p>
                    </div>
                  ) : null}
                </DragOverlay>
              </motion.div>
            </DndContext>
  );
}
