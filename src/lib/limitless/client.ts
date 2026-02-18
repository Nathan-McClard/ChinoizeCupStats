import type {
  LimitlessTournament,
  Standing,
  Pairing,
} from "./types";

const LIMITLESS_HOST = "play.limitlesstcg.com";
const BASE_URL = process.env.LIMITLESS_API_BASE_URL || `https://${LIMITLESS_HOST}/api`;

async function fetchJson<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  // Ensure paths are joined correctly (strip leading slash, ensure base ends with /)
  const base = BASE_URL.endsWith("/") ? BASE_URL : BASE_URL + "/";
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(cleanPath, base);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });
  if (!res.ok)
    throw new Error(
      `Limitless API error: ${res.status} ${res.statusText} for ${path}`,
    );
  return res.json();
}

function delay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Get ChinoizeCup tournaments (organizerId 2339)
export async function getChinoizeTournaments(): Promise<
  LimitlessTournament[]
> {
  return fetchJson<LimitlessTournament[]>("/tournaments", {
    game: "OP",
    organizerId: "2339",
    limit: "500",
  });
}

export async function getTournamentStandings(
  id: string,
): Promise<Standing[]> {
  return fetchJson<Standing[]>(`/tournaments/${id}/standings`);
}

export async function getTournamentPairings(
  id: string,
): Promise<Pairing[]> {
  return fetchJson<Pairing[]>(`/tournaments/${id}/pairings`);
}

export { delay };
