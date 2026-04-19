import React from "react";
import {
  Calendar,
  CalendarDays,
  Filter,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Target,
  Activity,
  X,
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
  isMenuOpen?: boolean;
  setIsMenuOpen?: (open: boolean) => void;
  stats?: { avgProgress?: number };
  supabase?: any;
  session?: any;
}) {
  const {
    view,
    setView,
    setActiveGoalId,
    isMenuOpen = false,
    setIsMenuOpen,
    stats,
    supabase,
    session,
  } = props;

  const mobileNavItems = [
    { id: "today", icon: Target, label: "Today" },
    { id: "planner", icon: CalendarDays, label: "Planner" },
    { id: "habits", icon: Activity, label: "Habits" },
    { id: "goals", icon: LayoutDashboard, label: "Goals" },
    { id: "dashboard", icon: Sun, label: "Dashboard" },
  ];

  const drawerNavItems = [
    { id: "today", icon: Sun, label: "Today" },
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "habits", icon: Activity, label: "Habits" },
    { id: "goals", icon: Target, label: "Goals" },
    { id: "categories", icon: Filter, label: "Categories" },
    { id: "calendar", icon: Calendar, label: "Calendar" },
  ];

  const overallProgress = Math.max(
    0,
    Math.min(100, Math.round(stats?.avgProgress || 0)),
  );

  const isActive = (id: string) =>
    view === id || (id === "goals" && view === "detail");

  const navigate = (id: string) => {
    setView(id as any);
    if (id !== "goals") setActiveGoalId(null);
  };

  React.useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen?.(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, setIsMenuOpen]);

  return (
    <>
      {!isMenuOpen && (
        <button
          type="button"
          onClick={() => setIsMenuOpen?.(true)}
          className="fixed left-5 top-5 z-[70] hidden h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-[#10141a]/90 text-white/78 shadow-[0_18px_50px_-28px_rgba(0,0,0,1)] backdrop-blur-xl transition-colors hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white md:flex"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      <aside
        className={cn(
          "hidden h-screen shrink-0 flex-col overflow-hidden border-r border-white/[0.08] bg-[linear-gradient(180deg,rgba(17,22,29,0.98),rgba(8,11,16,0.995))] px-7 py-8 text-white shadow-[34px_0_100px_-54px_rgba(0,0,0,1)] transition-[width,opacity,transform] duration-300 md:flex",
          isMenuOpen
            ? "w-[360px] translate-x-0 opacity-100"
            : "w-0 -translate-x-2 px-0 opacity-0",
        )}
        aria-hidden={!isMenuOpen}
      >
        <div className="mb-12 flex min-w-[304px] items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("today")}
            className="group flex items-center gap-4"
          >
            <div className="flex h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-emerald-500 text-[#042015] shadow-[0_20px_44px_-22px_rgba(16,185,129,1)] transition-transform group-hover:scale-[1.03]">
              <Target className="h-8 w-8" />
            </div>
            <h1 className="text-[30px] font-black tracking-[-0.04em] text-white">
              Goal<span className="text-emerald-400">Forge</span>
            </h1>
          </button>

          <button
            type="button"
            onClick={() => setIsMenuOpen?.(false)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white/48 transition-colors hover:text-white"
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="min-w-[304px] space-y-2">
          {drawerNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                className={cn(
                  "flex h-[60px] w-full items-center gap-4 rounded-[18px] px-5 text-left text-[19px] font-bold tracking-[-0.01em] transition-all",
                  active
                    ? "bg-[linear-gradient(90deg,rgba(58,29,25,0.98),rgba(43,24,23,0.96))] text-orange-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
                    : "text-white/56 hover:bg-white/[0.045] hover:text-white/84",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-12 flex min-w-[304px] items-center justify-between px-2">
          <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/42">
            My Goals
          </span>
          <button
            type="button"
            onClick={() => navigate("goals")}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/52 transition-colors hover:bg-white/[0.05] hover:text-white"
            aria-label="Open goals"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-auto min-w-[304px] border-t border-white/[0.08] pt-7">
          <div className="mb-7 flex items-center justify-between">
            <span className="text-[16px] font-bold text-white/78">Theme</span>
            <button
              type="button"
              className="flex h-[52px] w-[52px] items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.055] text-white/72"
              aria-label="Dark theme enabled"
            >
              <Moon className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-8 flex items-center justify-between">
            <span className="min-w-0 pr-4 text-[16px] font-bold text-white/78">
              Account
            </span>
            {supabase && session ? (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen?.(false);
                  void supabase.auth.signOut();
                }}
                className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.26em] text-rose-300 transition-colors hover:text-rose-200"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            ) : (
              <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/30">
                Offline
              </span>
            )}
          </div>

          <div className="rounded-[22px] border border-orange-300/[0.14] bg-[linear-gradient(145deg,rgba(249,115,22,0.08),rgba(255,255,255,0.025))] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-[0.22em] text-orange-300">
                Overall
              </span>
              <span className="text-[22px] font-black tracking-[-0.02em] text-orange-300">
                {overallProgress}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full bg-orange-400 transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#121212]/80 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around p-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.id);
            return (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id as any);
                if (item.id !== "goals") setActiveGoalId(null);
              }}
              className={cn(
                "group relative flex h-14 w-16 flex-col items-center justify-center rounded-xl transition-all duration-300",
                active
                  ? "bg-orange-500/10 text-orange-500"
                  : "text-stone-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <div
                className={cn(
                  "rounded-xl p-1.5 transition-transform duration-300",
                  active
                    ? "scale-110 drop-shadow-sm"
                    : "group-hover:scale-110",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  "mt-1 text-[10px] font-semibold uppercase tracking-wider transition-opacity",
                  active ? "opacity-100" : "opacity-70 group-hover:opacity-100",
                )}
              >
                {item.label}
              </span>
            </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
