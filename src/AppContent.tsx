import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Target,
  Plus,
  ChevronRight,
  ChevronDown,
  Calendar,
  CalendarDays,
  Flame,
  CheckCircle2,
  Trash2,
  ArrowLeft,
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  Award,
  Settings,
  Eye,
  EyeOff,
  GripVertical,
  X,
  Sun,
  Moon,
  Activity,
  Zap,
  Trophy,
  User,
  Check,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from "recharts";
import { motion, AnimatePresence, Reorder } from "motion/react";
import {
  DndContext,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  format,
  differenceInDays,
  isPast,
  isToday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isSameWeek,
  addMonths,
  subMonths,
  addDays,
  parseISO,
} from "date-fns";
import { cn } from "./lib/utils";
import { Card } from "./components/ui/Card";
import { Badge } from "./components/ui/Badge";
import { CustomBarTooltip } from "./components/ui/CustomBarTooltip";
import { CustomTooltip } from "./components/ui/CustomTooltip";
import {
  storage,
  isCompletedOnDate,
  type Goal,
  type Milestone,
} from "./storage";
import { supabase } from "./lib/supabase";
import { Auth } from "./components/Auth";
import { Sidebar } from "./components/Sidebar";
import { DraggableMilestone as SharedDraggableMilestone } from "./components/dnd/DraggableMilestone";
import {
  DroppableCalendarDay as SharedDroppableCalendarDay,
} from "./components/dnd/DroppableDay";
import { CircularProgress as SharedCircularProgress } from "./components/ui/CircularProgress";
import { ViewContainer } from "./components/ViewContainer";
import { useAppRouter } from "./hooks/useAppRouter";
import { useAppInteractions } from "./hooks/useAppInteractions";
import { useGoals } from "./hooks/useGoals";
import { useHabits } from "./hooks/useHabits";
import { useToday } from "./hooks/useToday";
import { useSessionState } from "./hooks/useSessionState";
import { useCategories } from "./hooks/useCategories";
import { useCalendarData } from "./hooks/useCalendarData";
import { useDashboardData } from "./hooks/useDashboardData";

import { CustomizeDashboardModal } from "./components/modals/CustomizeDashboardModal";
import { GoalModal } from "./components/modals/GoalModal";
import { HabitModal } from "./components/modals/HabitModal";
import { MilestoneModal } from "./components/modals/MilestoneModal";
import { CategoryModal } from "./components/modals/CategoryModal";

// --- Utility ---
const uid = () => crypto.randomUUID();

const isValidDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
};

// --- Types ---
// Types are now imported from storage.ts

const PRIORITY_COLORS = {
  High: "dark:text-rose-400 text-rose-700 dark:bg-rose-400/10 bg-rose-50 dark:border-rose-400/20 border-rose-200",
  Medium:
    "dark:text-amber-400 text-amber-700 dark:bg-amber-400/10 bg-amber-50 dark:border-amber-400/20 border-amber-200",
  Low: "dark:text-orange-400 text-orange-700 dark:bg-orange-400/10 bg-orange-50 dark:border-orange-400/20 border-orange-200",
};

// --- Components ---

// Card and Badge extracted

type WidgetId =
  | "stats"
  | "progress"
  | "categories"
  | "focus"
  | "goals"
  | "trends"
  | "repeatability";

interface WidgetConfig {
  id: WidgetId;
  visible: boolean;
  label: string;
}

// Tooltips extracted

