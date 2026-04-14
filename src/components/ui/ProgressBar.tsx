import React from "react";

export function ProgressBar({
  progress,
  color,
  className = "",
}: {
  progress: number;
  color: string;
  className?: string;
}) {
  return (
    <div className={`h-5 rounded-full bg-white/10 relative overflow-hidden ${className}`}>
      <div
        className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
        style={{ width: `${progress}%`, backgroundColor: color }}
      />
    </div>
  );
}
