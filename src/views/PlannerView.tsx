import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  defaultDropAnimationSideEffects,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "motion/react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  GripVertical,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { isCompletedOnDate, isDueOnDate, type Category, type Goal, type Milestone } from "../storage";
import { DraggableMilestone } from "../components/dnd/DraggableMilestone";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function DroppablePlannerDate({
  dateStr,
  isSelected,
  isTodayDate,
  selectedRef,
  onClick,
  children,
}: any) {
  const { isOver, setNodeRef } = useDroppable({
    id: dateStr,
  });

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (isSelected && selectedRef) {
          selectedRef.current = node;
        }
      }}
      onClick={onClick}
      className={cn(
        "relative flex items-start group cursor-pointer transition-all",
        isSelected
          ? "bg-stone-100 dark:bg-white/[0.03]"
          : "hover:bg-stone-50 dark:hover:bg-white/[0.02]",
        isOver && "bg-orange-50 dark:bg-orange-500/5",
      )}
    >
      {/* Left accent bar for selected / today */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[3px] rounded-full transition-all",
          isSelected ? "bg-orange-500" : isTodayDate ? "bg-orange-500/40" : "bg-transparent",
        )}
      />
      {children}
    </div>
  );
}

function DraggablePlannerTask({
  milestone,
  isSelected,
  cat,
  onEdit,
  onDelete,
  onToggleComplete,
}: any) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: milestone.id,
    data: {
      type: "milestone",
      milestone,
    },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={cn(
        "group/task flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg transition-colors",
        isSelected ? "hover:bg-stone-100 dark:hover:bg-white/5" : "",
        milestone.done && "opacity-40",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-stone-300 dark:text-white/20 hover:text-stone-500 dark:hover:text-white/50 cursor-grab active:cursor-grabbing opacity-0 group-hover/task:opacity-100 transition-opacity"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      <div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: cat.color }}
      />

      <div className="flex-1 min-w-0">
        <h4
          className={cn(
            "text-sm truncate transition-colors",
            milestone.done
              ? "text-stone-400 dark:text-white/30 line-through"
              : "text-stone-800 dark:text-white/90 font-medium tracking-tight",
          )}
        >
          {milestone.title}
        </h4>
        {milestone.goal && (
          <p className="text-[9px] text-stone-400 dark:text-white/25 truncate tracking-wider uppercase font-medium mt-0.5">
            {milestone.goal.title}
          </p>
        )}
      </div>

      {isSelected && (
        <div className="flex items-center opacity-0 group-hover/task:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(milestone);
            }}
            className="p-1 text-stone-400 dark:text-white/30 hover:text-orange-400 rounded-md transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(milestone.id);
            }}
            className="p-1 text-stone-400 dark:text-white/30 hover:text-rose-400 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}



