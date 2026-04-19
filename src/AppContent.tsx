import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { InitialDataSkeleton } from "./components/InitialDataSkeleton";
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
import { ConfirmDialog } from "./components/modals/ConfirmDialog";

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
  | "progress";

interface WidgetConfig {
  id: WidgetId;
  visible: boolean;
  label: string;
}

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type ConfirmDialogState = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  resolve: ((value: boolean) => void) | null;
};

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
    ];
    const allowedWidgetIds = new Set(defaultLayout.map((widget) => widget.id));

    const saved = localStorage.getItem("forge_dashboard_layout");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as WidgetConfig[];
        const merged = parsed.filter((widget) => allowedWidgetIds.has(widget.id));
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
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: "",
    message: "",
    confirmLabel: "Delete",
    resolve: null,
  });

  const requestConfirm = useCallback(
    ({
      title,
      message,
      confirmLabel = "Delete",
    }: {
      title: string;
      message: string;
      confirmLabel?: string;
    }) =>
      new Promise<boolean>((resolve) => {
        setConfirmDialog({
          open: true,
          title,
          message,
          confirmLabel,
          resolve,
        });
      }),
    [],
  );

  const closeConfirmDialog = useCallback((confirmed: boolean) => {
    setConfirmDialog((current) => {
      current.resolve?.(confirmed);
      return {
        open: false,
        title: "",
        message: "",
        confirmLabel: "Delete",
        resolve: null,
      };
    });
  }, []);

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
    confirmAction: requestConfirm,
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
  } = useGoals({ categories, setView, confirmAction: requestConfirm });

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
  } = useHabits({ categories, confirmAction: requestConfirm });

  const [isFocusMode, setIsFocusMode] = useState(false);
  const [featuredGoalId, setFeaturedGoalId] = useState<string | null>(() => {
    return localStorage.getItem("forge_featured_goal_id");
  });
  const [installPromptEvent, setInstallPromptEvent] =
    useState<InstallPromptEvent | null>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [installPlatform, setInstallPlatform] = useState<
    "prompt" | "ios" | "manual" | "installed"
  >("manual");
  const [initialDataLoadedForUserId, setInitialDataLoadedForUserId] =
    useState<string | null>(null);
  const sessionUserId = session?.user?.id || null;
  const isInitialDataLoading = Boolean(
    sessionUserId && initialDataLoadedForUserId !== sessionUserId,
  );

  useEffect(() => {
    if (featuredGoalId) {
      localStorage.setItem("forge_featured_goal_id", featuredGoalId);
    } else {
      localStorage.removeItem("forge_featured_goal_id");
    }
  }, [featuredGoalId]);

  useEffect(() => {
    if (goals.length === 0) {
      setFeaturedGoalId(null);
      return;
    }

    if (featuredGoalId && goals.some((goal) => goal.id === featuredGoalId)) {
      return;
    }

    setFeaturedGoalId(goals[0].id);
  }, [featuredGoalId, goals]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setInstallPlatform("installed");
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isSafari =
      /safari/.test(userAgent) &&
      !/crios|fxios|edgios|chrome|android/.test(userAgent);

    setInstallPlatform(isIOS && isSafari ? "ios" : "manual");

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as InstallPromptEvent);
      setInstallPlatform("prompt");
    };

    const handleAppInstalled = () => {
      setInstallPromptEvent(null);
      setInstallPlatform("installed");
      setShowInstallHelp(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const requestInstallApp = async () => {
    if (installPlatform === "installed") return;

    if (installPromptEvent) {
      await installPromptEvent.prompt();
      try {
        await installPromptEvent.userChoice;
      } finally {
        setInstallPromptEvent(null);
      }
      return;
    }

    setShowInstallHelp(true);
  };

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
    let isCancelled = false;
    const userId = sessionUserId;

    if (session && userId) {
      const loadData = async () => {
        await Promise.all([fetchGoals(), fetchCategories()]);
      };

      void loadData()
        .catch((error) => {
          if (!isCancelled) {
            console.error("Initial app data failed to load:", error);
          }
        })
        .finally(() => {
          if (!isCancelled) {
            setInitialDataLoadedForUserId(userId);
          }
        });
    } else {
      setInitialDataLoadedForUserId(null);
    }

    return () => {
      isCancelled = true;
    };
  }, [sessionUserId]);

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
      { id: "dash", label: "Profile", icon: "LayoutDashboard" },
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

  const {
    setHabitCompletedOptimistic,
    setGoalCompletionOptimistic,
    toggleHabitOptimistic,
    toggleGoalCompletionOptimistic,
  } = useAppInteractions({ setHabits, setGoals });
  const milestoneRequestVersionsRef = useRef(new Map<string, number>());

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
    pendingTodayTaskKeys,
    getTodayTaskKey,
  } = useToday({
    allCalendarItems,
    goals,
    getItemsForDate,
    setHabitCompleted: setHabitCompletedOptimistic,
    setGoalCompleted: setGoalCompletionOptimistic,
    setMilestoneCompleted: (id, date, done) =>
      setMilestoneCompletedOptimistic(id, date, done),
    setDismissedConquered,
  });

  const {
    stats,
    chartData,
  } = useDashboardData({
    goals,
    categories,
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

  const getMilestoneRequestKey = (id: string, targetDate: Date) =>
    `milestone:${id}:${targetDate.toISOString().slice(0, 10)}`;

  const nextMilestoneRequestVersion = (key: string) => {
    const version = (milestoneRequestVersionsRef.current.get(key) || 0) + 1;
    milestoneRequestVersionsRef.current.set(key, version);
    return version;
  };

  const isLatestMilestoneRequest = (key: string, version: number) => {
    return milestoneRequestVersionsRef.current.get(key) === version;
  };

  const getCompletedDatesForState = (
    completedDates: string[] | undefined,
    repeat: string | undefined,
    targetDate: Date,
    done: boolean,
  ) => {
    const currentDates = completedDates || [];
    const isCompleted = isCompletedOnDate(
      { repeat, completed_dates: currentDates },
      targetDate,
    );

    if (done && !isCompleted) {
      return [...currentDates, targetDate.toISOString()];
    }

    if (!done && isCompleted) {
      return currentDates.filter((d: string) => {
        const dDate = parseISO(d);
        if (repeat === "Daily") return !isSameDay(dDate, targetDate);
        if (repeat === "Weekly") return !isSameWeek(dDate, targetDate);
        if (repeat === "Monthly") return !isSameMonth(dDate, targetDate);
        return true;
      });
    }

    return currentDates;
  };

  const setMilestoneCompletedOptimistic = async (
    id: string,
    date: string | undefined,
    done: boolean,
  ) => {
    const targetDate = date ? parseISO(date) : new Date();
    const requestKey = getMilestoneRequestKey(id, targetDate);
    const version = nextMilestoneRequestVersion(requestKey);
    let previousGoals: Goal[] | null = null;

    setGoals((prev) => {
      previousGoals = prev;
      return prev.map((g) => {
        const milestone = g.milestones?.find((m) => m.id === id);
        if (!milestone) return g;

        const updatedMilestone = { ...milestone };

        if (updatedMilestone.repeat && updatedMilestone.repeat !== "None") {
          updatedMilestone.completed_dates = getCompletedDatesForState(
            updatedMilestone.completed_dates,
            updatedMilestone.repeat,
            targetDate,
            done,
          );
        } else {
          updatedMilestone.done = done;
          updatedMilestone.completed_at = done
            ? new Date().toISOString()
            : undefined;
        }

        const updatedGoal = {
          ...g,
          milestones: g.milestones?.map((m) => (m.id === id ? updatedMilestone : m)),
        };
        storage.updateGoalProgress(updatedGoal);
        return updatedGoal;
      });
    });

    try {
      const updatedGoal = await storage.setMilestoneCompleted(
        id,
        targetDate,
        done,
      );
      if (updatedGoal && isLatestMilestoneRequest(requestKey, version)) {
        setGoals((prev) =>
          prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)),
        );
      }
    } catch (err) {
      console.error("Failed to set milestone completion:", err);
      if (isLatestMilestoneRequest(requestKey, version) && previousGoals) {
        setGoals(previousGoals);
      }
    }
  };

  const toggleMilestone = async (id: string, date?: string) => {
    const targetDate = date ? parseISO(date) : new Date();
    let desiredDone = true;

    setGoals((prev) => {
      const targetGoal = prev.find((goal) =>
        goal.milestones?.some((milestone) => milestone.id === id),
      );
      const milestone = targetGoal?.milestones?.find((item) => item.id === id);
      desiredDone = milestone
        ? milestone.repeat && milestone.repeat !== "None"
          ? !isCompletedOnDate(milestone, targetDate)
          : !milestone.done
        : true;
      return prev;
    });

    await setMilestoneCompletedOptimistic(
      id,
      targetDate.toISOString(),
      desiredDone,
    );
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
      isMobileMenuOpen ||
      confirmDialog.open;

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
    confirmDialog.open,
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
        closeConfirmDialog(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [closeConfirmDialog]);
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
    return <InitialDataSkeleton view={view} />;
  }

  if (supabase && !session) {
    return <Auth />;
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
    pendingTodayTaskKeys,
    getTodayTaskKey,
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
    setHabitCompletedOptimistic,
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
    isInitialDataLoading,
    theme,
    currentDate,
    dashboardLayout,
    stats,
    chartData,
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
    isAppInstalled: installPlatform === "installed",
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
    Check,
  };

  return (
    <div className="flex min-h-screen bg-[#090b0f] font-sans selection:bg-orange-500/30">
      <Sidebar
        view={view}
        setView={setView}
        setActiveGoalId={setActiveGoalId}
        isMenuOpen={isMobileMenuOpen}
        setIsMenuOpen={setIsMobileMenuOpen}
        stats={stats}
        supabase={supabase}
        session={session}
      />

      {/* Main Content */}
      <main className="min-w-0 flex-1 overflow-y-auto h-screen custom-scrollbar flex flex-col relative w-full bg-[#090b0f] pb-24 md:pb-0 transition-[width,flex-basis] duration-300">
        <ViewContainer view={view} sharedViewProps={sharedViewProps} />
      </main>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        onCancel={() => closeConfirmDialog(false)}
        onConfirm={() => closeConfirmDialog(true)}
      />

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
    </div>
  );
}
