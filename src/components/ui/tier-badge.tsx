"use client";

import { cn } from "@/lib/utils";

const tierConfig = {
  S: {
    label: "S",
    className: "bg-tier-s/20 text-tier-s border-tier-s/30",
  },
  A: {
    label: "A",
    className: "bg-tier-a/20 text-tier-a border-tier-a/30",
  },
  B: {
    label: "B",
    className: "bg-tier-b/20 text-tier-b border-tier-b/30",
  },
  C: {
    label: "C",
    className: "bg-tier-c/20 text-tier-c border-tier-c/30",
  },
  U: {
    label: "U",
    className: "bg-tier-u/20 text-tier-u border-tier-u/30",
  },
} as const;

interface TierBadgeProps {
  tier: "S" | "A" | "B" | "C" | "U";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TierBadge({ tier, size = "md", className }: TierBadgeProps) {
  const config = tierConfig[tier];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-bold border rounded-md",
        config.className,
        size === "sm" && "text-xs px-1.5 py-0.5 min-w-[20px]",
        size === "md" && "text-sm px-2 py-0.5 min-w-[28px]",
        size === "lg" && "text-lg px-3 py-1 min-w-[36px]",
        className
      )}
    >
      {config.label}
    </span>
  );
}