export function PlannerView({
  goals,
  categories,
  handleAddPlannerTask,
  deleteMilestone,
  editMilestone,
}: any) {
  const [mode, setMode] = useState<"weekly" | "monthly">("weekly");
  const [baseDate, setBaseDate] = useState(startOfDay(new Date()));
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [addingTaskForDate, setAddingTaskForDate] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskRepeat, setNewTaskRepeat] = useState<"None" | "Daily" | "Weekly" | "Monthly">("None");
  const [isRepeatMenuOpen, setIsRepeatMenuOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskRepeat, setEditTaskRepeat] = useState<"None" | "Daily" | "Weekly" | "Monthly">("None");
  const [isEditRepeatMenuOpen, setIsEditRepeatMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  const allUnassignedMilestones = useMemo(() => {
    return goals.flatMap((g: Goal) =>
      (g.milestones || [])
        .filter((m) => !m.due_date && !m.done)
        .map((m) => ({ ...m, goalTitle: g.title })),
    );
  }, [goals]);

  const activeMilestone = useMemo(() => {
    if (!activeId) return null;
    const unassigned = allUnassignedMilestones.find((m) => m.id === activeId);
    if (unassigned) return unassigned;

    for (const g of goals) {
      const milestone = (g.milestones || []).find((m: Milestone) => m.id === activeId);
      if (milestone) {
        return { ...milestone, goalTitle: g.title };
      }
    }
    return null;
  }, [activeId, allUnassignedMilestones, goals]);

  const handleDragStart = (event: { active: { id: string } }) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id) {
      const milestoneId = active.id as string;
      const targetId = over.id as string;
      let newDate: string | null = null;

      if (targetId !== "unassigned") {
        newDate = targetId;
      }

      editMilestone(milestoneId, { due_date: newDate });
    }
  };

  const { isOver: isUnassignedOver, setNodeRef: setUnassignedNodeRef } = useDroppable({
    id: "unassigned",
  });

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

  const dates = useMemo(() => {
    if (mode === "weekly") {
      const start = startOfWeek(baseDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    }

    const start = startOfMonth(baseDate);
    const end = endOfMonth(baseDate);
    return eachDayOfInterval({ start, end });
  }, [mode, baseDate]);

  const milestonesMap = useMemo(() => {
    const map: Record<string, any[]> = {};
    const allItems = goals.flatMap((g: Goal) =>
      (g.milestones || []).map((m) => ({ ...m, goal: g })),
    );

    dates.forEach((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      map[dateStr] = allItems
        .filter((item) => isDueOnDate(item, date))
        .map((item) => ({
          ...item,
          done: isCompletedOnDate(item, date),
        }));
    });

    return map;
  }, [goals, dates]);

  const handlePrev = () => {
    setBaseDate((prev) => (mode === "weekly" ? addDays(prev, -7) : subMonths(prev, 1)));
  };

  const handleNext = () => {
    setBaseDate((prev) => (mode === "weekly" ? addDays(prev, 7) : addMonths(prev, 1)));
  };

  const handleToday = () => {
    const today = startOfDay(new Date());
    setBaseDate(today);
    setSelectedDate(today);
  };

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [mode, baseDate]);

  const handleAddTask = (e: React.FormEvent, date: Date) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    handleAddPlannerTask(newTaskTitle, date, newTaskRepeat);
    setNewTaskTitle("");
    setNewTaskRepeat("None");
    setIsRepeatMenuOpen(false);
    setAddingTaskForDate(null);
  };

  return (
    <motion.div
      key="planner"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="md:p-8 max-w-7xl mx-auto w-full min-h-screen"
    >
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-row md:gap-6 min-h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full relative">
          {/* Unassigned Tasks Sidebar — Desktop only */}
          <div className="hidden md:flex w-60 shrink-0 flex-col bg-stone-50 dark:bg-white/[0.02] backdrop-blur-xl border border-stone-200 dark:border-white/[0.06] rounded-2xl sticky top-4 h-[calc(100vh-8rem)]">
            <div className="p-4 border-b border-stone-200 dark:border-white/[0.06]">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500 dark:text-white/40 truncate">
                Unassigned
              </h3>
            </div>
            <div
              ref={setUnassignedNodeRef}
              className={cn(
                "flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar transition-colors",
                isUnassignedOver && "bg-orange-500/5",
              )}
            >
              {allUnassignedMilestones.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-40">
                  <CheckCircle2 className="w-6 h-6 mb-2 text-stone-300 dark:text-white/20" />
                  <p className="text-[10px] text-stone-400 dark:text-white/30">All caught up</p>
                </div>
              ) : (
                allUnassignedMilestones.map((ms) => (
                  <DraggableMilestone key={ms.id} milestone={ms} goalTitle={ms.goalTitle} />
                ))
              )}
            </div>
          </div>

          {/* Main Timeline Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#121212] md:rounded-2xl md:border border-stone-200 dark:border-white/[0.06]">
            {/* Sticky Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 sm:px-6 py-4 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl sticky top-0 z-30 border-b border-stone-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-stone-100 dark:bg-white/5 p-0.5 rounded-lg border border-stone-200 dark:border-white/[0.06]">
                  <button
                    onClick={() => {
                      setMode("weekly");
                      setBaseDate(startOfDay(new Date()));
                      setSelectedDate(startOfDay(new Date()));
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                      mode === "weekly"
                        ? "bg-white dark:bg-white/10 text-stone-900 dark:text-white shadow-sm"
                        : "text-stone-500 dark:text-white/40 hover:text-stone-700 dark:hover:text-white/70",
                    )}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => {
                      setMode("monthly");
                      setBaseDate(startOfDay(new Date()));
                      setSelectedDate(startOfDay(new Date()));
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                      mode === "monthly"
                        ? "bg-white dark:bg-white/10 text-stone-900 dark:text-white shadow-sm"
                        : "text-stone-500 dark:text-white/40 hover:text-stone-700 dark:hover:text-white/70",
                    )}
                  >
                    Month
                  </button>
                </div>

                <button
                  onClick={handleToday}
                  className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-orange-400 transition-all flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
                >
                  <Calendar className="w-3 h-3" />
                  Today
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrev}
                  className="p-1.5 text-stone-400 dark:text-white/30 hover:text-stone-900 dark:hover:text-white transition-colors rounded-lg hover:bg-stone-100 dark:hover:bg-white/5"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white min-w-[130px] text-center">
                  {mode === "weekly"
                    ? `Week of ${format(startOfWeek(baseDate, { weekStartsOn: 1 }), "MMM d")}`
                    : format(baseDate, "MMMM yyyy")}
                </h3>
                <button
                  onClick={handleNext}
                  className="p-1.5 text-stone-400 dark:text-white/30 hover:text-stone-900 dark:hover:text-white transition-colors rounded-lg hover:bg-stone-100 dark:hover:bg-white/5"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Timeline Day Rows */}
            <div className="flex-1 px-4 sm:px-6 pb-24 md:pb-8 pt-2">
              <div className="divide-y divide-stone-100 dark:divide-white/[0.04]">
                {dates.map((date) => {
                  const dateStr = format(date, "yyyy-MM-dd");
                  const isSelected = isSameDay(date, selectedDate);
                  const isTodayDate = isSameDay(date, new Date());
                  const dayTasks = milestonesMap[dateStr] || [];

                  return (
                    <DroppablePlannerDate
                      key={dateStr}
                      dateStr={dateStr}
                      isSelected={isSelected}
                      isTodayDate={isTodayDate}
                      date={date}
                      selectedRef={selectedRef}
                      onClick={() => {
                        if (!isSelected) {
                          setSelectedDate(date);
                          setAddingTaskForDate(null);
                        }
                      }}
                    >
                      {/* Date Column */}
                      <div
                        className={cn(
                          "w-16 sm:w-20 shrink-0 py-4 pl-5 pr-3 flex flex-col items-start",
                        )}
                      >
                        <span
                          className={cn(
                            "text-[9px] font-bold uppercase tracking-[0.15em] mb-0.5 transition-colors",
                            isTodayDate ? "text-orange-500" : "text-stone-400 dark:text-white/25",
                          )}
                        >
                          {format(date, "EEE")}
                        </span>
                        <span
                          className={cn(
                            "text-lg font-semibold transition-colors",
                            isSelected
                              ? "text-stone-900 dark:text-white"
                              : isTodayDate
                                ? "text-orange-400"
                                : "text-stone-400 dark:text-white/40 group-hover:text-stone-600 dark:group-hover:text-white/60",
                          )}
                        >
                          {format(date, "d")}
                        </span>
                      </div>

                      {/* Task Column */}
                      <div className={cn(
                        "flex-1 min-w-0 py-4 px-3 sm:px-4",
                        dayTasks.length === 0 && !isSelected ? "min-h-[3rem]" : "min-h-[4rem]",
                      )}>
                        <div className="space-y-0.5">
                          {dayTasks.length === 0 && !isSelected && (
                            <div className="py-1 text-[10px] text-stone-300 dark:text-white/15 italic">
                              —
                            </div>
                          )}

                          {dayTasks.map((milestone) => {
                            const cat =
                              categories.find((c: Category) => c.name === milestone.goal.category) || {
                                color: "#64748b",
                              };

                            if (editingTaskId === milestone.id) {
                              return (
                                <form
                                  key={milestone.id}
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    if (editTaskTitle.trim()) {
                                      editMilestone(milestone.id, {
                                        title: editTaskTitle.trim(),
                                        repeat: editTaskRepeat,
                                      });
                                      setEditingTaskId(null);
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="mt-1 mb-2 flex items-center gap-2 bg-stone-100 dark:bg-white/5 p-1.5 pl-3 rounded-lg border border-stone-200 dark:border-white/10"
                                >
                                  <input
                                    type="text"
                                    autoFocus
                                    value={editTaskTitle}
                                    onChange={(e) => setEditTaskTitle(e.target.value)}
                                    placeholder="Edit task..."
                                    className="flex-1 min-w-0 bg-transparent text-sm text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/30 outline-none"
                                  />

                                  <div className="relative shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => setIsEditRepeatMenuOpen(!isEditRepeatMenuOpen)}
                                      className={cn(
                                        "px-2 py-1 rounded-md transition-colors flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider",
                                        editTaskRepeat !== "None"
                                          ? "bg-stone-200 dark:bg-white/10 text-stone-900 dark:text-white"
                                          : "text-stone-400 dark:text-white/30 hover:bg-stone-200 dark:hover:bg-white/5",
                                      )}
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                      {editTaskRepeat === "None" ? "Repeat" : editTaskRepeat}
                                    </button>

                                    <AnimatePresence>
                                      {isEditRepeatMenuOpen && (
                                        <motion.div
                                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                          animate={{ opacity: 1, y: 0, scale: 1 }}
                                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                          className="absolute right-0 bottom-full mb-2 w-36 bg-white dark:bg-[#2A2A28] border border-stone-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden z-50"
                                        >
                                          {["None", "Daily", "Weekly", "Monthly"].map((opt) => (
                                            <button
                                              key={opt}
                                              type="button"
                                              onClick={() => {
                                                setEditTaskRepeat(opt as any);
                                                setIsEditRepeatMenuOpen(false);
                                              }}
                                              className={cn(
                                                "w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-stone-50 dark:hover:bg-white/5",
                                                editTaskRepeat === opt
                                                  ? "text-stone-900 dark:text-white bg-stone-50 dark:bg-white/5"
                                                  : "text-stone-500 dark:text-white/50",
                                              )}
                                            >
                                              {opt === "None" ? "No repeat" : `Repeat ${opt}`}
                                            </button>
                                          ))}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>

                                  <button
                                    type="submit"
                                    disabled={!editTaskTitle.trim()}
                                    className="p-1.5 bg-orange-500 text-white rounded-md disabled:opacity-50 transition-opacity"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingTaskId(null)}
                                    className="p-1.5 text-stone-400 dark:text-white/30 hover:text-stone-600 dark:hover:text-white/60 transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </form>
                              );
                            }

                            return (
                              <DraggablePlannerTask
                                key={milestone.id}
                                milestone={milestone}
                                isSelected={isSelected}
                                cat={cat}
                                onEdit={(m: any) => {
                                  setEditingTaskId(m.id);
                                  setEditTaskTitle(m.title);
                                  setEditTaskRepeat(m.repeat || "None");
                                }}
                                onDelete={deleteMilestone}
                                onToggleComplete={(m: any) => {
                                  editMilestone(m.id, { done: !m.done });
                                }}
                              />
                            );
                          })}

                          {isSelected &&
                            (addingTaskForDate === dateStr ? (
                              <form
                                onSubmit={(e) => handleAddTask(e, date)}
                                onClick={(e) => e.stopPropagation()}
                                className="mt-2 flex items-center gap-2 bg-stone-100 dark:bg-white/5 p-1.5 pl-3 rounded-lg border border-stone-200 dark:border-white/10"
                              >
                                <input
                                  type="text"
                                  autoFocus
                                  value={newTaskTitle}
                                  onChange={(e) => setNewTaskTitle(e.target.value)}
                                  placeholder="Type a task..."
                                  className="flex-1 min-w-0 bg-transparent text-sm text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/30 outline-none"
                                />

                                <div className="relative shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setIsRepeatMenuOpen(!isRepeatMenuOpen)}
                                    className={cn(
                                      "px-2 py-1 rounded-md transition-colors flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider",
                                      newTaskRepeat !== "None"
                                        ? "bg-stone-200 dark:bg-white/10 text-stone-900 dark:text-white"
                                        : "text-stone-400 dark:text-white/30 hover:bg-stone-200 dark:hover:bg-white/5",
                                    )}
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                    {newTaskRepeat === "None" ? "Repeat" : newTaskRepeat}
                                  </button>

                                  <AnimatePresence>
                                    {isRepeatMenuOpen && (
                                      <motion.div
                                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                        className="absolute right-0 bottom-full mb-2 w-36 bg-white dark:bg-[#2A2A28] border border-stone-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden z-50"
                                      >
                                        {["None", "Daily", "Weekly", "Monthly"].map((opt) => (
                                          <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                              setNewTaskRepeat(opt as any);
                                              setIsRepeatMenuOpen(false);
                                            }}
                                            className={cn(
                                              "w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-stone-50 dark:hover:bg-white/5",
                                              newTaskRepeat === opt
                                                ? "text-stone-900 dark:text-white bg-stone-50 dark:bg-white/5"
                                                : "text-stone-500 dark:text-white/50",
                                            )}
                                          >
                                            {opt === "None" ? "No repeat" : `Repeat ${opt}`}
                                          </button>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>

                                <button
                                  type="submit"
                                  disabled={!newTaskTitle.trim()}
                                  className="p-1.5 bg-orange-500 text-white rounded-md disabled:opacity-50 transition-opacity"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </form>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAddingTaskForDate(dateStr);
                                  setNewTaskTitle("");
                                  setNewTaskRepeat("None");
                                }}
                                className="mt-2 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-white/25 hover:text-stone-600 dark:hover:text-white/50 py-1.5 px-2 -mx-2 rounded-md hover:bg-stone-100 dark:hover:bg-white/5 transition-colors flex items-center gap-2 w-max"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Add Task
                              </button>
                            ))}
                        </div>
                      </div>
                    </DroppablePlannerDate>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

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
            <div className="p-2 md:p-3 rounded-xl border border-orange-500/50 bg-orange-500/10 shadow-xl shadow-orange-500/20 pointer-events-none backdrop-blur-xl">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-stone-900 dark:text-white truncate">
                {activeMilestone.title}
              </p>
              <p className="text-[8px] md:text-[10px] text-stone-500 dark:text-white/40 truncate">
                {activeMilestone.goalTitle}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </motion.div>
  );
}
