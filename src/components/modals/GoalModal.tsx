import React from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { Category, Goal } from "../../storage";
import type { GoalFormState } from "../../hooks/useGoals";

interface GoalModalProps {
  isAddingGoal: boolean;
  setIsAddingGoal: (v: boolean) => void;
  editingGoal: Goal | null;
  setEditingGoal: (v: Goal | null) => void;
  handleAddGoal: (e: React.FormEvent) => Promise<void>;
  newGoal: GoalFormState;
  setNewGoal: React.Dispatch<React.SetStateAction<GoalFormState>>;
  categories: Category[];
  isSaving: boolean;
  saveError?: string | null;
}

const MODAL_PANEL_CLASS =
  "relative w-full max-w-[480px] max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-[16px] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(18,21,25,0.98),rgba(10,12,15,0.99))] shadow-[0_22px_64px_-44px_rgba(0,0,0,1)]";

const LABEL_CLASS =
  "mb-1 block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/38";

const FIELD_CLASS =
  "h-9 w-full rounded-[9px] border border-white/[0.08] bg-white/[0.035] px-2.5 text-[13px] font-medium text-white placeholder:text-white/24 outline-none transition-colors focus:border-orange-400/55 focus:bg-white/[0.055]";

const SELECT_CLASS = `${FIELD_CLASS} appearance-none pr-7`;

const PAIRED_GRID_CLASS = "grid grid-cols-2 gap-2 max-[380px]:grid-cols-1";

const CANCEL_BUTTON_CLASS =
  "flex-1 h-10 rounded-[9px] border border-white/[0.08] bg-white/[0.045] text-[12px] font-semibold text-white/48 transition-colors hover:bg-white/[0.07] hover:text-white/72";

const PRIMARY_BUTTON_CLASS =
  "flex-1 h-10 rounded-[9px] bg-[linear-gradient(180deg,#ff8a1f,#f97316)] text-[12px] font-bold text-[#231006] shadow-[0_12px_28px_-22px_rgba(249,115,22,0.95)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55";

export const GoalModal: React.FC<GoalModalProps> = ({
  isAddingGoal,
  setIsAddingGoal,
  editingGoal,
  setEditingGoal,
  handleAddGoal,
  newGoal,
  setNewGoal,
  categories,
  isSaving,
  saveError,
}) => {
  if (!isAddingGoal && !editingGoal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsAddingGoal(false)}
        className="absolute inset-0 bg-black/78 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={MODAL_PANEL_CLASS}
      >
        <div className="p-4 md:p-5">
          <h3 className="mb-3 text-[22px] md:text-[24px] font-extrabold tracking-tight text-white">
            {editingGoal ? "Edit Goal" : "New Goal"}
          </h3>
          <form onSubmit={handleAddGoal} className="space-y-2.5">
            <div>
              <label className={LABEL_CLASS}>
                Goal Title
              </label>
              <input
                autoFocus
                required
                type="text"
                placeholder="What do you want to achieve?"
                className={FIELD_CLASS}
                value={newGoal.title || ""}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              />
            </div>
            <div className={PAIRED_GRID_CLASS}>
              <div className="min-w-0">
                <label className={LABEL_CLASS}>
                  Category
                </label>
                <div className="relative">
                  <select
                    className={SELECT_CLASS}
                    value={newGoal.category || ""}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name} className="bg-[#121519] text-white">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/34 pointer-events-none" />
                </div>
              </div>
              <div className="min-w-0">
                <label className={LABEL_CLASS}>
                  Priority
                </label>
                <div className="relative">
                  <select
                    className={SELECT_CLASS}
                    value={newGoal.priority || "Medium"}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as any })}
                  >
                    <option value="High" className="bg-[#121519] text-white">High</option>
                    <option value="Medium" className="bg-[#121519] text-white">Medium</option>
                    <option value="Low" className="bg-[#121519] text-white">Low</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/34 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className={PAIRED_GRID_CLASS}>
              <div className="min-w-0">
                <label className={LABEL_CLASS}>
                  Deadline
                </label>
                <input
                  type="date"
                  className={`${FIELD_CLASS} cursor-pointer`}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                  value={newGoal.deadline || ""}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>
              <div className="min-w-0">
                <label className={LABEL_CLASS}>
                  Repeat
                </label>
                <div className="relative">
                  <select
                    className={SELECT_CLASS}
                    value={newGoal.repeat || "None"}
                    onChange={(e) => setNewGoal({ ...newGoal, repeat: e.target.value as any })}
                  >
                    <option value="None" className="bg-[#121519] text-white">No Repeat</option>
                    <option value="Daily" className="bg-[#121519] text-white">Daily</option>
                    <option value="Weekly" className="bg-[#121519] text-white">Weekly</option>
                    <option value="Monthly" className="bg-[#121519] text-white">Monthly</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/34 pointer-events-none" />
                </div>
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS}>
                Note (Optional)
              </label>
              <textarea
                placeholder="Add some context or motivation..."
                className={`${FIELD_CLASS} h-14 resize-none py-2`}
                value={newGoal.note || ""}
                onChange={(e) => setNewGoal({ ...newGoal, note: e.target.value })}
              />
            </div>
            {saveError && (
              <div className="rounded-[9px] border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-[12px] font-medium text-rose-300">
                {saveError}
              </div>
            )}
            <div className="flex gap-2 pt-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsAddingGoal(false);
                  setEditingGoal(null);
                  setNewGoal({
                    title: "",
                    category: categories[0]?.name || "Health",
                    priority: "Medium",
                    deadline: "",
                    note: "",
                    repeat: "None",
                  });
                }}
                className={CANCEL_BUTTON_CLASS}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={PRIMARY_BUTTON_CLASS}
              >
                {isSaving ? "Saving..." : editingGoal ? "Save Changes" : "Create Goal"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
