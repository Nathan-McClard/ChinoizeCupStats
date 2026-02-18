"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Layers, Trophy, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { getLeaderImageUrl } from "@/components/ui/leader-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DeckCard {
  cardType: string;
  cardName: string;
  cardSet: string;
  cardNumber: string;
  count: number;
}

interface DecklistEntryWithCards {
  tournamentId: string;
  tournamentName: string;
  tournamentDate: string;
  player: string;
  displayName: string;
  placing: number | null;
  wins: number;
  losses: number;
  ties: number;
  cards: DeckCard[];
}

interface FormatOption {
  setCode: string;
  displayName: string;
  tournamentIds: string[];
}

interface BestDecklistsProps {
  decklists: DecklistEntryWithCards[];
  deckId: string;
  formats?: FormatOption[];
  currentFormatCode?: string;
}

const MAX_DISPLAYED = 5;

function getPlacingColor(placing: number): string {
  if (placing === 1) return "text-warning";
  if (placing === 2) return "text-[var(--silver)]";
  if (placing === 3) return "text-[var(--bronze)]";
  return "text-muted-foreground";
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMM d");
  } catch {
    return dateStr;
  }
}

const blurIn = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function CardGrid({ cards }: { cards: DeckCard[] }) {
  const mainCards = cards.filter(
    (c) => c.cardType !== "Leader" && c.cardType !== "DON!!",
  );

  if (mainCards.length === 0) return null;

  return (
    <div className="grid grid-cols-8 gap-1">
      {mainCards.map((card) => (
        <div
          key={`${card.cardSet}-${card.cardNumber}`}
          className="relative aspect-[5/7] rounded-md overflow-hidden bg-black/[0.06] dark:bg-white/[0.06]"
        >
          <Image
            src={getLeaderImageUrl(card.cardSet, card.cardNumber)}
            alt={card.cardName}
            fill
            className="object-cover"
            sizes="60px"
            unoptimized
          />
          <div className="absolute -top-0.5 -right-0.5 z-10 flex items-center justify-center w-4 h-4 rounded-full bg-primary text-[8px] font-bold text-white ring-1 ring-[var(--card)]">
            {card.count}
          </div>
        </div>
      ))}
    </div>
  );
}

export function BestDecklists({
  decklists,
  deckId,
  formats = [],
  currentFormatCode = "",
}: BestDecklistsProps) {
  const [selectedFormat, setSelectedFormat] = useState(
    currentFormatCode || "all",
  );

  const filteredDecklists = useMemo(() => {
    if (selectedFormat === "all") return decklists;
    const fmt = formats.find((f) => f.setCode === selectedFormat);
    if (!fmt) return decklists;
    const ids = new Set(fmt.tournamentIds);
    return decklists.filter((d) => ids.has(d.tournamentId));
  }, [decklists, selectedFormat, formats]);

  const displayed = filteredDecklists.slice(0, MAX_DISPLAYED);
  const hasMore = filteredDecklists.length > MAX_DISPLAYED;

  const formatLabel = useMemo(() => {
    if (selectedFormat === "all") return "All Time";
    const fmt = formats.find((f) => f.setCode === selectedFormat);
    if (!fmt) return "All Time";
    if (selectedFormat === currentFormatCode)
      return `${fmt.displayName} (Current)`;
    return fmt.displayName;
  }, [selectedFormat, formats, currentFormatCode]);

  const hasFormats = formats.length > 0;

  const viewAllHref = useMemo(() => {
    const base = `/decklists?deckId=${encodeURIComponent(deckId)}`;
    if (selectedFormat !== "all") {
      return `${base}&format=${selectedFormat}`;
    }
    return `${base}&format=all`;
  }, [deckId, selectedFormat]);

  const formatSelector = hasFormats ? (
    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
      <SelectTrigger
        size="sm"
        className="bg-black/[0.03] dark:bg-white/[0.03] border-border h-7 text-xs"
      >
        <SelectValue placeholder={formatLabel}>{formatLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-popover border-border">
        <SelectItem value="all">All Time</SelectItem>
        <SelectSeparator />
        {formats
          .filter((f) => f.setCode === currentFormatCode)
          .map((f) => (
            <SelectItem key={f.setCode} value={f.setCode}>
              {f.displayName} (Current)
            </SelectItem>
          ))}
        {formats
          .filter((f) => f.setCode !== currentFormatCode)
          .map((f) => (
            <SelectItem key={f.setCode} value={f.setCode}>
              {f.displayName}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  ) : null;

  if (decklists.length === 0) {
    return (
      <motion.div
        variants={blurIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="relative overflow-hidden rounded-2xl bg-card border border-border p-6"
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--accent-line), transparent)",
          }}
        />
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Decklists</h3>
          <div className="ml-auto">{formatSelector}</div>
        </div>
        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
          No decklists available
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={blurIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="relative overflow-hidden rounded-2xl bg-card border border-border p-6"
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--accent-line), transparent)",
        }}
      />
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Decklists</h3>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">
            {filteredDecklists.length} result
            {filteredDecklists.length !== 1 ? "s" : ""}
          </span>
          {formatSelector}
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
          No decklists in this format
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((entry) => (
            <Link
              key={`${entry.tournamentId}-${entry.player}`}
              href={`/decklists/${encodeURIComponent(entry.tournamentId)}/${encodeURIComponent(entry.player)}`}
              className="block rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors group"
            >
              {/* Header: Placing + Name + Record */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-sm font-bold font-data shrink-0 ${getPlacingColor(entry.placing ?? 999)}`}
                >
                  {entry.placing === 1 && (
                    <Trophy className="w-3.5 h-3.5 inline mr-0.5 -mt-0.5" />
                  )}
                  {entry.placing != null ? ordinal(entry.placing) : "\u2014"}
                </span>
                <span className="text-sm font-medium text-foreground truncate min-w-0 flex-1 group-hover:text-primary transition-colors">
                  {entry.displayName}
                </span>
                <span className="flex items-center gap-0.5 text-xs font-data shrink-0">
                  <span className="text-success">{entry.wins}</span>
                  <span className="text-muted-foreground/50">-</span>
                  <span className="text-error">{entry.losses}</span>
                  {entry.ties > 0 && (
                    <>
                      <span className="text-muted-foreground/50">-</span>
                      <span className="text-warning">{entry.ties}</span>
                    </>
                  )}
                </span>
              </div>

              {/* Full card grid */}
              <CardGrid cards={entry.cards} />

              {/* Tournament info */}
              <div className="mt-1.5 text-[11px] text-muted-foreground">
                {entry.tournamentName}{" "}
                <span className="text-muted-foreground/40">&middot;</span>{" "}
                {formatDate(entry.tournamentDate)}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* View All Decklists */}
      <div className="mt-4 pt-4 border-t border-border/40">
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View All Decklists
          <ArrowRight className="w-4 h-4" />
        </Link>
        {hasMore && (
          <span className="text-[11px] text-muted-foreground ml-2">
            {filteredDecklists.length - MAX_DISPLAYED} more
          </span>
        )}
      </div>
    </motion.div>
  );
}
