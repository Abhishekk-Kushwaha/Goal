import React, { useMemo, useState } from "react";
import {
  DndContext,
  defaultDropAnimationSideEffects,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  format,
  parseISO,
  isSameDay,
} from "date-fns";
import { storage, isCompletedOnDate, isDueOnDate, type Category, type Goal, type Habit } from "../storage";

export function useCalendarData({
  goals,
  habits,
  categories,
  setGoals,
}: {
  goals: Goal[];
  habits: Habit[];
  categories: Category[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeCalendarDragId, setActiveCalendarDragId] = useState<string | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );

  const allCalendarItems = useMemo(() => {
    const items: any[] = [];
    goals.forEach((g) => {
      const cat = categories.find((c) => c.name === g.category) || {
        color: "#64748b",
      };

      if (g.repeat && g.repeat !== "None") {
        items.push({
          ...g,
          goalTitle: g.title,
          categoryColor: cat.color,
          goalId: g.id,
          isGoalAsMilestone: true,
        });
      } else {
        (g.milestones || []).forEach((m) => {
          items.push({
            ...m,
            goalTitle: g.title,
            categoryColor: cat.color,
            goalId: g.id,
            isGoalAsMilestone: false,
          });
        });
      }
    });

    habits.forEach((h) => {
      const cat = categories.find((c) => c.name === h.category) || {
        color: "#64748b",
      };
      items.push({
        ...h,
        goalTitle: "Habit",
        categoryColor: h.color || cat.color,
        isHabit: true,
      });
    });

    return items;
  }, [goals, habits, categories]);

  const getItemsForDate = (date: Date) => {
    return allCalendarItems
      .filter((item) => isDueOnDate(item, date))
      .map((item) => ({
        ...item,
        done: isCompletedOnDate(item, date),
      }));
  };

  const milestonesForSelectedDate = useMemo(() => {
    return getItemsForDate(selectedDate);
  }, [allCalendarItems, selectedDate]);

  const unassignedMilestones = useMemo(() => {
    return goals.flatMap((g) =>
      (g.milestones || [])
        .filter((m) => !m.due_date && !m.done)
        .map((m) => ({ ...m, goalTitle: g.title })),
    );
  }, [goals]);

  const activeCalendarMilestone = useMemo(() => {
    if (!activeCalendarDragId) return null;
    return unassignedMilestones.find((m) => m.id === activeCalendarDragId);
  }, [activeCalendarDragId, unassignedMilestones]);

  const handleCalendarDragStart = (event: any) => {
    setActiveCalendarDragId(event.active.id);
  };

  const handleCalendarDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveCalendarDragId(null);

    if (over && active.id) {
      const milestoneId = active.id as string;
      const targetDate = over.id as string;

      setGoals((prev) =>
        prev.map((g) => ({
          ...g,
          milestones: g.milestones?.map((m) =>
            m.id === milestoneId ? { ...m, due_date: targetDate } : m,
          ),
        })),
      );

      storage
        .updateMilestone(milestoneId, { due_date: targetDate })
        .then((updatedGoal) => {
          if (updatedGoal) {
            setGoals((prev) =>
              prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)),
            );
          }
        })
        .catch((err) => {
          console.error("Failed to update milestone:", err);
        });
    }
  };

  return {
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
  };
}
