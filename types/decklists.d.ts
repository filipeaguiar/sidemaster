// types/guide/decklist.d.ts
export interface CardEntry {
  card_name: string;
  quantity: number;
  reason?: string;
}

export interface Decklist {
  id?: string;
  user_id: string;
  version: string;
  release_date: string;
  format: string;
  deck_archetype: string;
  maindeck: { card: string; quantity: number }[];
  sideboard: { card: string; quantity: number }[];
  strategies: Strategy[];
  description: string;
  decklist_input?: string;
}

export interface Strategy {
  opponent_deck_archetype: string;
  general_strategy: string;
  side_in: { card: string; quantity: number; reason?: string }[];
  side_out: { card: string; quantity: number; reason?: string }[];
}

