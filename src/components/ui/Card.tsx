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
      "dark:bg-[#2A2A28] bg-[#F5F5F3] border dark:border-[#3D3D3B] border-[#E5E5E3] rounded-2xl overflow-hidden shadow-[8px_8px_16px_#E6E6E4,-8px_-8px_16px_#FFFFFF] dark:shadow-[8px_8px_16px_#242422,-8px_-8px_16px_#30302E]",
      className,
    )}
  >
    {children}
  </motion.div>
);
