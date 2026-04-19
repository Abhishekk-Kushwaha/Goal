import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from "recharts";

export function DashboardView(props: any) {
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
    requestInstallApp,
    showInstallHelp,
    setShowInstallHelp,
    installPlatform,
    isAppInstalled,
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
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 md:p-8 max-w-6xl mx-auto w-full"
            >
              <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold font-mono-nums dark:text-white text-stone-900 tracking-tight mb-2">
                    Dashboard
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
                  <button
                    onClick={() => setIsCustomizingLayout(true)}
                    className="p-2 dark:bg-white/5 bg-stone-100 border dark:border-white/5 border-stone-200 rounded-xl dark:text-stone-400 dark:text-stone-500 text-stone-600 hover:dark:text-white text-stone-900 transition-colors"
                    title="Customize Layout"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <div className="px-4 py-2 dark:bg-white/5 bg-stone-100 border dark:border-white/5 border-stone-200 rounded-xl flex items-center gap-3">
                    <Calendar className="w-4 h-4 dark:text-stone-500 text-stone-600" />
                    <span className="text-sm font-medium dark:text-stone-300 text-stone-700">
                      {format(currentDate, "EEEE, MMM do")}
                    </span>
                  </div>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-max">
                {dashboardLayout
                  .filter((w) => w.visible)
                  .map((widget) => {
                    switch (widget.id) {
                      case "stats":
                        return (
                          <div
                            key="stats"
                            className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
                          >
                            {[
                              {
                                label: "Total Goals",
                                value: stats.total,
                                icon: Target,
                                color:
                                  "text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)]",
                                bg: "bg-orange-500/10",
                              },
                              {
                                label: "Completed",
                                value: stats.completed,
                                icon: Award,
                                color: "text-indigo-400",
                                bg: "bg-indigo-400/10",
                              },
                              {
                                label: "Avg Progress",
                                value: stats.avgProgress + "%",
                                icon: TrendingUp,
                                color: "text-amber-400",
                                bg: "bg-amber-400/10",
                              },
                              {
                                label: "Milestones",
                                value: `${stats.completedMilestones}/${stats.totalMilestones}`,
                                icon: CheckCircle2,
                                color: "text-sky-400",
                                bg: "bg-sky-400/10",
                              },
                            ].map((stat, i) => (
                              <Card
                                key={stat.label}
                                className="p-5 md:p-6 transition-all duration-500 hover:-translate-y-0.5 hover:bg-white/[0.035] border border-white/[0.06] hover:border-white/[0.09] relative overflow-hidden group"
                              >
                                {/* Glowing accent bubble */}
                                <div className={cn("absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500", stat.bg)} />

                                <div className="flex justify-between items-start mb-4">
                                  <div
                                    className={cn("p-2.5 rounded-xl", stat.bg)}
                                  >
                                    <stat.icon
                                      className={cn("w-5 h-5", stat.color)}
                                    />
                                  </div>
                                </div>
                                <p className="dark:text-stone-500 text-stone-600 text-[9px] font-semibold tracking-widest uppercase uppercase tracking-widest mb-1">
                                  {stat.label}
                                </p>
                                <h3 className="text-2xl font-extrabold dark:text-white text-stone-900 font-mono">
                                  {stat.value}
                                </h3>
                              </Card>
                            ))}
                          </div>
                        );
                      case "progress":
                        return (
                          <Card
                            key="progress"
                            className="lg:col-span-2 p-6 md:p-8 transition-all duration-500 hover:-translate-y-0.5 hover:bg-white/[0.035] border border-white/[0.06] hover:border-white/[0.09] group"
                            delay={0.2}
                          >
                            <div className="flex justify-between items-center mb-8">
                              <h3 className="text-sm font-bold uppercase tracking-widest dark:text-stone-500 text-stone-600">
                                Goal Progress
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-semibold tracking-widest uppercase dark:text-stone-400 dark:text-stone-500 text-stone-600 uppercase">
                                  Percentage
                                </span>
                              </div>
                            </div>
                            <div className="h-[240px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={chartData}
                                  margin={{
                                    top: 0,
                                    right: 0,
                                    left: -20,
                                    bottom: 0,
                                  }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="4 4"
                                    vertical={false}
                                    stroke={
                                      theme === "dark"
                                        ? "rgba(255,255,255,0.02)"
                                        : "rgba(0,0,0,0.02)"
                                    }
                                  />
                                  <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                      fill:
                                        theme === "dark"
                                          ? "#64748b"
                                          : "#94a3b8",
                                      fontSize: 10,
                                      fontWeight: 600,
                                    }}
                                    dy={10}
                                  />
                                  <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                      fill:
                                        theme === "dark"
                                          ? "#64748b"
                                          : "#94a3b8",
                                      fontSize: 10,
                                    }}
                                    allowDecimals={false}
                                    dx={-10}
                                  />
                                  <Tooltip
                                    cursor={{
                                      fill:
                                        theme === "dark"
                                          ? "rgba(255,255,255,0.03)"
                                          : "rgba(0,0,0,0.03)",
                                    }}
                                    content={<CustomBarTooltip />}
                                  />
                                  <Bar
                                    dataKey="progress"
                                    radius={[4, 4, 0, 0]}
                                    barSize={32}
                                  >
                                    {chartData.map((entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        fillOpacity={0.8}
                                      />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </Card>
                        );
                      case "repeatability":
                        return (
                          <Card
                            key="repeatability"
                            className="lg:col-span-3 p-6 md:p-8 transition-all duration-500 hover:-translate-y-0.5 hover:bg-white/[0.035] border border-white/[0.06] hover:border-white/[0.09] group"
                            delay={0.25}
                          >
                            <div className="flex items-center justify-between mb-8">
                              <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest dark:text-stone-500 text-stone-600">
                                  Repeatability Track
                                </h3>
                                <p className="text-xs dark:text-stone-400 dark:text-stone-500 text-stone-600 mt-1">
                                  Completed vs Missed repeating goals over the
                                  last 7 days
                                </p>
                              </div>
                            </div>
                            <div className="h-[240px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={repeatabilityData}
                                  margin={{
                                    top: 0,
                                    right: 0,
                                    left: -20,
                                    bottom: 0,
                                  }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="4 4"
                                    vertical={false}
                                    stroke={
                                      theme === "dark"
                                        ? "rgba(255,255,255,0.02)"
                                        : "rgba(0,0,0,0.02)"
                                    }
                                  />
                                  <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                      fill:
                                        theme === "dark"
                                          ? "#64748b"
                                          : "#94a3b8",
                                      fontSize: 10,
                                      fontWeight: 600,
                                    }}
                                    dy={10}
                                  />
                                  <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                      fill:
                                        theme === "dark"
                                          ? "#64748b"
                                          : "#94a3b8",
                                      fontSize: 10,
                                    }}
                                    allowDecimals={false}
                                    dx={-10}
                                  />
                                  <Tooltip
                                    cursor={{
                                      fill:
                                        theme === "dark"
                                          ? "rgba(255,255,255,0.03)"
                                          : "rgba(0,0,0,0.03)",
                                    }}
                                    content={<CustomBarTooltip />}
                                  />
                                  <Bar
                                    dataKey="Completed"
                                    stackId="a"
                                    fill="#10b981"
                                    radius={[0, 0, 0, 0]}
                                    barSize={32}
                                  />
                                  <Bar
                                    dataKey="Missed"
                                    stackId="a"
                                    fill="#ef4444"
                                    radius={[4, 4, 0, 0]}
                                    barSize={32}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </Card>
                        );
                      case "categories":
                        return (
                          <Card
                            key="categories"
                            className="lg:col-span-1 p-6 md:p-8 transition-all duration-500 hover:-translate-y-0.5 hover:bg-white/[0.035] border border-white/[0.06] hover:border-white/[0.09] flex flex-col justify-between group"
                            delay={0.25}
                          >
                            <h3 className="text-sm font-bold uppercase tracking-widest dark:text-stone-500 text-stone-600 mb-8">
                              Categories
                            </h3>
                            <div className="h-[200px] w-full relative">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={categoryData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                  >
                                    {categoryData.map((entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        stroke="none"
                                      />
                                    ))}
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold font-mono-nums dark:text-white text-stone-900">
                                  {stats.total}
                                </span>
                                <span className="text-[9px] font-semibold tracking-widest uppercase dark:text-stone-500 text-stone-600 uppercase">
                                  Total
                                </span>
                              </div>
                            </div>
                            <div className="mt-6 space-y-2">
                              {categoryData.map((cat) => (
                                <div
                                  key={cat.name}
                                  className="flex justify-between items-center"
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: cat.color }}
                                    />
                                    <span className="text-xs font-medium dark:text-stone-400 dark:text-stone-500 text-stone-600">
                                      {cat.name}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-semibold tracking-widest uppercase dark:text-white text-stone-900">
                                    {cat.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </Card>
                        );
                      case "trends":
                        return (
                          <Card
                            key="trends"
                            className="lg:col-span-2 p-6 md:p-8 transition-all duration-500 hover:-translate-y-0.5 hover:bg-white/[0.035] border border-white/[0.06] hover:border-white/[0.09] group"
                            delay={0.2}
                          >
                            <div className="flex items-center justify-between mb-8">
                              <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest dark:text-stone-500 text-stone-600">
                                  Historical Trends
                                </h3>
                                <p className="text-xs dark:text-stone-400 dark:text-stone-500 text-stone-600 mt-1">
                                  Milestone completion over the last 7 days
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-orange-400">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-[10px] font-semibold tracking-widest uppercase">
                                  +{productivityInsights.total} this week
                                </span>
                              </div>
                            </div>

                            <div className="h-[260px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                  data={trendData}
                                  margin={{
                                    top: 10,
                                    right: 10,
                                    left: -20,
                                    bottom: 0,
                                  }}
                                >
                                  <defs>
                                    <linearGradient
                                      id="colorCompletions"
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1"
                                    >
                                      <stop
                                        offset="5%"
                                        stopColor="#f97316"
                                        stopOpacity={0.4}
                                      />
                                      <stop
                                        offset="95%"
                                        stopColor="#f97316"
                                        stopOpacity={0}
                                      />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid
                                    strokeDasharray="4 4"
                                    stroke={
                                      theme === "dark"
                                        ? "rgba(255,255,255,0.02)"
                                        : "rgba(0,0,0,0.02)"
                                    }
                                    vertical={false}
                                  />
                                  <XAxis
                                    dataKey="name"
                                    stroke={
                                      theme === "dark" ? "#64748b" : "#94a3b8"
                                    }
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                  />
                                  <YAxis
                                    stroke={
                                      theme === "dark" ? "#64748b" : "#94a3b8"
                                    }
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                    dx={-10}
                                  />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Area
                                    type="monotone"
                                    dataKey="completions"
                                    stroke="#f97316"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorCompletions)"
                                    animationDuration={1500}
                                    activeDot={{
                                      r: 6,
                                      strokeWidth: 4,
                                      stroke: "white",
                                      fill: "#f97316",
                                    }}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>

                            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t dark:border-white/5 border-stone-200">
                              <div className="p-4 rounded-xl dark:bg-white/5 bg-stone-100 border dark:border-white/5 border-stone-200">
                                <p className="text-[9px] font-semibold tracking-widest uppercase uppercase tracking-widest dark:text-stone-500 text-stone-600 mb-1">
                                  Peak Performance
                                </p>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-lg font-bold dark:text-white text-stone-900">
                                    {productivityInsights.peak}
                                  </span>
                                  <span className="text-xs text-orange-400">
                                    {productivityInsights.peakValue} completions
                                  </span>
                                </div>
                              </div>
                              <div className="p-4 rounded-xl dark:bg-white/5 bg-stone-100 border dark:border-white/5 border-stone-200">
                                <p className="text-[9px] font-semibold tracking-widest uppercase uppercase tracking-widest dark:text-stone-500 text-stone-600 mb-1">
                                  Daily Average
                                </p>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-lg font-bold dark:text-white text-stone-900">
                                    {productivityInsights.avg}
                                  </span>
                                  <span className="text-xs dark:text-stone-400 dark:text-stone-500 text-stone-600">
                                    milestones/day
                                  </span>
                                </div>
                              </div>
                              <div className="p-4 rounded-xl dark:bg-orange-500/10 bg-orange-50 border dark:border-orange-500/20 border-orange-500/10 col-span-full md:col-span-1">
                                <p className="text-[9px] font-semibold tracking-widest uppercase uppercase tracking-widest text-orange-600 dark:text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)] mb-1">
                                  Productivity Insight
                                </p>
                                <p className="text-xs dark:text-orange-300 text-orange-700 leading-relaxed font-medium">
                                  {productivityInsights.message}
                                </p>
                              </div>
                            </div>
                          </Card>
                        );
                      case "focus":
                        return (
                          <Card
                            key="focus"
                            className="lg:col-span-1 p-6 md:p-8 transition-all duration-500 hover:-translate-y-0.5 hover:bg-white/[0.035] border border-white/[0.06] hover:border-white/[0.09] group"
                            delay={0.3}
                          >
                            <div className="flex justify-between items-center mb-8">
                              <h3 className="text-sm font-bold uppercase tracking-widest dark:text-stone-500 text-stone-600">
                                Today's Focus
                              </h3>
                              <button
                                onClick={async () => {
                                  setView("calendar");
                                  setSelectedDate(new Date());
                                  setActiveGoalId(null);
                                }}
                                className="text-[9px] font-semibold tracking-widest uppercase text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)] hover:underline uppercase tracking-widest"
                              >
                                Calendar
                              </button>
                            </div>
                            <div className="space-y-4">
                              {todayMilestones.length === 0 ? (
                                <div className="py-10 text-center border border-dashed dark:border-white/5 border-stone-200 rounded-2xl">
                                  <p className="text-stone-600 text-xs italic">
                                    No milestones for today.
                                  </p>
                                </div>
                              ) : (
                                todayMilestones.map((ms) => (
                                  <div
                                    key={ms.id}
                                    className="flex items-center gap-3 group"
                                  >
                                    <button
                                      onClick={async () => {
                                        if (ms.isHabit) {
                                          toggleHabitOptimistic(ms.id, new Date().toISOString());
                                        } else if (ms.isGoalAsMilestone) {
                                          toggleGoalCompletionOptimistic(ms.id, new Date().toISOString());
                                        } else {
                                          toggleMilestone(ms.id);
                                        }
                                      }}
                                      className={cn(
                                        "w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-200",
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
                                      <p
                                        className={cn(
                                          "text-[10px] font-semibold tracking-widest uppercase truncate",
                                          ms.done
                                            ? "text-stone-600 line-through"
                                            : "dark:text-stone-200 text-stone-800",
                                        )}
                                      >
                                        {ms.title}
                                      </p>
                                      <p className="text-[10px] dark:text-stone-500 text-stone-600 uppercase font-bold truncate">
                                        {ms.goalTitle}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </Card>
                        );
                      default:
                        return null;
                    }
                  })}
              </div>

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
