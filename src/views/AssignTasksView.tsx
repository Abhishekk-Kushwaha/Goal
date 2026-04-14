import React, { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  defaultDropAnimationSideEffects,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { motion } from "motion/react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  endOfWeek,
} from "date-fns";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { storage, type Goal } from "../storage";
import { DraggableMilestone } from "../components/dnd/DraggableMilestone";
import { DroppableDay } from "../components/dnd/DroppableDay";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "dark:bg-[#2A2A28] bg-[#F5F5F3] border dark:border-[#3D3D3B] border-[#E5E5E3] rounded-2xl overflow-hidden shadow-[8px_8px_16px_#E6E6E4,-8px_-8px_16px_#FFFFFF] dark:shadow-[8px_8px_16px_#242422,-8px_-8px_16px_#30302E]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function AssignTasksView({ goals, fetchGoals, setView }: any) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [localGoals, setLocalGoals] = useState(goals);
  const [activeId, setActiveId] = useState<string | null>(null);

  const allUnassignedMilestones = useMemo(() => {
    return localGoals.flatMap((g: Goal) =>
      (g.milestones || [])
        .filter((m) => !m.due_date && !m.done)
        .map((m) => ({ ...m, goalTitle: g.title })),
    );
  }, [localGoals]);

  const allAssignedMilestones = useMemo(() => {
    return localGoals.flatMap((g: Goal) =>
      (g.milestones || [])
        .filter((m) => m.due_date)
        .map((m) => ({ ...m, goalTitle: g.title })),
    );
  }, [localGoals]);

  const activeMilestone = useMemo(() => {
    if (!activeId) return null;
    return (
      allUnassignedMilestones.find((m) => m.id === activeId) ||
      allAssignedMilestones.find((m) => m.id === activeId)
    );
  }, [activeId, allUnassignedMilestones, allAssignedMilestones]);

  const handleDragStart = (event: { active: { id: string } }) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id) {
      const milestoneId = active.id as string;
      const targetId = over.id as string;
      let newDate: string | null = null;

      if (targetId !== "unassigned") {
        newDate = targetId;
      }

      setLocalGoals((prev: Goal[]) =>
        prev.map((g) => ({
          ...g,
          milestones: g.milestones.map((m) =>
            m.id === milestoneId ? { ...m, due_date: newDate } : m,
          ),
        })),
      );

      storage.updateMilestone(milestoneId, { due_date: newDate }).catch((err) => {
        console.error("Failed to update milestone:", err);
      });
    }
  };

  const { isOver: isUnassignedOver, setNodeRef: setUnassignedNodeRef } = useDroppable({
    id: "unassigned",
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="p-2 md:p-6 w-full max-w-[100vw] lg:max-w-[98vw] mx-auto h-[calc(100vh-60px)] md:h-[calc(100vh-40px)] flex flex-col"
      >
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-mono-nums dark:text-white text-stone-900 tracking-tight mb-1">
              Assign Tasks
            </h2>
            <p className="dark:text-stone-500 text-stone-600 text-xs md:text-sm">
              Drag unassigned milestones onto the calendar.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-4 w-full md:w-auto">
            <div className="flex items-center justify-between gap-4 dark:bg-white/5 bg-stone-100 p-1 rounded-xl border dark:border-white/5 border-stone-200">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 dark:text-stone-400 text-stone-600 hover:dark:text-white text-stone-900 hover:dark:bg-white/5 bg-stone-100 rounded-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs md:text-sm font-bold dark:text-white text-stone-900 min-w-[120px] md:min-w-[140px] text-center uppercase tracking-widest">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 dark:text-stone-400 text-stone-600 hover:dark:text-white text-stone-900 hover:dark:bg-white/5 bg-stone-100 rounded-lg transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={async () => {
                await fetchGoals();
                setView("calendar");
              }}
              className="px-4 md:px-8 py-2 md:py-2.5 bg-orange-500 text-[#431407] btn-extruded rounded-xl font-bold text-xs md:text-sm hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20 text-center"
            >
              Save & Close
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-row gap-2 md:gap-6 min-h-0">
          <Card
            className={cn(
              "w-[110px] sm:w-[200px] lg:w-[300px] flex-shrink-0 flex flex-col h-full min-h-0 transition-colors",
              isUnassignedOver && "bg-white/[0.05] border-white/20",
            )}
          >
            <div className="p-2 md:p-4 border-bottom dark:border-white/5 border-stone-200 dark:bg-white/[0.02] bg-stone-50">
              <h3 className="text-[9px] md:text-[10px] font-semibold tracking-widest uppercase dark:text-stone-500 text-stone-600 truncate">
                <span className="hidden sm:inline">Unassigned Milestones</span>
                <span className="sm:hidden">Unassigned</span>
              </h3>
            </div>
            <div
              ref={setUnassignedNodeRef}
              className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-3 custom-scrollbar"
            >
              {allUnassignedMilestones.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)]/20 mb-2" />
                  <p className="text-stone-600 text-[10px] md:text-xs italic">
                    All milestones are assigned or completed!
                  </p>
                </div>
              ) : (
                allUnassignedMilestones.map((ms) => (
                  <DraggableMilestone key={ms.id} milestone={ms} goalTitle={ms.goalTitle} />
                ))
              )}
            </div>
          </Card>

          <Card className="flex-1 p-1 sm:p-2 md:p-6 flex flex-col min-h-0 overflow-hidden">
            <div className="grid grid-cols-7 mb-1 md:mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-[7px] md:text-[9px] font-semibold tracking-widest uppercase dark:text-stone-500 text-stone-600 py-1 md:py-2 truncate"
                >
                  {day.slice(0, 1)}
                  <span className="hidden sm:inline">{day.slice(1)}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-2">
              <div className="grid grid-cols-7 gap-1 md:gap-3">
                {calendarDays.map((day) => {
                  const dayStr = format(day, "yyyy-MM-dd");
                  const dayMilestones = allAssignedMilestones.filter((m) => m.due_date === dayStr);

                  return (
                    <DroppableDay
                      key={dayStr}
                      day={day}
                      isCurrentMonth={isSameMonth(day, monthStart)}
                      milestones={dayMilestones}
                    />
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: "0.5",
              },
            },
          }),
        }}
      >
        {activeId && activeMilestone ? (
          <div className="p-2 md:p-3 rounded-xl border border-orange-500/50 bg-orange-500/10 shadow-xl shadow-orange-500/20 pointer-events-none">
            <p className="text-[10px] md:text-[10px] font-semibold tracking-widest uppercase dark:text-white text-stone-900 truncate">
              {activeMilestone.title}
            </p>
            <p className="text-[8px] md:text-[10px] dark:text-stone-500 text-stone-600 truncate">
              {activeMilestone.goalTitle}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
