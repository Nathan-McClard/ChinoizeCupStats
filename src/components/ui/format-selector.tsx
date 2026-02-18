"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormatSelectorProps {
  formats: Array<{
    setCode: string;
    displayName: string;
    tournamentCount: number;
  }>;
  currentFormatCode: string;
  value: string;
}

export function FormatSelector({
  formats,
  currentFormatCode,
  value,
}: FormatSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (setCode: string) => {
      setOpen(false);
      const params = new URLSearchParams(searchParams.toString());
      if (setCode === currentFormatCode) {
        params.delete("format");
      } else {
        params.set("format", setCode);
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, currentFormatCode, searchParams],
  );

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Group formats into OP and EB
  const { opFormats, ebFormats } = useMemo(() => {
    const op: typeof formats = [];
    const eb: typeof formats = [];
    for (const f of formats) {
      if (f.setCode.startsWith("OP")) op.push(f);
      else if (f.setCode.startsWith("EB")) eb.push(f);
    }
    // Sort descending by number
    const byNum = (a: (typeof formats)[0], b: (typeof formats)[0]) => {
      const aNum = parseInt(a.setCode.replace(/\D/g, ""));
      const bNum = parseInt(b.setCode.replace(/\D/g, ""));
      return bNum - aNum;
    };
    op.sort(byNum);
    eb.sort(byNum);
    return { opFormats: op, ebFormats: eb };
  }, [formats]);

  // Display label
  const displayLabel = useMemo(() => {
    if (value === "all") return "All Time";
    const entry = formats.find((f) => f.setCode === value);
    if (!entry) return "Format";
    if (value === currentFormatCode)
      return `${entry.displayName} (Current)`;
    return entry.displayName;
  }, [value, formats, currentFormatCode]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
          "border border-border bg-black/[0.03] dark:bg-white/[0.03]",
          "hover:bg-black/[0.06] dark:hover:bg-white/[0.06]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          open && "ring-2 ring-primary/20",
        )}
      >
        <span className="text-foreground">{displayLabel}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-popover border border-border rounded-xl shadow-lg shadow-black/[0.08] dark:shadow-black/[0.3] p-3 min-w-[280px]">
          {/* OP Sets */}
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-0.5">
            OP Sets
          </p>
          <div className="grid grid-cols-3 gap-1 mb-3">
            {opFormats.map((f) => {
              const isSelected = f.setCode === value;
              const isCurrent = f.setCode === currentFormatCode;
              return (
                <button
                  key={f.setCode}
                  onClick={() => handleSelect(f.setCode)}
                  className={cn(
                    "px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer text-center",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    isSelected
                      ? "bg-primary/12 text-primary ring-1 ring-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
                  )}
                >
                  {f.displayName}
                  {isCurrent && !isSelected && (
                    <span className="ml-1 inline-block w-1 h-1 rounded-full bg-primary/50 align-middle" />
                  )}
                </button>
              );
            })}
          </div>

          {/* EB Sets */}
          {ebFormats.length > 0 && (
            <>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-0.5">
                EB Sets
              </p>
              <div className="grid grid-cols-3 gap-1 mb-3">
                {ebFormats.map((f) => {
                  const isSelected = f.setCode === value;
                  const isCurrent = f.setCode === currentFormatCode;
                  return (
                    <button
                      key={f.setCode}
                      onClick={() => handleSelect(f.setCode)}
                      className={cn(
                        "px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer text-center",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                        isSelected
                          ? "bg-primary/12 text-primary ring-1 ring-primary/25"
                          : "text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
                      )}
                    >
                      {f.displayName}
                      {isCurrent && !isSelected && (
                        <span className="ml-1 inline-block w-1 h-1 rounded-full bg-primary/50 align-middle" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Divider + All Time */}
          <div className="border-t border-border pt-2">
            <button
              onClick={() => handleSelect("all")}
              className={cn(
                "w-full px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer text-center",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                value === "all"
                  ? "bg-primary/12 text-primary ring-1 ring-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
              )}
            >
              All Time
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
