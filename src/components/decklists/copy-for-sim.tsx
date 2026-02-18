"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyForSimProps {
  cards: Array<{
    cardType: string;
    cardSet: string;
    cardNumber: string;
    count: number;
  }>;
}

export function CopyForSim({ cards }: CopyForSimProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const lines = cards
      .filter((c) => c.cardType !== "Leader")
      .map((c) => `${c.count}x${c.cardSet}-${c.cardNumber}`);
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [cards]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
        "border border-border bg-black/[0.03] dark:bg-white/[0.03] hover:bg-black/[0.06] dark:hover:bg-white/[0.06]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        copied
          ? "text-success"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          Export to Sim
        </>
      )}
    </button>
  );
}
