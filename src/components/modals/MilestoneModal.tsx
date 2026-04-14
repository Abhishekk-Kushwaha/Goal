import React from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Goal } from "../../storage";

interface MilestoneModalProps {
  isAddingMilestone: boolean;
  setIsAddingMilestone: (v: boolean) => void;
  handleAddMilestone: (e: React.FormEvent) => Promise<void>;
  newMilestone: {
    title: string;
    due_date: string;
    note: string;
    goal_id: string;
    repeat: "None" | "Daily" | "Weekly" | "Monthly";
  };
  setNewMilestone: (v: any) => void;
  activeGoalId: string | null;
  goals: Goal[];
  isSaving: boolean;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isAddingMilestone,
  setIsAddingMilestone,
  handleAddMilestone,
  newMilestone,
  setNewMilestone,
  activeGoalId,
  goals,
  isSaving,
}) => {
  if (!isAddingMilestone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsAddingMilestone(false)}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md dark:bg-[#2A2A28] bg-white border dark:border-white/10 border-stone-300 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 md:p-8">
          <h3 className="text-xl font-extrabold dark:text-white text-stone-900 tracking-tight mb-6">
            Add Milestone
          </h3>
          <form onSubmit={handleAddMilestone} className="space-y-5">
            {!activeGoalId && (
              <div>
                <label className="block text-[9px] font-semibold tracking-widest uppercase tracking-widest dark:text-stone-500 text-stone-600 mb-2">
                  Select Goal
                </label>
                <div className="relative">
                  <select
                    className="w-full dark:bg-white/5 bg-stone-100 border dark:border-white/10 border-stone-300 rounded-xl px-4 py-3 dark:text-white text-stone-900 focus:outline-none focus:border-orange-500/50 transition-colors appearance-none cursor-pointer pr-10"
                    value={newMilestone.goal_id || ""}
                    onChange={(e) => setNewMilestone({ ...newMilestone, goal_id: e.target.value })}
                  >
                    <option value="" disabled className="dark:bg-[#2A2A28] bg-white">
                      Choose a goal...
                    </option>
                    <option value="none" className="dark:bg-[#2A2A28] bg-white font-semibold text-orange-500">
                      None (General Task)
                    </option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id} className="dark:bg-[#2A2A28] bg-white">
                        {g.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-stone-500 text-stone-600 pointer-events-none" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-[9px] font-semibold tracking-widest uppercase tracking-widest dark:text-stone-500 text-stone-600 mb-2">
                Milestone Title
              </label>
              <input
                autoFocus
                required
                type="text"
                placeholder="e.g. Complete first draft"
                className="w-full dark:bg-white/5 bg-stone-100 border dark:border-white/10 border-stone-300 rounded-xl px-4 py-3 dark:text-white text-stone-900 placeholder:text-stone-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                value={newMilestone.title || ""}
                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-semibold tracking-widest uppercase tracking-widest dark:text-stone-500 text-stone-600 mb-2">
                  Due Date{" "}
                  {newMilestone.repeat !== "None" ? "(Required for Recurring)" : "(Optional)"}
                </label>
                <input
                  type="date"
                  required={newMilestone.repeat !== "None"}
                  className="w-full dark:bg-white/5 bg-stone-100 border dark:border-white/10 border-stone-300 rounded-xl px-4 py-3 dark:text-white text-stone-900 focus:outline-none focus:border-orange-500/50 transition-colors cursor-pointer"
                  onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                  value={newMilestone.due_date || ""}
                  onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[9px] font-semibold tracking-widest uppercase tracking-widest dark:text-stone-500 text-stone-600 mb-2">
                  Repeat
                </label>
                <div className="relative">
                  <select
                    className="w-full dark:bg-white/5 bg-stone-100 border dark:border-white/10 border-stone-300 rounded-xl px-4 py-3 dark:text-white text-stone-900 focus:outline-none focus:border-orange-500/50 transition-colors appearance-none pr-10"
                    value={newMilestone.repeat || "None"}
                    onChange={(e) => setNewMilestone({ ...newMilestone, repeat: e.target.value as any })}
                  >
                    <option value="None" className="dark:bg-[#2A2A28] bg-white">No Repeat</option>
                    <option value="Daily" className="dark:bg-[#2A2A28] bg-white">Daily</option>
                    <option value="Weekly" className="dark:bg-[#2A2A28] bg-white">Weekly</option>
                    <option value="Monthly" className="dark:bg-[#2A2A28] bg-white">Monthly</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-stone-500 text-stone-600 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsAddingMilestone(false)}
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
                {isSaving ? "Saving..." : "Add"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
