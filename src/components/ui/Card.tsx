import React from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

export const Card = ({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  key?: React.Key;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={cn(
      "rounded-xl overflow-hidden border border-white/[0.06] bg-[linear-gradient(145deg,rgba(22,26,30,0.96),rgba(13,16,19,0.98))] shadow-[0_18px_48px_-38px_rgba(0,0,0,1)]",
      className,
    )}
  >
    {children}
  </motion.div>
);
