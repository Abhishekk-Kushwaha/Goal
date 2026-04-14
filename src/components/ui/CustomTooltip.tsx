import React from "react";

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="dark:bg-stone-900 bg-white border dark:border-white/10 border-stone-200 p-3 rounded-xl shadow-xl backdrop-blur-md">
        <p className="text-[9px] font-semibold tracking-widest uppercase uppercase tracking-wider dark:text-stone-500 text-stone-400 mb-1">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <p className="text-sm font-bold dark:text-white text-stone-900">
            {payload[0].value}{" "}
            {payload[0].value === 1 ? "Completion" : "Completions"}
          </p>
        </div>
      </div>
    );
  }
  return null;
};