export default function App() {
  const { session, isSessionLoading } = useSessionState();
  const { view, setView } = useAppRouter();

  const [isCustomizingLayout, setIsCustomizingLayout] = useState(false);
  const [dismissedConquered, setDismissedConquered] = useState(false);
  const [dashboardLayout, setDashboardLayout] = useState<WidgetConfig[]>(() => {
    const defaultLayout: WidgetConfig[] = [
      { id: "stats", visible: true, label: "Quick Stats" },
      { id: "progress", visible: true, label: "Goal Progress" },
      { id: "trends", visible: true, label: "Historical Trends" },
      { id: "repeatability", visible: true, label: "Repeatability Track" },
      { id: "categories", visible: true, label: "Category Breakdown" },
      { id: "focus", visible: true, label: "Today's Focus" },
    ];

    const saved = localStorage.getItem("forge_dashboard_layout");
    if (saved) {
      try {
        const parsed: WidgetConfig[] = JSON.parse(saved);
        const merged = [...parsed];
        defaultLayout.forEach((def) => {
          if (!merged.find((m) => m.id === def.id)) {
            merged.push(def);
          }
        });
        return merged;
      } catch (e) {
        return defaultLayout;
      }
    }
    return defaultLayout;
  });

  useEffect(() => {
    localStorage.setItem(
      "forge_dashboard_layout",
      JSON.stringify(dashboardLayout),
    );
  }, [dashboardLayout]);

  const theme = "dark";
  const setTheme = () => {};

  useEffect(() => {
    localStorage.setItem("forge_theme", "dark");
    const root = document.documentElement;
    const body = document.body;
    root.classList.add("dark");
    body.classList.add("dark");
    root.style.colorScheme = "dark";
    body.style.colorScheme = "dark";
  }, []);

  const {
    categories,
    setCategories,
    editingCategory,
    setEditingCategory,
    isAddingCategory,
    setIsAddingCategory,
    newCategory,
    setNewCategory,
    fetchCategories,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
  } = useCategories({
    onCategoriesChanged: () => fetchGoals(),
  });

  const {
    goals,
    setGoals,
    fetchGoals: fetchGoalList,
    handleAddGoal,
    handleDeleteGoal,
    handleEditGoal,
    activeGoalId,
    setActiveGoalId,
    editingGoal,
    setEditingGoal,
    isAddingGoal,
    setIsAddingGoal,
    isSaving: goalIsSaving,
    newGoal,
    setNewGoal,
    cancelGoalForm,
  } = useGoals({ categories, setView });

  const {
    habits,
    setHabits,
    fetchHabits,
    handleAddHabit,
    handleDeleteHabit,
    handleEditHabit,
    editingHabit,
    setEditingHabit,
    isAddingHabit,
    setIsAddingHabit,
    isSaving: habitIsSaving,
    newHabit,
    setNewHabit,
    cancelHabitForm,
  } = useHabits({ categories });

  const [loading, setLoading] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const fetchGoals = async () => {
    await Promise.all([fetchGoalList(), fetchHabits()]);
  };

  const [milestoneSaving, setMilestoneSaving] = useState(false);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const isSaving = goalIsSaving || habitIsSaving || milestoneSaving;

  const [newMilestone, setNewMilestone] = useState({
    title: "",
    due_date: "",
    note: "",
    goal_id: "",
    repeat: "None" as "None" | "Daily" | "Weekly" | "Monthly",
  });

  const [carouselIndex, setCarouselIndex] = useState(0);
  const [todayGraphView, setTodayGraphView] = useState<"week" | "month">("week");
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [showMomentumMobile, setShowMomentumMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCustomizingNav, setIsCustomizingNav] = useState(false);

  const {
    selectedDate,
    setSelectedDate,
    currentMonth,
    setCurrentMonth,
    activeCalendarDragId,
    sensors,
    allCalendarItems,
    getItemsForDate,
    milestonesForSelectedDate,
    unassignedMilestones,
    activeCalendarMilestone,
    handleCalendarDragStart,
    handleCalendarDragEnd,
  } = useCalendarData({
    goals,
    habits,
    categories,
    setGoals,
  });

  useEffect(() => {
    if (session) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchGoals(), fetchCategories()]);
        setLoading(false);
      };
      loadData();
    } else if (!isSessionLoading) {
      setLoading(false);
    }
  }, [session, isSessionLoading]);

  useEffect(() => {
    if (categories.length === 0) return;
    setNewGoal((prev) => ({ ...prev, category: prev.category || categories[0].name }));
    setNewHabit((prev) => ({ ...prev, category: prev.category || categories[0].name }));
  }, [categories]);

  const [currentDate, setCurrentDate] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const [navOrder, setNavOrder] = useState<
    { id: string; label: string; icon: any }[]
  >(() => {
    const defaultNav = [
      { id: "today", label: "Today", icon: "Sun" },
      { id: "dash", label: "Dashboard", icon: "LayoutDashboard" },
      { id: "planner", label: "Planner", icon: "CalendarDays" },
      { id: "habits", label: "Habits", icon: "Activity" },
      { id: "goals", label: "Goals", icon: "Target" },
      { id: "categories", label: "Categories", icon: "Filter" },
      { id: "calendar", label: "Calendar", icon: "Calendar" },
    ];
    const saved = localStorage.getItem("forge_nav_order");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = [...parsed];
        defaultNav.forEach((def) => {
          if (!merged.find((m: any) => m.id === def.id)) merged.push(def);
        });
        return merged;
      } catch (e) {
        return defaultNav;
      }
    }
    return defaultNav;
  });

  useEffect(() => {
    localStorage.setItem("forge_nav_order", JSON.stringify(navOrder));
  }, [navOrder]);

  const { toggleHabitOptimistic, toggleGoalCompletionOptimistic } = useAppInteractions({ setHabits, setGoals });

  const {
    todayMilestones,
    todayProgress,
    highestStreak,
    yesterdayCompletedCount,
    personalBest,
    yesterdayProgress,
    barPulse,
    showBreather,
    breatherMessage,
    floatingPoints,
    slidingOut,
    lastCompleted,
    breatherTimeout,
    setShowBreather,
    setSlidingOut,
    setBreatherTimeout,
    getHeroTheme,
    getBarColor,
    getHypeText,
    getStreakMessage,
    getTaskPoints,
    handleToggleToday,
    handleArenaComplete,
    todayCompletedCount,
    todayTotalCount,
  } = useToday({
    allCalendarItems,
    goals,
    getItemsForDate,
    toggleHabitOptimistic,
    toggleGoalCompletionOptimistic,
    toggleMilestone: (id, date) => toggleMilestone(id, date),
    setDismissedConquered,
  });

  const {
    stats,
    chartData,
    categoryData,
    trendData,
    productivityInsights,
    repeatabilityData,
  } = useDashboardData({
    goals,
    categories,
    allCalendarItems,
    activeGoalId,
  });

  const handleAddPlannerTask = async (title: string, date: Date, repeat: string) => {
    let targetGoalId = "";
    let generalGoal = goals.find((g) => g.title === "General Tasks");
    if (!generalGoal) {
      const newGoal: Goal = {
        id: uid(),
        title: "General Tasks",
        category: categories[0]?.name || "Personal",
        priority: "Medium",
        progress: 0,
        streak: 0,
        milestones: [],
        repeat: "None",
      };
      setGoals((prev) => [...prev, newGoal]);
      generalGoal = newGoal;

      storage.addGoal(newGoal).catch((err) => {
        console.error("Failed to add General Tasks goal", err);
        setGoals((prev) => prev.filter((g) => g.id !== newGoal.id));
      });
    }
    targetGoalId = generalGoal?.id || "";

    if (!targetGoalId) return;

    const milestoneData: Milestone = {
      title,
      due_date: format(date, "yyyy-MM-dd"),
      repeat: repeat as any,
      goal_id: targetGoalId,
      id: uid(),
      done: false,
      completed_dates: [],
    };

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === targetGoalId) {
          return {
            ...g,
            milestones: [...(g.milestones || []), milestoneData],
          };
        }
        return g;
      }),
    );

    storage
      .addMilestone(milestoneData)
      .then((updatedGoal) => {
        if (updatedGoal) {
          setGoals((prev) =>
            prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)),
          );
        }
      })
      .catch((error) => {
        console.error("Error adding planner task:", error);
        setGoals((prev) =>
          prev.map((g) => {
            if (g.id === targetGoalId) {
              return {
                ...g,
                milestones: (g.milestones || []).filter(
                  (m) => m.id !== milestoneData.id,
                ),
              };
            }
            return g;
          }),
        );
      });
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    let targetGoalId = activeGoalId || newMilestone.goal_id;

    if (isSaving || !newMilestone.title) return;

    setMilestoneSaving(true);
    try {
      if (!targetGoalId || targetGoalId === "none") {
        let generalGoal = goals.find((g) => g.title === "General Tasks");
        if (!generalGoal) {
          const newGoal: Goal = {
            id: uid(),
            title: "General Tasks",
            category: categories[0]?.name || "Personal",
            priority: "Medium",
            progress: 0,
            streak: 0,
            milestones: [],
            repeat: "None",
          };
          setGoals((prev) => [...prev, newGoal]);
          generalGoal = newGoal;

          try {
            await storage.addGoal(newGoal);
          } catch (error) {
            setGoals((prev) => prev.filter((g) => g.id !== newGoal.id));
            throw error;
          }
        }
        targetGoalId = generalGoal.id;
      }

      const milestoneData: Milestone = {
        ...newMilestone,
        goal_id: targetGoalId,
        id: uid(),
        done: false,
        completed_dates: [],
      };

      setGoals((prev) =>
        prev.map((g) => {
          if (g.id === targetGoalId) {
            return {
              ...g,
              milestones: [...(g.milestones || []), milestoneData],
            };
          }
          return g;
        }),
      );

      setIsAddingMilestone(false);
      setNewMilestone({
        title: "",
        due_date: "",
        note: "",
        goal_id: "",
        repeat: "None",
      });

      storage.addMilestone(milestoneData).then((updatedGoal) => {
        if (updatedGoal) {
          setGoals((prev) =>
            prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)),
          );
        }
      }).catch((error) => {
        console.error("Error in handleAddMilestone:", error);
        setGoals((prev) =>
          prev.map((g) => {
            if (g.id === targetGoalId) {
              return {
                ...g,
                milestones: (g.milestones || []).filter(
                  (m) => m.id !== milestoneData.id,
                ),
              };
            }
            return g;
          }),
        );
      });
    } catch (error) {
      console.error("Error in handleAddMilestone setup:", error);
    } finally {
      setMilestoneSaving(false);
    }
  };

  const toggleMilestone = async (id: string, date?: string) => {
    const targetDate = date ? parseISO(date) : new Date();
    setGoals((prev) =>
      prev.map((g) => {
        const milestone = g.milestones?.find((m) => m.id === id);
        if (!milestone) return g;

        const updatedMilestone = { ...milestone };

        if (updatedMilestone.repeat && updatedMilestone.repeat !== "None") {
          const isCompleted = isCompletedOnDate(updatedMilestone, targetDate);
          let completed_dates = updatedMilestone.completed_dates || [];

          if (isCompleted) {
            completed_dates = completed_dates.filter((d: string) => {
              const dDate = parseISO(d);
              if (updatedMilestone.repeat === "Daily") return !isSameDay(dDate, targetDate);
              if (updatedMilestone.repeat === "Weekly") return !isSameWeek(dDate, targetDate);
              if (updatedMilestone.repeat === "Monthly") return !isSameMonth(dDate, targetDate);
              return true;
            });
          } else {
            completed_dates = [...completed_dates, targetDate.toISOString()];
          }

          updatedMilestone.completed_dates = completed_dates;
        } else {
          updatedMilestone.done = !updatedMilestone.done;
          updatedMilestone.completed_at = updatedMilestone.done
            ? new Date().toISOString()
            : undefined;
        }

        return {
          ...g,
          milestones: g.milestones?.map((m) => (m.id === id ? updatedMilestone : m)),
        };
      }),
    );

    storage
      .toggleMilestone(id, date ? parseISO(date) : undefined)
      .then((updatedGoal) => {
        if (updatedGoal) {
          setGoals((prev) =>
            prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)),
          );
        }
      })
      .catch((err) => console.error("Failed to toggle milestone:", err));
  };
  useEffect(() => {
    setIsAddingGoal(false);
    setIsAddingHabit(false);
    setIsAddingCategory(false);
    setIsAddingMilestone(false);
    setEditingGoal(null);
    setEditingHabit(null);
    setEditingCategory(null);
    setIsFocusMode(false);
    setIsCustomizingLayout(false);
    setIsCustomizingNav(false);
    setIsMobileMenuOpen(false);
  }, [view]);

  useEffect(() => {
    const isAnyModalOpen =
      isAddingGoal ||
      isAddingHabit ||
      isAddingCategory ||
      isAddingMilestone ||
      !!editingGoal ||
      !!editingHabit ||
      !!editingCategory ||
      isFocusMode ||
      isCustomizingLayout ||
      isCustomizingNav ||
      isMobileMenuOpen;

    if (isAnyModalOpen) {
      window.history.pushState({ modal: true }, "");
    } else if (window.history.state?.modal) {
      window.history.back();
    }
  }, [
    isAddingGoal,
    isAddingHabit,
    isAddingCategory,
    isAddingMilestone,
    editingGoal,
    editingHabit,
    editingCategory,
    isFocusMode,
    isCustomizingLayout,
    isCustomizingNav,
    isMobileMenuOpen,
  ]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (!e.state?.modal) {
        setIsAddingGoal(false);
        setIsAddingHabit(false);
        setIsAddingCategory(false);
        setIsAddingMilestone(false);
        setEditingGoal(null);
        setEditingHabit(null);
        setEditingCategory(null);
        setIsFocusMode(false);
        setIsCustomizingLayout(false);
        setIsCustomizingNav(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  const handleMarkAllDone = async (ids: string[]) => {
    // Optimistic update
    setGoals(prev => prev.map(g => ({
      ...g,
      milestones: g.milestones?.map(m => ids.includes(m.id) ? { ...m, done: true } : m)
    })));

    storage.setMilestonesDone(ids, true).then(updatedGoals => {
      if (updatedGoals && updatedGoals.length > 0) {
        setGoals(prev => prev.map(g => {
          const updated = updatedGoals.find(ug => ug.id === g.id);
          return updated || g;
        }));
      }
    }).catch(err => console.error("Failed to mark all done:", err));
  };

  const deleteMilestone = async (id: string) => {
    // Optimistic update
    setGoals(prev => prev.map(g => ({
      ...g,
      milestones: g.milestones?.filter(m => m.id !== id)
    })));

    storage.deleteMilestone(id).then(updatedGoal => {
      if (updatedGoal) {
        setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
      } else {
        fetchGoals();
      }
    }).catch(err => console.error("Failed to delete milestone:", err));
  };

  const editMilestone = async (id: string, updates: Partial<Milestone>) => {
    // Optimistic update
    setGoals(prev => prev.map(g => {
      const milestone = g.milestones?.find(m => m.id === id);
      if (!milestone) return g;

      const updatedMilestone = { ...milestone, ...updates };
      const updatedGoal = {
        ...g,
        milestones: g.milestones?.map(m => m.id === id ? updatedMilestone : m)
      };
      return updatedGoal;
    }));

    storage.updateMilestone(id, updates).then(updatedGoal => {
      if (updatedGoal) {
        setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
      }
    }).catch(err => console.error("Failed to edit milestone:", err));
  };

  const activeGoal = useMemo(
    () => goals.find((g) => g.id === activeGoalId),
    [goals, activeGoalId],
  );
  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090b0f]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (supabase && !session) {
    return <Auth />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090b0f]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const sharedViewProps = {
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
    Card,
    Badge,
    DraggableMilestone: SharedDraggableMilestone,
    DroppableCalendarDay: SharedDroppableCalendarDay,
    CircularProgress: SharedCircularProgress,
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
    isFocusMode,
    setTodayGraphView,
    todayGraphView,
    setCompletedExpanded,
    completedExpanded,
    setShowMomentumMobile,
    showMomentumMobile,
    todayCompletedCount,
    todayTotalCount,
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
    Check,
  };

  return (
    <div className="flex min-h-screen bg-[#090b0f] font-sans selection:bg-orange-500/30">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen custom-scrollbar flex flex-col relative w-full bg-[#090b0f] pb-24 md:pb-0 md:pl-24">
        <ViewContainer view={view} sharedViewProps={sharedViewProps} />

        <Sidebar
          view={view}
          setView={setView}
          setActiveGoalId={setActiveGoalId}
        />
      </main>

            <AnimatePresence>
        <CustomizeDashboardModal
          isCustomizingLayout={isCustomizingLayout}
          setIsCustomizingLayout={setIsCustomizingLayout}
          dashboardLayout={dashboardLayout}
          setDashboardLayout={setDashboardLayout}
        />
      </AnimatePresence>

      <AnimatePresence>
        <GoalModal
          isAddingGoal={isAddingGoal}
          setIsAddingGoal={setIsAddingGoal}
          editingGoal={editingGoal}
          setEditingGoal={setEditingGoal}
          handleAddGoal={handleAddGoal}
          newGoal={newGoal}
          setNewGoal={setNewGoal}
          categories={categories}
          isSaving={isSaving}
        />
        <HabitModal
          isAddingHabit={isAddingHabit}
          setIsAddingHabit={setIsAddingHabit}
          editingHabit={editingHabit}
          setEditingHabit={setEditingHabit}
          handleAddHabit={handleAddHabit}
          newHabit={newHabit}
          setNewHabit={setNewHabit}
          categories={categories}
          isSaving={isSaving}
        />
        <MilestoneModal
          isAddingMilestone={isAddingMilestone}
          setIsAddingMilestone={setIsAddingMilestone}
          activeGoalId={activeGoalId}
          goals={goals}
          handleAddMilestone={handleAddMilestone}
          newMilestone={newMilestone}
          setNewMilestone={setNewMilestone}
          isSaving={isSaving}
        />
        <CategoryModal
          isAddingCategory={isAddingCategory}
          setIsAddingCategory={setIsAddingCategory}
          editingCategory={editingCategory}
          setEditingCategory={setEditingCategory}
          handleAddCategory={handleAddCategory}
          handleEditCategory={handleEditCategory}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
        />
      </AnimatePresence>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}



