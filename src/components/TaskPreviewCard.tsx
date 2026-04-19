import React from "react";
import { CalendarDays, CheckCircle2, Repeat2, Tag, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type TaskPreviewMeta = {
  label: string;
  value?: string | null;
  icon?: "calendar" | "repeat" | "status" | "tag";
};

type TaskPreviewCardProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  accentColor?: string;
  metadata?: TaskPreviewMeta[];
};

const iconMap = {
  calendar: CalendarDays,
  repeat: Repeat2,
  status: CheckCircle2,
  tag: Tag,
};

export function TaskPreviewCard({
  open,
  onClose,
  title,
  subtitle,
  accentColor = "#34d399",
  metadata = [],
}: TaskPreviewCardProps) {
  const visibleMetadata = metadata.filter((item) => item.value);

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-5 pt-20 sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close task preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/72 backdrop-blur-[10px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Task preview"
            initial={{ opacity: 0, y: 22, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[460px] overflow-hidden rounded-[18px] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(23,27,32,0.98),rgba(10,13,17,0.99))] p-4 text-white shadow-[0_28px_90px_-32px_rgba(0,0,0,1)] sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${accentColor}99, transparent)`,
              }}
            />
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full blur-3xl"
              style={{ backgroundColor: `${accentColor}18` }}
            />

            <div className="relative flex items-start gap-3">
              <div
                className="mt-1 h-3 w-3 shrink-0 rounded-[4px] shadow-[0_0_22px_currentColor]"
                style={{ color: accentColor, backgroundColor: accentColor }}
              />
              <div className="min-w-0 flex-1">
                {subtitle && (
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/38">
                    {subtitle}
                  </p>
                )}
                <h2 className="max-h-[42vh] overflow-y-auto pr-1 text-[18px] font-semibold leading-[1.35] tracking-[-0.01em] text-white/92 custom-scrollbar">
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.035] text-white/42 transition-colors hover:bg-white/[0.06] hover:text-white/78"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {visibleMetadata.length > 0 && (
              <div className="relative mt-5 grid gap-2">
                {visibleMetadata.map((item) => {
                  const Icon = item.icon ? iconMap[item.icon] : Tag;

                  return (
                    <div
                      key={`${item.label}-${item.value}`}
                      className="flex items-center gap-2 rounded-xl border border-white/[0.055] bg-white/[0.025] px-3 py-2"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-white/32" />
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">
                        {item.label}
                      </span>
                      <span
                        className={cn(
                          "min-w-0 flex-1 text-right text-[12px] font-medium text-white/68",
                          "overflow-hidden text-ellipsis whitespace-nowrap",
                        )}
                      >
                        {item.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
