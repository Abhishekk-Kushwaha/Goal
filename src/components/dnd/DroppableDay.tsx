import React from "react";
import { motion } from "motion/react";
import { format, isToday } from "date-fns";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Milestone } from "../../storage";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function DraggableCalendarMilestone({
  milestone,
  goalTitle,
}: {
  milestone: Milestone;
  goalTitle: string;
  key?: React.Key;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: milestone.id,
    data: { milestone, goalTitle },
  });

  const style = {
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "px-0.5 md:px-2 py-0.5 md:py-1 rounded bg-orange-500/10 border border-orange-500/20 cursor-grab active:cursor-grabbing touch-none",
        isDragging && "border-orange-500/50 bg-orange-500/5 z-50",
      )}
    >
      <p className="text-[7px] md:text-[9px] font-bold text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)] truncate leading-tight">
        {milestone.title}
      </p>
    </div>
  );
}

export function DroppableDay({
  day,
  isCurrentMonth,
  milestones,
}: {
  day: Date;
  isCurrentMonth: boolean;
  milestones: any[];
  key?: React.Key;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: format(day, "yyyy-MM-dd"),
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[80px] md:min-h-[140px] p-1 md:p-3 rounded-xl border transition-all duration-200 flex flex-col",
        !isCurrentMonth && "opacity-20",
        isOver
          ? "bg-orange-500/10 border-orange-500/50 scale-[1.02] z-10"
          : "dark:bg-white/[0.02] bg-stone-50 dark:border-white/5 border-stone-200",
        isToday(day) && "border-orange-500/30",
      )}
    >
      <div className="flex justify-between items-start mb-1 md:mb-2">
        <span
          className={cn(
            "text-[9px] md:text-[10px] font-semibold tracking-widest uppercase",
            isToday(day)
              ? "text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)]"
              : "dark:text-stone-500 text-stone-600",
          )}
        >
          {format(day, "d")}
        </span>
        {milestones.length > 0 && (
          <span className="text-[8px] md:text-[9px] font-semibold tracking-widest uppercase dark:text-stone-500 text-stone-600 px-1 md:px-1.5 py-0.5 dark:bg-white/5 bg-stone-100 rounded hidden sm:inline-block">
            {milestones.length}
          </span>
        )}
      </div>
      <div className="flex-1 space-y-1 md:space-y-1.5 overflow-hidden">
        {milestones.slice(0, 4).map((ms) => (
          <DraggableCalendarMilestone
            key={ms.id}
            milestone={ms}
            goalTitle={ms.goalTitle}
          />
        ))}
        {milestones.length > 4 && (
          <p className="text-[8px] md:text-[9px] dark:text-stone-500 text-stone-600 font-bold text-center">
            +{milestones.length - 4} <span className="hidden sm:inline">more</span>
          </p>
        )}
      </div>
    </div>
  );
}

export function DroppableCalendarDay({
  day,
  isCurrentMonth,
  isSelected,
  isTodayDay,
  dayMilestones,
  onClick,
}: {
  day: Date;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isTodayDay: boolean;
  dayMilestones: any[];
  onClick: () => void;
  key?: React.Key;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: format(day, "yyyy-MM-dd"),
  });

  const hasMilestones = dayMilestones.length > 0;
  const allDone = hasMilestones && dayMilestones.every((m) => m.done);

  return (
    <motion.button
      ref={setNodeRef}
      key={day.toString()}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "aspect-square relative flex flex-col items-center justify-center rounded-xl transition-all duration-200 group",
        !isCurrentMonth && "opacity-20",
        isSelected
          ? "bg-orange-500 text-[#431407] btn-extruded shadow-lg shadow-orange-500/20"
          : "hover:dark:bg-white/5 bg-stone-100 dark:text-stone-400 dark:text-stone-500 text-stone-600",
        isTodayDay &&
          !isSelected &&
          "border border-orange-500/30 text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)]",
        isOver &&
          "ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-[#242422] ring-offset-white z-10",
      )}
    >
      <span
        className={cn(
          "text-sm font-bold",
          isSelected
            ? "text-[#431407]"
            : "group-hover:dark:text-white text-stone-900",
        )}
      >
        {format(day, "d")}
      </span>
      {hasMilestones && (
        <div
          className={cn(
            "absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold shadow-sm",
            isSelected
              ? "bg-[#431407] text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)]"
              : allDone
                ? "bg-orange-500/20 text-orange-500 drop-shadow-[0_0_8px_rgba(255,87,34,0.6)] border border-orange-500/20"
                : "dark:bg-stone-800 bg-stone-200 dark:text-stone-200 text-stone-700 border dark:border-white/10 border-stone-300",
          )}
        >
          {dayMilestones.length}
        </div>
      )}
    </motion.button>
  );
}
