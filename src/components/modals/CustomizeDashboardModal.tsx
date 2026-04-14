import React from "react";
import { motion, Reorder } from "motion/react";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { cn } from "../../lib/utils";

interface WidgetConfig {
  id: string;
  visible: boolean;
  label: string;
}

interface CustomizeDashboardModalProps {
  isCustomizingLayout: boolean;
  setIsCustomizingLayout: (v: boolean) => void;
  dashboardLayout: WidgetConfig[];
  setDashboardLayout: React.Dispatch<React.SetStateAction<WidgetConfig[]>>;
}

export const CustomizeDashboardModal: React.FC<CustomizeDashboardModalProps> = ({
  isCustomizingLayout,
  setIsCustomizingLayout,
  dashboardLayout,
  setDashboardLayout,
}) => {
  if (!isCustomizingLayout) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsCustomizingLayout(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md dark:bg-[#0f172a] bg-stone-50 border dark:border-white/10 border-stone-300 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 md:p-8">
          <h3 className="text-xl font-extrabold dark:text-white text-stone-900 tracking-tight mb-2">
            Customize Dashboard
          </h3>
          <p className="dark:text-stone-500 text-stone-600 text-sm mb-8">
            Drag to reorder widgets and toggle visibility.
          </p>

          <Reorder.Group
            axis="y"
            values={dashboardLayout}
            onReorder={setDashboardLayout}
            className="space-y-3"
          >
            {dashboardLayout.map((widget) => (
              <Reorder.Item
                key={widget.id}
                value={widget}
                className="flex items-center gap-4 p-4 dark:bg-white/5 bg-stone-100 border dark:border-white/5 border-stone-200 rounded-2xl cursor-grab active:cursor-grabbing group touch-none"
              >
                <GripVertical className="w-4 h-4 dark:text-stone-500 text-stone-600 group-hover:dark:text-stone-400 transition-colors" />
                <span className="flex-1 text-sm font-bold dark:text-stone-200 text-stone-800">
                  {widget.label}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDashboardLayout((prev) =>
                      prev.map((w) =>
                        w.id === widget.id ? { ...w, visible: !w.visible } : w
                      )
                    );
                  }}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    widget.visible
                      ? "text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)] bg-orange-500/10"
                      : "text-stone-600 dark:bg-white/5 bg-stone-100"
                  )}
                >
                  {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          <div className="mt-10 space-y-3">
            <button
              onClick={() => setIsCustomizingLayout(false)}
              className="w-full py-4 rounded-2xl bg-orange-500 text-[#431407] btn-extruded font-bold text-sm hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20"
            >
              Done
            </button>
            <button
              onClick={async () => {
                const defaultLayout: WidgetConfig[] = [
                  { id: "stats", visible: true, label: "Quick Stats" },
                  { id: "progress", visible: true, label: "Goal Progress" },
                  { id: "trends", visible: true, label: "Historical Trends" },
                  { id: "repeatability", visible: true, label: "Repeatability Track" },
                  { id: "categories", visible: true, label: "Category Breakdown" },
                  { id: "focus", visible: true, label: "Today's Focus" },
                ];
                setDashboardLayout(defaultLayout);
              }}
              className="w-full py-4 rounded-2xl dark:bg-white/5 bg-stone-100 dark:text-stone-400 dark:text-stone-500 text-stone-600 font-bold text-sm hover:dark:bg-white/10 bg-stone-200 transition-colors"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
