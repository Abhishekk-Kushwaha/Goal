import React from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Habit } from "../../storage";
import type { Category } from "../../hooks/useCategories";

interface HabitModalProps {
  isAddingHabit: boolean;
  setIsAddingHabit: (v: boolean) => void;
  editingHabit: Habit | null;
  setEditingHabit: (v: Habit | null) => void;
  handleAddHabit: (e: React.FormEvent) => Promise<void>;
  newHabit: Partial<Habit>;
  setNewHabit: (v: Partial<Habit>) => void;
  categories: Category[];
  isSaving: boolean;
}

export const HabitModal: React.FC<HabitModalProps> = ({
  isAddingHabit,
  setIsAddingHabit,
  editingHabit,
  setEditingHabit,
  handleAddHabit,
  newHabit,
  setNewHabit,
  categories,
  isSaving,
}) => {
  if (!isAddingHabit && !editingHabit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          setIsAddingHabit(false);
          setEditingHabit(null);
          setNewHabit({
            title: "",
            category: categories[0]?.name || "Health",
            repeat: "Daily",
            due_date: "",
          });
        }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg dark:bg-[#2A2A28] bg-white border dark:border-white/10 border-stone-300 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 md:p-8">
          <h3 className="text-2xl font-extrabold dark:text-white text-stone-900 tracking-tight mb-8">
            {editingHabit ? "Edit Habit" : "New Habit"}
          </h3>
          <form onSubmit={handleAddHabit} className="space-y-6">
            <div>
              <label className="block text-[9px] font-semibold tracking-widest uppercase tracking-widest dark:text-stone-500 text-stone-600 mb-2">
                Habit Title
              </label>
              <input
                autoFocus
                required
                type="text"
                placeholder="What habit do you want to build?"
                className="w-full dark:bg-white/5 bg-stone-100 border dark:border-white/10 border-stone-300 rounded-xl px-4 py-3 dark:text-white text-stone-900 placeholder:text-stone-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                value={newHabit.title || ""}
                onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-semibold tracking-widest uppercase tracking-widest dark:text-stone-500 text-stone-600 mb-2">
                  Category
                </label>
                <div className="relative">
                  <select
                    className="w-full dark:bg-white/5 bg-stone-100 border dark:border-white/10 border-stone-300 rounded-xl px-4 py-3 dark:text-white text-stone-900 focus:outline-none focus:border-orange-500/50 transition-colors appearance-none pr-10"
                    value={newHabit.category || ""}
                    onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name} className="dark:bg-[#2A2A28] bg-white">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-stone-500 text-stone-600 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-semibold tracking-widest uppercase tracking-widest dark:text-stone-500 text-stone-600 mb-2">
                  Repeat
                </label>
                <div className="relative">
                  <select
                    className="w-full dark:bg-white/5 bg-stone-100 border dark:border-white/10 border-stone-300 rounded-xl px-4 py-3 dark:text-white text-stone-900 focus:outline-none focus:border-orange-500/50 transition-colors appearance-none pr-10"
                    value={newHabit.repeat || "Daily"}
                    onChange={(e) => setNewHabit({ ...newHabit, repeat: e.target.value as any })}
                  >
                    <option value="Daily" className="dark:bg-[#2A2A28] bg-white">Daily</option>
                    <option value="Weekly" className="dark:bg-[#2A2A28] bg-white">Weekly</option>
                    <option value="Monthly" className="dark:bg-[#2A2A28] bg-white">Monthly</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-stone-500 text-stone-600 pointer-events-none" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-semibold tracking-widest uppercase tracking-widest dark:text-stone-500 text-stone-600 mb-2">
                Target End Date (Optional)
              </label>
              <input
                type="date"
                className="w-full dark:bg-white/5 bg-stone-100 border dark:border-white/10 border-stone-300 rounded-xl px-4 py-3 dark:text-white text-stone-900 focus:outline-none focus:border-orange-500/50 transition-colors cursor-pointer"
                onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                value={newHabit.due_date || ""}
                onChange={(e) => setNewHabit({ ...newHabit, due_date: e.target.value })}
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsAddingHabit(false);
                  setEditingHabit(null);
                  setNewHabit({
                    title: "",
                    category: categories[0]?.name || "Health",
                    repeat: "Daily",
                    due_date: "",
                  });
                }}
                className="flex-1 py-3 rounded-xl dark:bg-white/5 bg-stone-100 dark:text-stone-400 dark:text-stone-500 text-stone-600 font-bold text-sm hover:dark:bg-white/10 bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={cn(
                  "flex-1 py-3 rounded-xl bg-orange-500 text-[#431407] btn-extruded font-bold text-sm transition-all shadow-lg shadow-orange-500/20",
                  isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-orange-400"
                )}
              >
                {isSaving ? "Saving..." : editingHabit ? "Save Changes" : "Create Habit"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
