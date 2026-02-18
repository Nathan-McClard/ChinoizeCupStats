export interface LimitlessTournament {
  id: string;
  name: string;
  game: string;
  date: string;
  players: number;
  format: string | null;
  organizerId?: number;
}

export interface Standing {
  name: string;
  player: string;
  country?: string;
  placing: number | null;
  record: {
    wins: number;
    losses: number;
    ties: number;
  };
  drop?: number;
  deck?: {
    id: string;
    name: string;
  };
  decklist?: {
    leader?: {
      name: string;
      set: string;
      number: string;
    };
    character?: DeckCard[];
    event?: DeckCard[];
    stage?: DeckCard[];
  };
}

export interface DeckCard {
  name: string;
  set: string;
  number: string;
  count: number;
}

export interface Pairing {
  round: number;
  phase: number;
  table: number;
  player1: string;
  player2: string;
  winner?: string;
}
