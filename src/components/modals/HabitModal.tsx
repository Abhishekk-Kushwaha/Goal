import React from "react";
import { motion } from "motion/react";
import { ChevronDown, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Category, Habit } from "../../storage";

interface HabitModalProps {
  isAddingHabit: boolean;
  setIsAddingHabit: (v: boolean) => void;
  editingHabit: Habit | null;
  setEditingHabit: (v: Habit | null) => void;
  handleAddHabit: (e: React.FormEvent) => Promise<void>;
  handleDeleteHabit: (id: string) => Promise<void>;
  newHabit: Partial<Habit>;
  setNewHabit: (v: Partial<Habit>) => void;
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

const DELETE_BUTTON_CLASS =
  "h-10 rounded-[9px] border border-rose-400/18 bg-rose-500/8 px-3 text-[12px] font-semibold text-rose-300/82 transition-colors hover:border-rose-300/28 hover:bg-rose-500/12 hover:text-rose-200";

export const HabitModal: React.FC<HabitModalProps> = ({
  isAddingHabit,
  setIsAddingHabit,
  editingHabit,
  setEditingHabit,
  handleAddHabit,
  handleDeleteHabit,
  newHabit,
  setNewHabit,
  categories,
  isSaving,
  saveError,
}) => {
  if (!isAddingHabit && !editingHabit) return null;

  const isScheduledHabit =
    newHabit.repeat === "Weekly" || newHabit.repeat === "Monthly";
  const startDateValue = newHabit.created_at
    ? newHabit.created_at.slice(0, 10)
    : "";

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
            created_at: "",
          });
        }}
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
            {editingHabit ? "Edit Habit" : "New Habit"}
          </h3>
          <form onSubmit={handleAddHabit} className="space-y-2.5">
            <div>
              <label className={LABEL_CLASS}>
                Habit Title
              </label>
              <input
                autoFocus
                required
                type="text"
                placeholder="What habit do you want to build?"
                className={FIELD_CLASS}
                value={newHabit.title || ""}
                onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
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
                    value={newHabit.category || ""}
                    onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
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
                  Repeat
                </label>
                <div className="relative">
                  <select
                    className={SELECT_CLASS}
                    value={newHabit.repeat || "Daily"}
                    onChange={(e) =>
                      setNewHabit({ ...newHabit, repeat: e.target.value as any })
                    }
                  >
                    <option value="Daily" className="bg-[#121519] text-white">Daily</option>
                    <option value="Weekly" className="bg-[#121519] text-white">Weekly</option>
                    <option value="Monthly" className="bg-[#121519] text-white">Monthly</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/34 pointer-events-none" />
                </div>
              </div>
            </div>
            {isScheduledHabit && (
              <div>
                <label className={LABEL_CLASS}>
                  Start Date <span className="text-orange-400">*</span>
                </label>
                <input
                  required
                  type="date"
                  className={`${FIELD_CLASS} cursor-pointer`}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                  value={startDateValue}
                  onChange={(e) =>
                    setNewHabit({ ...newHabit, created_at: e.target.value })
                  }
                />
                <p className="mt-1 text-[10px] font-medium leading-relaxed text-white/34">
                  This decides the {newHabit.repeat === "Weekly" ? "weekday" : "monthly date"} your habit appears on and how streaks are counted.
                </p>
              </div>
            )}
            <div className={PAIRED_GRID_CLASS}>
              <div className="min-w-0">
                <label className={LABEL_CLASS}>
                  Target End Date
                </label>
                <input
                  type="date"
                  className={`${FIELD_CLASS} cursor-pointer`}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                  value={newHabit.due_date || ""}
                  onChange={(e) => setNewHabit({ ...newHabit, due_date: e.target.value })}
                />
              </div>
              <div className="min-w-0">
                <label className={LABEL_CLASS}>
                  Accent Color
                </label>
                <div className="flex min-h-9 flex-wrap items-center gap-1.5">
                  {[
                    { value: "#f97316", label: "Orange" },
                    { value: "#10b981", label: "Emerald" },
                    { value: "#6366f1", label: "Indigo" },
                    { value: "#8b5cf6", label: "Violet" },
                    { value: "#0ea5e9", label: "Sky" },
                    { value: "#ec4899", label: "Pink" },
                    { value: "#f59e0b", label: "Amber" },
                    { value: "#bef264", label: "Lime" },
                  ].map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.label}
                      onClick={() => setNewHabit({ ...newHabit, color: c.value })}
                      className={cn(
                        "h-6 w-6 rounded-full border transition-all duration-200",
                        newHabit.color === c.value
                          ? "border-white/80 ring-1 ring-orange-400/55 ring-offset-1 ring-offset-[#0d1014]"
                          : "border-white/10 opacity-75 hover:opacity-100"
                      )}
                      style={{
                        backgroundColor: c.value,
                        boxShadow: newHabit.color === c.value ? `0 0 12px ${c.value}50` : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            {saveError && (
              <div className="rounded-[9px] border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-[12px] font-medium text-rose-300">
                {saveError}
              </div>
            )}
            <div className="flex gap-2 pt-1.5">
              {editingHabit && (
                <button
                  type="button"
                  onClick={() => void handleDeleteHabit(editingHabit.id)}
                  className={DELETE_BUTTON_CLASS}
                  aria-label="Delete habit"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </span>
                </button>
              )}
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
                    created_at: "",
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
                {isSaving ? "Saving..." : editingHabit ? "Save Changes" : "Create Habit"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
