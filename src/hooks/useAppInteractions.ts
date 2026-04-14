import { parseISO, isSameDay, isSameWeek, isSameMonth } from "date-fns";
import { storage, isCompletedOnDate, type Goal, type Habit } from "../storage";

interface UseAppInteractionsProps {
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
}

export function useAppInteractions({ setHabits, setGoals }: UseAppInteractionsProps) {
  const toggleHabitOptimistic = async (id: string, date?: string) => {
    const targetDate = date ? parseISO(date) : new Date();
    
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const isCompleted = isCompletedOnDate(h, targetDate);
          let completed_dates = h.completed_dates || [];
          if (isCompleted) {
            completed_dates = completed_dates.filter((d: string) => {
              const dDate = parseISO(d);
              if (h.repeat === "Daily") return !isSameDay(dDate, targetDate);
              if (h.repeat === "Weekly") return !isSameWeek(dDate, targetDate);
              if (h.repeat === "Monthly") return !isSameMonth(dDate, targetDate);
              return true;
            });
          } else {
            completed_dates = [...completed_dates, targetDate.toISOString()];
          }
          return { ...h, completed_dates };
        }
        return h;
      }),
    );

    storage
      .toggleHabit(id, targetDate)
      .then((updatedHabit) => {
        if (updatedHabit) {
          setHabits((prev) =>
            prev.map((h) => (h.id === updatedHabit.id ? updatedHabit : h)),
          );
        }
      })
      .catch((err) => console.error("Failed to toggle habit:", err));
  };

  const toggleGoalCompletionOptimistic = async (id: string, date?: string) => {
    const targetDate = date ? parseISO(date) : new Date();
    
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const isCompleted = isCompletedOnDate(g, targetDate);
          let completed_dates = g.completed_dates || [];
          if (isCompleted) {
            completed_dates = completed_dates.filter((d: string) => {
              const dDate = parseISO(d);
              if (g.repeat === "Daily") return !isSameDay(dDate, targetDate);
              if (g.repeat === "Weekly") return !isSameWeek(dDate, targetDate);
              if (g.repeat === "Monthly") return !isSameMonth(dDate, targetDate);
              return true;
            });
          } else {
            completed_dates = [...completed_dates, targetDate.toISOString()];
          }
          const updatedGoal = { ...g, completed_dates };
          storage.updateGoalProgress(updatedGoal);
          return updatedGoal;
        }
        return g;
      }),
    );

    storage
      .toggleGoalCompletion(id, targetDate)
      .then((updatedGoal) => {
        if (updatedGoal) {
          setGoals((prev) =>
            prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)),
          );
        }
      })
      .catch((err) => console.error("Failed to toggle goal completion:", err));
  };

  return { toggleHabitOptimistic, toggleGoalCompletionOptimistic };
}
