"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Search,
  RotateCcw,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";

interface DecklistFilterBarProps {
  leaders: Array<{ deckId: string; leaderName: string }>;
  tournaments: Array<{ id: string; name: string }>;
  currentFilters: {
    deckId?: string;
    tournamentId?: string;
    maxPlacing?: string;
    q?: string;
    sort: string;
  };
}

const placingOptions = [
  { value: "8", label: "Top 8" },
  { value: "16", label: "Top 16" },
  { value: "32", label: "Top 32" },
  { value: "64", label: "Top 64" },
];

const sortOptions = [
  { key: "placing", label: "Placing" },
  { key: "date", label: "Date" },
  { key: "winrate", label: "Win Rate" },
] as const;

export function DecklistFilterBar({
  leaders,
  tournaments,
  currentFilters,
}: DecklistFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(currentFilters.q ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync search input when URL changes externally (e.g. reset)
  useEffect(() => {
    setSearchValue(currentFilters.q ?? "");
  }, [currentFilters.q]);

  const buildUrl = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value && value !== "all") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      return `/decklists?${params.toString()}`;
    },
    [searchParams],
  );

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      router.push(buildUrl({ [key]: value }));
    },
    [router, buildUrl],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        router.push(buildUrl({ q: value || undefined }));
      }, 300);
    },
    [router, buildUrl],
  );

  const handleSort = useCallback(
    (key: string) => {
      if (currentFilters.sort === key) {
        // Already active — toggle off to default (placing)
        router.push(buildUrl({ sort: key === "placing" ? undefined : "placing" }));
      } else {
        router.push(buildUrl({ sort: key === "placing" ? undefined : key }));
      }
    },
    [router, buildUrl, currentFilters.sort],
  );

  const resetFilters = useCallback(() => {
    // Preserve only the format param when resetting
    const params = new URLSearchParams();
    const format = searchParams.get("format");
    if (format) params.set("format", format);
    const url = params.toString() ? `/decklists?${params.toString()}` : "/decklists";
    router.push(url);
  }, [router, searchParams]);

  const hasFilters =
    currentFilters.deckId ||
    currentFilters.tournamentId ||
    currentFilters.maxPlacing ||
    currentFilters.q;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Player search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search players..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-9 pl-8 pr-3 w-[180px] rounded-lg border border-border bg-black/[0.03] dark:bg-white/[0.03] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
        />
      </div>

      {/* Leader Filter */}
      <Select
        value={currentFilters.deckId || "all"}
        onValueChange={(value) => updateFilter("deckId", value)}
      >
        <SelectTrigger className="w-[180px] h-9 bg-black/[0.03] dark:bg-white/[0.03] border-border">
          <SelectValue placeholder="All Leaders" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border max-h-[300px]">
          <SelectItem value="all">All Leaders</SelectItem>
          {leaders.map((leader) => (
            <SelectItem key={leader.deckId} value={leader.deckId}>
              {leader.leaderName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Tournament Filter */}
      <Select
        value={currentFilters.tournamentId || "all"}
        onValueChange={(value) => updateFilter("tournamentId", value)}
      >
        <SelectTrigger className="w-[200px] h-9 bg-black/[0.03] dark:bg-white/[0.03] border-border">
          <SelectValue placeholder="All Tournaments" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border max-h-[300px]">
          <SelectItem value="all">All Tournaments</SelectItem>
          {tournaments.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Max Placing Filter */}
      <Select
        value={currentFilters.maxPlacing || "all"}
        onValueChange={(value) => updateFilter("maxPlacing", value)}
      >
        <SelectTrigger className="w-[130px] h-9 bg-black/[0.03] dark:bg-white/[0.03] border-border">
          <SelectValue placeholder="All Placings" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="all">All Placings</SelectItem>
          {placingOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort pills */}
      <div className="flex items-center gap-1 ml-auto">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mr-1 hidden sm:inline">
          Sort
        </span>
        {sortOptions.map((opt) => {
          const isActive = currentFilters.sort === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => handleSort(opt.key)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
              }`}
            >
              {opt.label}
              {isActive ? (
                <ArrowDown className="w-3 h-3" />
              ) : (
                <ArrowUpDown className="w-3 h-3 opacity-30" />
              )}
            </button>
          );
        })}
      </div>

      {/* Reset Button */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-muted-foreground hover:text-foreground h-9"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Reset
        </Button>
      )}
    </div>
  );
}
