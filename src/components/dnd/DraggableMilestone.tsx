import React from "react";
import { GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Milestone } from "../../storage";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function DraggableMilestone({
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
        "p-2 md:p-3 rounded-xl border dark:border-white/5 border-stone-200 dark:bg-white/[0.02] bg-stone-50 cursor-grab active:cursor-grabbing hover:dark:border-white/10 hover:border-stone-300 transition-colors mb-2 touch-none",
        isDragging && "border-orange-500/50 bg-orange-500/5 z-50",
      )}
    >
      <div className="flex items-center gap-1 md:gap-2">
        <GripVertical className="w-3 h-3 dark:text-stone-500 text-stone-600" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] md:text-[10px] font-semibold tracking-widest uppercase dark:text-white text-stone-900 truncate">
            {milestone.title}
          </p>
          <p className="text-[8px] md:text-[10px] dark:text-stone-500 text-stone-600 truncate">
            {goalTitle}
          </p>
        </div>
      </div>
    </div>
  );
}
