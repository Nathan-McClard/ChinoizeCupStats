"use client";

import { useState, useRef, useEffect } from "react";
import { Info, X } from "lucide-react";

const WEIGHTS = [
  { label: "Win Rate", pct: 40, color: "var(--success)" },
  { label: "Top 4 Rate", pct: 30, color: "var(--primary)" },
  { label: "Tournament Wins", pct: 20, color: "var(--warning)" },
  { label: "Play Rate", pct: 10, color: "var(--error)" },
];

export function RankingInfo() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
        aria-label="How rankings work"
      >
        <Info className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 rounded-xl bg-popover border border-border shadow-xl shadow-black/[0.08] dark:shadow-black/[0.3] p-4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Composite Score
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Leaders with 5+ entries are ranked by a weighted score from 0 to 1.
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {WEIGHTS.map((w) => (
              <div key={w.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground font-medium">
                    {w.label}
                  </span>
                  <span className="text-xs font-bold font-data text-foreground">
                    {w.pct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${w.pct}%`,
                      backgroundColor: w.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
