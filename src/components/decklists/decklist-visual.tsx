"use client";

import Image from "next/image";
import { useState } from "react";
import { getLeaderImageUrl } from "@/components/ui/leader-icon";

interface DeckCard {
  cardType: string;
  cardName: string;
  cardSet: string;
  cardNumber: string;
  count: number;
}

interface DecklistVisualProps {
  cards: DeckCard[];
  /** Compact mode uses smaller thumbnails — for inline/expandable use */
  compact?: boolean;
}

const CARD_TYPE_ORDER = ["Leader", "Character", "Event", "Stage", "DON!!"];

function groupCardsByType(cards: DeckCard[]): Record<string, DeckCard[]> {
  const groups: Record<string, DeckCard[]> = {};
  for (const card of cards) {
    const type = card.cardType || "Other";
    if (!groups[type]) groups[type] = [];
    groups[type].push(card);
  }
  const sorted: Record<string, DeckCard[]> = {};
  for (const type of CARD_TYPE_ORDER) {
    if (groups[type]) {
      sorted[type] = groups[type];
      delete groups[type];
    }
  }
  for (const [type, typeCards] of Object.entries(groups)) {
    sorted[type] = typeCards;
  }
  return sorted;
}

function CardImage({
  card,
  compact,
}: {
  card: DeckCard;
  compact?: boolean;
}) {
  const [error, setError] = useState(false);
  const imageUrl = getLeaderImageUrl(card.cardSet, card.cardNumber);

  return (
    <div className="relative group">
      <div
        className={`relative overflow-hidden bg-black/[0.06] dark:bg-white/[0.06] aspect-[5/7] ${
          compact ? "rounded-md" : "rounded-lg"
        }`}
      >
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-1.5 text-center">
            <span className="text-[9px] text-muted-foreground leading-tight truncate w-full">
              {card.cardName}
            </span>
            <span className="text-[8px] text-muted-foreground/60 mt-0.5">
              {card.cardSet}-{card.cardNumber}
            </span>
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={card.cardName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={compact ? "60px" : "120px"}
            onError={() => setError(true)}
            unoptimized
          />
        )}
      </div>

      {/* Quantity badge */}
      <div className={`absolute -top-1 -right-1 z-10 flex items-center justify-center rounded-full bg-primary font-extrabold text-white shadow-md shadow-primary/30 ring-2 ring-[var(--card)] ${
        compact ? "w-4.5 h-4.5 text-[9px]" : "w-6 h-6 text-[11px]"
      }`}>
        {card.count}
      </div>

      {/* Hover tooltip */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="bg-black/80 backdrop-blur-sm rounded-b-lg px-1.5 py-1">
          <p className="text-[9px] text-white leading-tight truncate">
            {card.cardName}
          </p>
          <p className="text-[8px] text-white/60">
            {card.cardSet}-{card.cardNumber} &middot; &times;{card.count}
          </p>
        </div>
      </div>
    </div>
  );
}

export function DecklistVisual({ cards, compact = false }: DecklistVisualProps) {
  const grouped = groupCardsByType(cards);
  const totalCards = cards
    .filter((c) => c.cardType !== "Leader")
    .reduce((sum, c) => sum + c.count, 0);
  if (cards.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        No decklist data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="text-xs text-muted-foreground">
          {totalCards} cards
        </div>
      )}

      {Object.entries(grouped).map(([type, typeCards]) => {
        const typeTotal = typeCards.reduce((s, c) => s + c.count, 0);

        return (
          <div key={type}>
            {/* Section header */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`${compact ? "text-[10px]" : "text-xs"} font-semibold text-primary uppercase tracking-wider`}>
                {type}
              </span>
              <span className={`${compact ? "text-[9px]" : "text-[11px]"} text-muted-foreground`}>
                {typeTotal}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Card grid */}
            <div
              className={`grid ${
                compact
                  ? "grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1"
                  : "grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1.5"
              }`}
            >
              {typeCards.map((card) => (
                <CardImage
                  key={`${card.cardSet}-${card.cardNumber}`}
                  card={card}
                  compact={compact}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
