import React from "react";
import { motion } from "motion/react";
import type { Category } from "../../hooks/useCategories";

interface CategoryModalProps {
  isAddingCategory: boolean;
  setIsAddingCategory: (v: boolean) => void;
  editingCategory: Category | null;
  setEditingCategory: (v: Category | null) => void;
  newCategory: { name: string; color: string; icon: string };
  setNewCategory: (v: { name: string; color: string; icon: string }) => void;
  handleAddCategory: (e: React.FormEvent) => Promise<void>;
  handleEditCategory: (e: React.FormEvent) => Promise<void>;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isAddingCategory,
  setIsAddingCategory,
  editingCategory,
  setEditingCategory,
  newCategory,
  setNewCategory,
  handleAddCategory,
  handleEditCategory,
}) => {
  if (!isAddingCategory && !editingCategory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={async () => {
          setIsAddingCategory(false);
          setEditingCategory(null);
        }}
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
            {editingCategory ? "Edit Category" : "New Category"}
          </h3>
          <form
            onSubmit={
              editingCategory ? handleEditCategory : handleAddCategory
            }
            className="space-y-5"
          >
            <div>
              <label className="block text-[9px] font-semibold tracking-widest uppercase tracking-widest dark:text-stone-500 text-stone-600 mb-2">
                Name
              </label>
              <input
                autoFocus
                required
                type="text"
                placeholder="e.g. Travel"
                className="w-full dark:bg-white/5 bg-stone-100 border dark:border-white/10 border-stone-300 rounded-xl px-4 py-3 dark:text-white text-stone-900 placeholder:text-stone-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                value={
                  editingCategory ? editingCategory.name : newCategory.name
                }
                onChange={(e) =>
                  editingCategory
                    ? setEditingCategory({
                        ...editingCategory,
                        name: e.target.value,
                      })
                    : setNewCategory({
                        ...newCategory,
                        name: e.target.value,
                      })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-semibold tracking-widest uppercase tracking-widest dark:text-stone-500 text-stone-600 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  className="w-full h-12 dark:bg-white/5 bg-stone-100 border dark:border-white/10 border-stone-300 rounded-xl px-2 py-1 cursor-pointer"
                  value={
                    editingCategory ? editingCategory.color : newCategory.color
                  }
                  onChange={(e) =>
                    editingCategory
                      ? setEditingCategory({
                          ...editingCategory,
                          color: e.target.value,
                        })
                      : setNewCategory({
                          ...newCategory,
                          color: e.target.value,
                        })
                  }
                />
              </div>
              <div>
                <label className="block text-[9px] font-semibold tracking-widest uppercase tracking-widest dark:text-stone-500 text-stone-600 mb-2">
                  Icon (Emoji)
                </label>
                <input
                  required
                  type="text"
                  maxLength={2}
                  className="w-full dark:bg-white/5 bg-stone-100 border dark:border-white/10 border-stone-300 rounded-xl px-4 py-3 dark:text-white text-stone-900 text-center text-xl focus:outline-none focus:border-orange-500/50 transition-colors"
                  value={
                    editingCategory ? editingCategory.icon : newCategory.icon
                  }
                  onChange={(e) =>
                    editingCategory
                      ? setEditingCategory({
                          ...editingCategory,
                          icon: e.target.value,
                        })
                      : setNewCategory({
                          ...newCategory,
                          icon: e.target.value,
                        })
                  }
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={async () => {
                  setIsAddingCategory(false);
                  setEditingCategory(null);
                }}
                className="flex-1 py-3 rounded-xl dark:bg-white/5 bg-stone-100 dark:text-stone-400 dark:text-stone-500 text-stone-600 font-bold text-sm hover:dark:bg-white/10 bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-orange-500 text-[#431407] btn-extruded font-bold text-sm hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20"
              >
                {editingCategory ? "Save" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
