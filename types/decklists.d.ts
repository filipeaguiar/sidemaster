// types/guide/decklist.d.ts
export interface CardEntry {
  card: string;
  quantidade: number;
  motivo?: string;
}

export interface Estrategia {
  deck_oponente: string;
  estrategia_geral: string;
  side_in: CardEntry[];
  side_out: CardEntry[];
}

export interface Decklist {
  id: number;
  user_id: string;
  versão: string;
  release_date: string;
  formato: string;
  deck_archetype: string;
  maindeck: CardEntry[];
  sideboard: CardEntry[];
  estrategias: Estrategia[];
  descricao: string;
}
