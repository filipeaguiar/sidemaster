import { defineEventHandler, createError } from 'h3';
import { Decklist } from '@/types/decklists'


export default defineEventHandler(async (event): Promise<Decklist> => {
  const guideId = event.context.params?.id;

  switch (guideId) {
    case '1': // Mockup para guide ID 1 (Affinity Pauper - JSON Detalhado)
      return {
        "id": 1,
        "player": "LuffyDoChapeuDePalha",
        "versão": "1.0",
        "release_date": "2024-07-27",
        "formato": "Pauper",
        "deck_archetype": "Affinity",
        "maindeck": [
          { "card": "Blood Fountain", "quantidade": 3 },
          { "card": "Cast Down", "quantidade": 1 },
          { "card": "Deadly Dispute", "quantidade": 4 },
          { "card": "Drossforge Bridge", "quantidade": 4 },
          { "card": "Galvanic Blast", "quantidade": 4 },
          { "card": "Great Furnace", "quantidade": 3 },
          { "card": "Hunter's Blowgun", "quantidade": 3 },
          { "card": "Ichor Wellspring", "quantidade": 4 },
          { "card": "Kenku Artificer", "quantidade": 1 },
          { "card": "Krark-Clan Shaman", "quantidade": 3 },
          { "card": "Makeshift Munitions", "quantidade": 1 },
          { "card": "Mistvault Bridge", "quantidade": 4 },
          { "card": "Myr Enforcer", "quantidade": 4 },
          { "card": "Nihil Spellbomb", "quantidade": 1 },
          { "card": "Reckoner's Bargain", "quantidade": 4 },
          { "card": "Refurbished Familiar", "quantidade": 4 },
          { "card": "Seat of the Synod", "quantidade": 3 },
          { "card": "Silverbluff Bridge", "quantidade": 2 },
          { "card": "Swamp", "quantidade": 1 },
          { "card": "Thoughtcast", "quantidade": 3 },
          { "card": "Vault of Whispers", "quantidade": 3 }
        ],
        "sideboard": [
          { "card": "Blue Elemental Blast", "quantidade": 3 },
          { "card": "Breath Weapon", "quantidade": 2 },
          { "card": "Cast Down", "quantidade": 2 },
          { "card": "Hydroblast", "quantidade": 2 },
          { "card": "Krark-Clan Shaman", "quantidade": 1 },
          { "card": "Pyroblast", "quantidade": 2 },
          { "card": "Red Elemental Blast", "quantidade": 3 }
        ],
        "estrategias": [
          {
            "deck_oponente": "Mono Red Aggro",
            "estrategia_geral": "Foque em sobreviver aos primeiros turnos e estabilizar o jogo. Bloqueie as criaturas agressivas, use remoções eficientes e tente ganhar o controle do tabuleiro no mid-game.",
            "side_in": [
              { "card": "Hydroblast", "quantidade": 2, "motivo": "Anula mágicas vermelhas importantes e remove criaturas vermelhas ameaçadoras." },
              { "card": "Blue Elemental Blast", "quantidade": 3, "motivo": "Similar ao Hydroblast, para mais anulações e remoções contra vermelho." },
              { "card": "Krark-Clan Shaman", "quantidade": 1, "motivo": "Pode limpar o tabuleiro de criaturas pequenas vermelhas, especialmente se o oponente espalhar muito o jogo." }
            ],
            "side_out": [
              { "card": "Kenku Artificer", "quantidade": 1, "motivo": "Pode ser muito lento e frágil contra decks agressivos." },
              { "card": "Makeshift Munitions", "quantidade": 1, "motivo": "Remoção condicional e pode ser lenta contra agressão rápida." },
              { "card": "Thoughtcast", "quantidade": 1, "motivo": "Comprar cartas é menos prioritário do que interagir e sobreviver contra agressão." }
            ]
          },
          {
            "deck_oponente": "Azorius Control",
            "estrategia_geral": "Jogue de forma mais paciente e tente forçar o oponente a usar seus recursos de anulação. Use Thoughtcast para vantagem de cartas e procure janelas para baixar ameaças.",
            "side_in": [
              { "card": "Nihil Spellbomb", "quantidade": 1, "motivo": "Útil contra estratégias de reanimação ou cemitério que Azorius Control possa usar." },
              { "card": "Cast Down", "quantidade": 1, "motivo": "Remoção adicional contra possíveis planeswalkers ou criaturas que o controle possa colocar em jogo no late game." }
            ],
            "side_out": [
              { "card": "Krark-Clan Shaman", "quantidade": 1, "motivo": "Ineficaz contra a ausência de criaturas pequenas em Azorius Control." },
              { "card": "Hunter's Blowgun", "quantidade": 1, "motivo": "Muito lento e ineficaz contra decks de controle." }
            ]
          },
          {
            "deck_oponente": "Dimir Delver",
            "estrategia_geral": "Este matchup pode ser uma corrida. Tente ser mais rápido e eficiente. Desvie de anulações iniciais e ataque com seus Myr Enforcers e Frogmites.",
            "side_in": [
              { "card": "Pyroblast", "quantidade": 2, "motivo": "Anula mágicas azuis e remove Delvers ou outras ameaças azuis do oponente." },
              { "card": "Red Elemental Blast", "quantidade": 3, "motivo": "Similar ao Pyroblast, para mais interação contra azul." },
              { "card": "Electrickery", "quantidade": 3, "motivo": "Pode limpar o tabuleiro de Delvers e outras criaturas pequenas de Dimir Delver." }
            ],
            "side_out": [
              { "card": "Makeshift Munitions", "quantidade": 1, "motivo": "Remoção condicional, pode ser muito lenta na corrida contra Delver." },
              { "card": "Thoughtcast", "quantidade": 2, "motivo": "Menos focado em vantagem de cartas e mais em interação direta e velocidade." }
            ]
          }
        ],
        "descricao": "Este é um exemplo de guia de sideboard detalhado para Affinity Pauper. As estratégias e o sideboard podem variar dependendo do metagame específico e das escolhas do jogador profissional."
      };
    case '2': // Mockup para guide ID 2 (Outro deck - Exemplo Simplificado)
      return {
        "id": 2,
        "player": "Jogador Exemplo 2",
        "versão": "1.0",
        "release_date": "2024-07-20",
        "formato": "Standard",
        "deck_archetype": "Mono Red Aggro (Exemplo)",
        "maindeck": [
          { "card": "Mountain", "quantidade": 20 },
          { "card": "Wizard's Lightning", "quantidade": 4 },
          { "card": "Shock", "quantidade": 4 }
        ],
        "sideboard": [
          { "card": "Rending Volley", "quantidade": 3 }
        ],
        "estrategias": [], // Sem estratégias detalhadas para este exemplo mais simples
        "descricao": "Este é um exemplo de decklist Mono Red Aggro para o guia com ID 2 (exemplo mais simples, sem estratégias detalhadas)."
      };
    default: // Mockup para qualquer outro ID (Guia não encontrado)
      throw createError({
        statusCode: 404,
        statusMessage: `Guia com ID ${guideId} não encontrado.`
      });
  }
});
