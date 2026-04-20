import React from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { Goal } from "../../storage";

type MilestoneFormState = {
  title: string;
  due_date: string;
  note: string;
  goal_id: string;
  repeat: "None" | "Daily" | "Weekly" | "Monthly";
};

interface MilestoneModalProps {
  isAddingMilestone: boolean;
  setIsAddingMilestone: (v: boolean) => void;
  handleAddMilestone: (e: React.FormEvent) => Promise<void>;
  newMilestone: MilestoneFormState;
  setNewMilestone: React.Dispatch<React.SetStateAction<MilestoneFormState>>;
  activeGoalId: string | null;
  goals: Goal[];
  isSaving: boolean;
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
            Add Milestone
          </h3>
          <form onSubmit={handleAddMilestone} className="space-y-2.5">
            {!activeGoalId && (
              <div>
                <label className={LABEL_CLASS}>
                  Select Goal
                </label>
                <div className="relative">
                  <select
                    className={`${SELECT_CLASS} cursor-pointer`}
                    value={newMilestone.goal_id || ""}
                    onChange={(e) => setNewMilestone({ ...newMilestone, goal_id: e.target.value })}
                  >
                    <option value="" disabled className="bg-[#121519] text-white">
                      Choose a goal...
                    </option>
                    <option value="none" className="bg-[#121519] font-semibold text-orange-500">
                      None (General Task)
                    </option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id} className="bg-[#121519] text-white">
                        {g.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/34 pointer-events-none" />
                </div>
              </div>
            )}
            <div>
              <label className={LABEL_CLASS}>
                Milestone Title
              </label>
              <input
                autoFocus
                required
                type="text"
                placeholder="e.g. Complete first draft"
                className={FIELD_CLASS}
                value={newMilestone.title || ""}
                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
              />
            </div>
            <div className={PAIRED_GRID_CLASS}>
              <div className="min-w-0">
                <label className={LABEL_CLASS}>
                  Due Date{" "}
                  {newMilestone.repeat !== "None" ? "(Required for Recurring)" : "(Optional)"}
                </label>
                <input
                  type="date"
                  required={newMilestone.repeat !== "None"}
                  className={`${FIELD_CLASS} cursor-pointer`}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                  value={newMilestone.due_date || ""}
                  onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
                />
              </div>
              <div className="min-w-0">
                <label className={LABEL_CLASS}>
                  Repeat
                </label>
                <div className="relative">
                  <select
                    className={SELECT_CLASS}
                    value={newMilestone.repeat || "None"}
                    onChange={(e) => setNewMilestone({ ...newMilestone, repeat: e.target.value as any })}
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
            <div className="flex gap-2 pt-1.5">
              <button
                type="button"
                onClick={() => setIsAddingMilestone(false)}
                className={CANCEL_BUTTON_CLASS}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={PRIMARY_BUTTON_CLASS}
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
