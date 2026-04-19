import React, { useState } from "react";
import { storage } from "../storage";
import { TaskPreviewCard } from "../components/TaskPreviewCard";

export function GoalDetailView(props: any) {
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
    featuredGoalId,
    setFeaturedGoalId,
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
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [previewMilestone, setPreviewMilestone] = useState<any | null>(null);

  const handleTitleSave = async () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== activeGoal?.title) {
      await storage.updateGoal(activeGoal.id, { title: trimmed });
      await fetchGoals();
    }
    setEditingTitle(false);
  };

  return (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 md:p-8 max-w-5xl mx-auto w-full"
            >
              {activeGoal ? (
                <>
                  <button
                    onClick={() => setView("goals")}
                    className="flex items-center gap-2 dark:text-stone-500 text-stone-600 hover:dark:text-white text-stone-900 transition-colors mb-6 md:mb-8 group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">
                      Back to Goals
                    </span>
                  </button>

                  <div className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-1">
                      <header className="mb-10">
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-4xl">
                            {categories.find(
                              (c) => c.name === activeGoal.category,
                            )?.icon || "ðŸŽ¯"}
                          </span>
                          <Badge
                            className={PRIORITY_COLORS[activeGoal.priority]}
                          >
                            {activeGoal.priority} Priority
                          </Badge>
                          <Badge className="text-orange-400 bg-orange-400/10 border-orange-400/20">
                            {activeGoal.category}
                          </Badge>
                        </div>
                        <div className="mb-5">
                          <button
                            onClick={() => setFeaturedGoalId(activeGoal.id)}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors",
                              featuredGoalId === activeGoal.id
                                ? "border-sky-400/20 bg-sky-400/10 text-sky-300"
                                : "border-white/10 bg-white/[0.03] text-white/72 hover:bg-white/[0.05]",
                            )}
                          >
                            <Target className="w-3.5 h-3.5" />
                            {featuredGoalId === activeGoal.id
                              ? "Featured Goal"
                              : "Make Featured Goal"}
                          </button>
                        </div>
                        {editingTitle ? (
                          <input
                            autoFocus
                            value={titleDraft}
                            onChange={(e) => setTitleDraft(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleTitleSave();
                              if (e.key === "Escape") setEditingTitle(false);
                            }}
                            className="text-4xl font-extrabold dark:text-white text-stone-900 tracking-tight mb-4 bg-transparent border-b-2 border-orange-500 outline-none w-full"
                          />
                        ) : (
                          <h2
                            onClick={() => {
                              setTitleDraft(activeGoal.title);
                              setEditingTitle(true);
                            }}
                            className="text-4xl font-extrabold dark:text-white text-stone-900 tracking-tight mb-4 cursor-text hover:text-orange-400 transition-colors"
                            title="Click to edit"
                          >
                            {activeGoal.title}
                          </h2>
                        )}
                        {activeGoal.note && (
                          <p className="dark:text-stone-400 text-stone-600 text-lg leading-relaxed italic border-l-2 dark:border-white/10 border-stone-300 pl-6">
                            {activeGoal.note}
                          </p>
                        )}
                      </header>

                      <div className="space-y-8">
                        {(!activeGoal.repeat ||
                          activeGoal.repeat === "None") && (
                          <div>
                            <div className="flex justify-between items-center mb-6">
                              <h3 className="text-sm font-bold uppercase tracking-widest dark:text-stone-500 text-stone-600">
                                Milestones
                              </h3>
                              <button
                                onClick={() => setIsAddingMilestone(true)}
                                className="flex items-center gap-2 text-[10px] font-semibold tracking-widest uppercase text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)] hover:text-orange-400 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                                Add Milestone
                              </button>
                            </div>

                            <div className="space-y-3">
                              {(activeGoal.milestones || []).length === 0 ? (
                                <div className="py-12 text-center dark:bg-white/[0.02] bg-stone-50 border border-dashed dark:border-white/5 border-stone-200 rounded-2xl">
                                  <p className="dark:text-stone-500 text-stone-600 text-sm">
                                    No milestones yet. Break down your goal into
                                    smaller steps.
                                  </p>
                                </div>
                              ) : (
                                (activeGoal.milestones || []).map((ms) => {
                                  const isDone =
                                    ms.repeat && ms.repeat !== "None"
                                      ? isCompletedOnDate(ms, new Date())
                                      : ms.done === 1 || ms.done === true;

                                  return (
                                    <div
                                      key={ms.id}
                                      className={cn(
                                        "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200",
                                        isDone
                                          ? "bg-orange-500/5 border-orange-500/20 opacity-60"
                                          : "dark:bg-white/[0.02] bg-stone-50 dark:border-white/5 border-stone-200 hover:dark:border-white/10 hover:border-stone-300",
                                      )}
                                    >
                                      <button
                                        onClick={() => toggleMilestone(ms.id)}
                                        className={cn(
                                          "w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200",
                                          isDone
                                            ? "bg-orange-500 text-[#431407] btn-extruded"
                                            : "border-2 dark:border-stone-700 border-stone-300 hover:dark:border-stone-500 hover:border-stone-400",
                                        )}
                                      >
                                        {isDone && (
                                          <CheckCircle2 className="w-4 h-4" />
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setPreviewMilestone({ ...ms, isDone })}
                                        className="flex-1 min-w-0 text-left"
                                        aria-label={`Preview ${ms.title}`}
                                      >
                                        <h5
                                          className={cn(
                                            "text-sm font-bold truncate",
                                            isDone
                                              ? "dark:text-stone-400 dark:text-stone-500 text-stone-600 line-through"
                                              : "dark:text-white text-stone-900",
                                          )}
                                        >
                                          {ms.title}
                                        </h5>
                                        <div className="flex items-center gap-2 mt-1">
                                          {ms.due_date &&
                                            isValidDate(ms.due_date) && (
                                              <p className="text-[9px] font-semibold tracking-widest uppercase dark:text-stone-500 text-stone-600 uppercase">
                                                Due{" "}
                                                {format(
                                                  new Date(ms.due_date),
                                                  "MMM d",
                                                )}
                                              </p>
                                            )}
                                          {ms.repeat &&
                                            ms.repeat !== "None" && (
                                              <span className="text-[10px] text-blue-400 bg-blue-400/10 px-1 rounded">
                                                Repeats {ms.repeat}
                                              </span>
                                            )}
                                        </div>
                                      </button>
                                      <button
                                        onClick={() => deleteMilestone(ms.id)}
                                        className="p-2 dark:text-stone-500 text-stone-600 hover:text-rose-400 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-full lg:w-80 space-y-6">
                      <Card className="p-8 text-center">
                        <div className="relative inline-block mb-6">
                          <svg className="w-32 h-32 transform -rotate-90">
                            <circle
                              cx="64"
                              cy="64"
                              r="58"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="transparent"
                              className="dark:text-white text-stone-900/5"
                            />
                            <motion.circle
                              cx="64"
                              cy="64"
                              r="58"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="transparent"
                              strokeDasharray={364.4}
                              initial={{ strokeDashoffset: 364.4 }}
                              animate={{
                                strokeDashoffset:
                                  364.4 - (364.4 * activeGoal.progress) / 100,
                              }}
                              className="text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)]"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black dark:text-white text-stone-900 font-mono">
                              {activeGoal.progress}%
                            </span>
                            <span className="text-[9px] font-semibold tracking-widest uppercase dark:text-stone-500 text-stone-600 uppercase">
                              Done
                            </span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between text-xs">
                            <span className="dark:text-stone-500 text-stone-600 font-bold uppercase tracking-widest">
                              Status
                            </span>
                            <span
                              className={cn(
                                "font-bold",
                                activeGoal.progress === 100
                                  ? "text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)]"
                                  : "text-amber-400",
                              )}
                            >
                              {activeGoal.progress === 100
                                ? "Completed"
                                : "In Progress"}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="dark:text-stone-500 text-stone-600 font-bold uppercase tracking-widest">
                              Deadline
                            </span>
                            <span className="dark:text-white text-stone-900 font-bold">
                              {isValidDate(activeGoal.deadline)
                                ? format(
                                    new Date(activeGoal.deadline!),
                                    "MMM d, yyyy",
                                  )
                                : "None"}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="dark:text-stone-500 text-stone-600 font-bold uppercase tracking-widest">
                              Streak
                            </span>
                            <span className="text-orange-400 font-bold flex items-center gap-1">
                              <Flame className="w-3 h-3" />
                              {activeGoal.streak} Days
                            </span>
                          </div>
                        </div>
                        <div className="mt-8 pt-8 border-t dark:border-white/5 border-stone-200">
                          <button
                            onClick={() => handleDeleteGoal(activeGoal.id)}
                            className="w-full py-3 rounded-xl border border-rose-500/20 text-rose-500 text-[10px] font-semibold tracking-widest uppercase uppercase tracking-widest hover:bg-rose-500/10 transition-colors"
                          >
                            Delete Goal
                          </button>
                        </div>
                      </Card>

                      <Card className="p-6">
                        <h4 className="text-[9px] font-semibold tracking-widest uppercase uppercase tracking-widest dark:text-stone-500 text-stone-600 mb-4">
                          Insights
                        </h4>
                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                              <TrendingUp className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold tracking-widest uppercase dark:text-white text-stone-900 mb-0.5">
                                Momentum
                              </p>
                              <p className="text-[10px] dark:text-stone-500 text-stone-600 leading-relaxed">
                                {activeGoal.progress > 50
                                  ? "You're past the halfway mark! Keep the momentum going."
                                  : "Early stages. Consistency is key right now."}
                              </p>
                            </div>
                          </div>
                          {isValidDate(activeGoal.deadline) &&
                            isPast(new Date(activeGoal.deadline!)) &&
                            activeGoal.progress < 100 && (
                              <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                                  <Clock className="w-5 h-5 text-rose-400" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-semibold tracking-widest uppercase text-rose-400 mb-0.5">
                                    Overdue
                                  </p>
                                  <p className="text-[10px] dark:text-stone-500 text-stone-600 leading-relaxed">
                                    The target date has passed. Consider
                                    adjusting your timeline.
                                  </p>
                                </div>
                              </div>
                            )}
                        </div>
                      </Card>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="dark:text-stone-500 text-stone-600">
                    Goal not found.
                  </p>
                </div>
              )}
              <TaskPreviewCard
                open={Boolean(previewMilestone)}
                onClose={() => setPreviewMilestone(null)}
                title={previewMilestone?.title || ""}
                subtitle={activeGoal?.title || "Milestone"}
                accentColor={
                  categories.find((category: any) => category.name === activeGoal?.category)?.color ||
                  "#f97316"
                }
                metadata={[
                  {
                    label: "Due",
                    value:
                      previewMilestone?.due_date && isValidDate(previewMilestone.due_date)
                        ? format(new Date(previewMilestone.due_date), "MMM d, yyyy")
                        : undefined,
                    icon: "calendar",
                  },
                  {
                    label: "Repeat",
                    value:
                      previewMilestone?.repeat && previewMilestone.repeat !== "None"
                        ? previewMilestone.repeat
                        : undefined,
                    icon: "repeat",
                  },
                  {
                    label: "Status",
                    value: previewMilestone ? (previewMilestone.isDone ? "Completed" : "Open") : undefined,
                    icon: "status",
                  },
                ]}
              />
            </motion.div>
  );
}
