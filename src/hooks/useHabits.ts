import React, { useEffect, useMemo, useState } from "react";
import { storage, type Category, type Habit } from "../storage";

const uid = () => crypto.randomUUID();

type UseHabitsOptions = {
  categories: Category[];
};

const getDefaultHabitForm = (categories: Category[]): Partial<Habit> => ({
  title: "",
  category: categories[0]?.name || "Health",
  repeat: "Daily",
  due_date: "",
});

export function useHabits({ categories }: UseHabitsOptions) {
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
      category: newHabit.category as string,
      repeat: newHabit.repeat as any,
      due_date: newHabit.due_date,
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
    if (!confirm("Are you sure you want to delete this habit?")) return;

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
