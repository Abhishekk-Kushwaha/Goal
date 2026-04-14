import React, { useEffect, useMemo, useState } from "react";
import { storage, type Category, type Goal } from "../storage";

const uid = () => crypto.randomUUID();

export type GoalFormState = {
  title: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  deadline: string;
  note: string;
  repeat: "None" | "Daily" | "Weekly" | "Monthly";
};

type UseGoalsOptions = {
  categories: Category[];
  setView: (view: string) => void;
};

const getDefaultGoalForm = (categories: Category[]): GoalFormState => ({
  title: "",
  category: categories[0]?.name || "Health",
  priority: "Medium",
  deadline: "",
  note: "",
  repeat: "None",
});

export function useGoals({ categories, setView }: UseGoalsOptions) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newGoal, setNewGoal] = useState<GoalFormState>(() =>
    getDefaultGoalForm(categories),
  );

  const defaultGoalForm = useMemo(
    () => getDefaultGoalForm(categories),
    [categories],
  );

  useEffect(() => {
    if (categories.length === 0) return;
    setNewGoal((prev) =>
      prev.category ? prev : { ...prev, category: categories[0].name },
    );
  }, [categories]);

  const resetGoalForm = () => {
    setNewGoal(defaultGoalForm);
  };

  const fetchGoals = async () => {
    const goalsData = await storage.getGoals();
    setGoals(goalsData);
    return goalsData;
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    console.log("Adding goal:", newGoal);
    if (!newGoal.title) {
      console.warn("Goal title is missing");
      return;
    }

    const tempId = uid();
    const optimisticGoal = {
      ...newGoal,
      id: tempId,
      progress: 0,
      streak: 0,
      milestones: [],
      last_reset_at: new Date().toISOString(),
    };

    if (!editingGoal) {
      setGoals((prev) => [...prev, optimisticGoal as any]);
    }

    setIsAddingGoal(false);
    resetGoalForm();

    setIsSaving(true);
    try {
      if (editingGoal) {
        console.log("Updating goal:", editingGoal.id);
        await storage.updateGoal(editingGoal.id, newGoal);
        setEditingGoal(null);
        await fetchGoals();
      } else {
        console.log("Creating new goal with ID:", tempId);
        await storage.addGoal(optimisticGoal as any);
        await fetchGoals();
      }
    } catch (error) {
      console.error("Error in handleAddGoal:", error);
      alert("An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    setGoals((prev) => prev.filter((g) => g.id !== id));

    if (activeGoalId === id) {
      setView("goals");
      setActiveGoalId(null);
    }

    storage
      .deleteGoal(id)
      .then(() => {
        fetchGoals();
      })
      .catch((err) => console.error("Failed to delete goal:", err));
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      category: goal.category,
      priority: goal.priority,
      deadline: goal.deadline || "",
      note: goal.note || "",
      repeat: goal.repeat || "None",
    });
    setIsAddingGoal(true);
  };

  const cancelGoalForm = () => {
    setIsAddingGoal(false);
    setEditingGoal(null);
    resetGoalForm();
  };

  return {
    goals,
    setGoals,
    fetchGoals,
    handleAddGoal,
    handleDeleteGoal,
    handleEditGoal,
    activeGoalId,
    setActiveGoalId,
    editingGoal,
    setEditingGoal,
    isAddingGoal,
    setIsAddingGoal,
    isSaving,
    setIsSaving,
    newGoal,
    setNewGoal,
    resetGoalForm,
    cancelGoalForm,
    defaultGoalForm,
  };
}
