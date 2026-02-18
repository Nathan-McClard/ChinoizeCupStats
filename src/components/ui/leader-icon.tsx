"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { User } from "lucide-react";

interface LeaderIconProps {
  set: string;
  number: string;
  name?: string;
  size?: number;
  className?: string;
}

export function getLeaderImageUrl(set: string, number: string): string {
  // Limitless TCG CDN pattern for card images
  return `https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/${set}/${set}-${number}_EN.webp`;
}

/** Parse a deckId like "OP02-013" into {set, number} or null */
export function parseDeckId(deckId: string): { set: string; number: string } | null {
  const match = deckId.match(/^([A-Za-z]+\d+)-(\d+)$/);
  if (!match) return null;
  return { set: match[1], number: match[2] };
}

/** Get image URL from set+number OR by parsing a deckId as fallback */
export function getLeaderImageUrlFromData(
  leaderSet: string | null,
  leaderNumber: string | null,
  deckId?: string | null,
): string | undefined {
  if (leaderSet && leaderNumber) return getLeaderImageUrl(leaderSet, leaderNumber);
  if (deckId) {
    const parsed = parseDeckId(deckId);
    if (parsed) return getLeaderImageUrl(parsed.set, parsed.number);
  }
  return undefined;
}

export function LeaderIcon({
  set,
  number,
  name,
  size = 48,
  className,
}: LeaderIconProps) {
  const [error, setError] = useState(false);

  if (error || !set || !number) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-muted/50",
          className
        )}
        style={{ width: size, height: size }}
      >
        <User className="w-1/2 h-1/2 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden rounded-lg", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={getLeaderImageUrl(set, number)}
        alt={name || `${set}-${number}`}
        fill
        className="object-cover object-top"
        onError={() => setError(true)}
        unoptimized
      />
    </div>
  );
}
