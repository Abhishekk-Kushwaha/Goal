import React, { useEffect, useMemo, useState } from "react";
import { storage, type Category, type Habit } from "../storage";

const uid = () => crypto.randomUUID();

type UseHabitsOptions = {
  categories: Category[];
  confirmAction: (options: {
    title: string;
    message: string;
    confirmLabel?: string;
  }) => Promise<boolean>;
};

const getDefaultHabitForm = (categories: Category[]): Partial<Habit> => ({
  title: "",
  category: categories[0]?.name || "Health",
  repeat: "Daily",
  due_date: "",
  color: "",
});

export function useHabits({ categories, confirmAction }: UseHabitsOptions) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newHabit, setNewHabit] = useState<Partial<Habit>>(() =>
    getDefaultHabitForm(categories),
  );

  const defaultHabitForm = useMemo(
    () => getDefaultHabitForm(categories),
    [categories],
  );

  useEffect(() => {
    if (categories.length === 0) return;
    setNewHabit((prev) =>
      prev.category ? prev : { ...prev, category: categories[0].name },
    );
  }, [categories]);

  const resetHabitForm = () => {
    setNewHabit(defaultHabitForm);
  };

  const fetchHabits = async () => {
    const habitsData = await storage.getHabits();
    setHabits(habitsData);
    return habitsData;
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !newHabit.title) return;

    const tempId = uid() as string;
    const optimisticHabit = {
      id: tempId,
      title: newHabit.title as string,
      description: newHabit.description || undefined,
      category: newHabit.category as string,
      repeat: newHabit.repeat as any,
      due_date: newHabit.due_date,
      color: newHabit.color || undefined,
      created_at: new Date().toISOString(),
      completed_dates: [],
      streak: 0,
    };

    if (!editingHabit) {
      setHabits((prev) => [...prev, optimisticHabit]);
    }

    setIsAddingHabit(false);
    resetHabitForm();

    setIsSaving(true);
    try {
      if (editingHabit) {
        await storage.updateHabit(editingHabit.id, newHabit);
        setEditingHabit(null);
        await fetchHabits();
      } else {
        await storage.addHabit(optimisticHabit);
        await fetchHabits();
      }
    } catch (error) {
      console.error("Error in handleAddHabit:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    const shouldDelete = await confirmAction({
      title: "Delete Habit?",
      message: "This will permanently remove the habit and its completion history.",
      confirmLabel: "Delete",
    });
    if (!shouldDelete) return;

    setHabits((prev) => prev.filter((h) => h.id !== id));

    storage
      .deleteHabit(id)
      .then(() => {
        fetchHabits();
      })
      .catch((err) => console.error("Failed to delete habit:", err));
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setNewHabit(habit);
    setIsAddingHabit(true);
  };

  const cancelHabitForm = () => {
    setIsAddingHabit(false);
    setEditingHabit(null);
    resetHabitForm();
  };

  return {
    habits,
    setHabits,
    fetchGoals: fetchHabits,
    fetchHabits,
    handleAddHabit,
    handleDeleteHabit,
    handleEditHabit,
    editingHabit,
    setEditingHabit,
    isAddingHabit,
    setIsAddingHabit,
    isSaving,
    setIsSaving,
    newHabit,
    setNewHabit,
    resetHabitForm,
    cancelHabitForm,
    defaultHabitForm,
  };
}
