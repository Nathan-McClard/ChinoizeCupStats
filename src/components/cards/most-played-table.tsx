"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CardData {
  cardName: string;
  cardSet: string;
  cardNumber: string;
  cardType: string;
  cardId: string;
  totalDecks: number;
  avgCopies: number;
  totalCopies: number;
}

interface MostPlayedTableProps {
  cards: CardData[];
}

const TYPE_STYLES: Record<string, string> = {
  Character: "bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30",
  Event: "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30",
  Stage: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
};

function getTypeBadgeClass(cardType: string): string {
  return TYPE_STYLES[cardType] ?? "bg-slate-500/20 text-slate-600 dark:text-slate-300 border-slate-500/30";
}

export function MostPlayedTable({ cards }: MostPlayedTableProps) {
  return (
    <GlassCard
      className="p-0 overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="p-5 pb-3 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">
          Most Played Cards
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Top {cards.length} cards by deck inclusion
        </p>
      </div>

      <div className="overflow-auto max-h-[600px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 w-10">
                #
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">
                Card Name
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">
                Set-Number
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">
                Type
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground px-3 py-3">
                Decks
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground px-3 py-3">
                Avg Copies
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                Total Copies
              </th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card, index) => (
              <tr
                key={`${card.cardSet}-${card.cardNumber}-${index}`}
                className={cn(
                  "border-b border-border transition-colors duration-150",
                  "hover:bg-black/[0.03] dark:hover:bg-white/[0.04]",
                  index % 2 === 0 ? "bg-black/[0.01] dark:bg-white/[0.01]" : "bg-transparent"
                )}
              >
                <td className="px-5 py-2.5 text-muted-foreground font-data text-xs">
                  {index + 1}
                </td>
                <td className="px-3 py-2.5 font-semibold text-foreground">
                  {card.cardName}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground font-data text-xs">
                  {card.cardSet}-{card.cardNumber}
                </td>
                <td className="px-3 py-2.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-2 py-0.5 border",
                      getTypeBadgeClass(card.cardType)
                    )}
                  >
                    {card.cardType}
                  </Badge>
                </td>
                <td className="px-3 py-2.5 text-right text-foreground tabular-nums">
                  {card.totalDecks.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right text-foreground tabular-nums">
                  {Number(card.avgCopies).toFixed(1)}
                </td>
                <td className="px-5 py-2.5 text-right text-foreground tabular-nums">
                  {card.totalCopies.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
