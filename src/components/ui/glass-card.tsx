"use client";

import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
  elevated?: boolean;
  glow?: "primary" | "accent" | "none";
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = false, elevated = false, glow = "none", children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          elevated ? "glass-elevated" : "glass",
          hover && "glass-hover cursor-pointer",
          glow === "primary" && "shadow-md shadow-black/30",
          glow === "accent" && "shadow-md shadow-black/30",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
