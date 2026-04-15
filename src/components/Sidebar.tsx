import React from "react";
import {
  CalendarDays,
  LayoutDashboard,
  Target,
  Activity,
  Flame,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Sidebar(props: {
  view: string;
  setView: (view: any) => void;
  setActiveGoalId: (id: string | null) => void;
}) {
  const { view, setView, setActiveGoalId } = props;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-2xl border-t border-stone-200 dark:border-white/5 z-50 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.5)] md:top-0 md:bottom-auto md:w-24 md:h-screen md:border-r md:border-t-0 md:shadow-[4px_0_24px_-10px_rgba(0,0,0,0.5)] md:pb-0 transition-all">
      <div className="flex items-center justify-around p-2 max-w-md mx-auto md:flex-col md:justify-center md:gap-8 md:h-full md:px-0">
        {[
          { id: "today", icon: Target, label: "Today" },
          { id: "planner", icon: CalendarDays, label: "Planner" },
          { id: "habits", icon: Activity, label: "Habits" },
          { id: "goals", icon: LayoutDashboard, label: "Goals" },
          { id: "dashboard", icon: Flame, label: "Dashboard" },
        ].map((item) => {
          const Icon = item.icon;
          const isActive =
            view === item.id || (item.id === "goals" && view === "detail");
          return (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id as any);
                if (item.id !== "goals") setActiveGoalId(null);
              }}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-14 md:w-16 md:h-16 rounded-xl transition-all duration-300 group relative",
                isActive
                  ? "text-orange-500 bg-orange-50/80 dark:bg-orange-500/10 md:bg-transparent md:dark:bg-transparent md:shadow-none"
                  : "text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/5",
              )}
            >
              {isActive && (
                <div className="hidden md:block absolute -left-4 top-1/4 bottom-1/4 w-1 bg-orange-500 rounded-r-full shadow-[0_0_12px_rgba(255,87,34,0.8)]" />
              )}
              <div
                className={cn(
                  "p-1.5 md:p-2 rounded-xl transition-transform duration-300",
                  isActive
                    ? "scale-110 drop-shadow-sm"
                    : "group-hover:scale-110",
                )}
              >
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className={cn(
                "text-[10px] font-semibold mt-1 tracking-wider uppercase transition-opacity",
                isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
              )}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
