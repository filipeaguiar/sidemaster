import { defineEventHandler, createError } from 'h3';
import { Decklist } from '@/types/decklists'


export default defineEventHandler(async (event): Promise<Decklist> => {
  const guideId = event.context.params?.id;

  switch (guideId) {
    case '1': // Mockup para guide ID 1 (Affinity Pauper - JSON Detalhado)
      return {
        "id": 1,
        "user_id": "LuffyDoChapeuDePalha",
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
        "descricao": "Grixis Affinity é um deck midrange que se adapta facilmente ao meta atual, graças ao seu acesso a três cores, que oferecem anulações em azul, compra de cartas e remoção em preto, e boardwipes eficientes mesa em vermelho. Para jogar bem com Grixis Affinity, é crucial identificar o papel de \"beatdown\" na partida, pois sua abordagem varia dependendo do deck do oponente. Por exemplo, contra Burn, priorize mãos com mais remoções e boardwipes, enquanto contra decks de Control, busque mãos com mais compra de cartas ou criaturas de baixo custo que permitam aplicar pressão cedo. Atualmente, o deck se destaca como uma boa escolha para o meta, especialmente devido ao aumento de decks de Walls e Kuldotha Burn, onde sua capacidade de compra de cartas frequentemente proporciona uma vantagem. \n<p> É crucial saber quando fazer mulligan com o deck. Embora muitos considerem isso uma questão de sorte, existe uma lógica por trás das mãos que decido manter. Com um total de 19 terrenos no deck, a probabilidade de comprar uma terreno a cada três compras é um cálculo fácil. Portanto, ao decidir manter uma mão, avalio se posso me dar ao luxo de perder um turno, se posso jogar com uma terreno a mais e se tenho meios de cavar mais fundo no meu deck. Se as respostas forem sim, mantenho a mão. \n<p> Graças ao advento do [[Refurbished Familiar]], Affinity adquiriu uma postura nova e mais agressiva, já que agora temos consistência no número de criaturas artefato, o que irei detalhar mais no Guia de Sideboard.\n<p>Para quem pergunta, sempre digo que Grixis pode lidar com quase tudo, desde que a lista esteja adaptada aos decks esperados. No entanto, às vezes não vale a pena fazer ajustes específicos, já que o número de cartas dedicadas pode não justificar a perda contra outros decks. Nesses casos, é necessário escolher com cuidado onde alocar os recursos disponíveis.\n<p>Foi com essa lista que alcancei meu último top 1 no Pauper Challenger, para um meta onde esperava enfrentar: Burn, Rakdos Burn, Affinity, Ponza, Walls e BG/R Bloodscale. Quanto à lista: Algumas pessoas testaram o [[Sneaky Snacker]] em Affinity. Eu também testei e, honestamente, não gostei, porque o fato de exigir pagamento de mana na primeira vez que jogamos prejudica demais o plano de jogo de Grixis Affinity. Por isso, optei por usar o [[Frogmite]], que é uma excelente criatura contra Burn. Estou usando o [[Candy Trail]] porque a vida que ele dá e o scrying ajudam muito na consistência do deck. Fora isso, acredito que não há mais cartas incomuns no deck. E com o advento do [[Refurbished Familiar]], Grixis Affinity adquiriu uma postura mais agressiva, beneficiando ainda mais as listas com [[Frogmite]].\n"
      };
    case '2': // Mockup para guide ID 2 (Outro deck - Exemplo Simplificado)
      return {
        "id": 2,
        "user_id": "Jogador Exemplo 2",
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
    case '3':
      return {
        "user_id": "LuffyDoChapeuDePalha",
        "id": 3,
        "versão": "1.0",
        "release_date": "Desconhecido",
        "formato": "Pauper",
        "deck_archetype": "Grixis Affinity",
        "maindeck": [
          {
            "card": "Blood Fountain",
            "quantidade": 3
          },
          {
            "card": "Nihil Spellbomb",
            "quantidade": 2
          },
          {
            "card": "Candy Trail",
            "quantidade": 2
          },
          {
            "card": "Ichor Wellspring",
            "quantidade": 4
          },
          {
            "card": "Makeshift Munitions",
            "quantidade": 1
          },
          {
            "card": "Galvanic Blast",
            "quantidade": 4
          },
          {
            "card": "Cast Down",
            "quantidade": 2
          },
          {
            "card": "Thoughtcast",
            "quantidade": 2
          },
          {
            "card": "Deadly Dispute",
            "quantidade": 4
          },
          {
            "card": "Reckoner’s Bargain",
            "quantidade": 4
          },
          {
            "card": "Krark-Clan Shaman",
            "quantidade": 2
          },
          {
            "card": "Kenku Artificer",
            "quantidade": 1
          },
          {
            "card": "Frogmite",
            "quantidade": 2
          },
          {
            "card": "Refurbished Familiar",
            "quantidade": 4
          },
          {
            "card": "Myr Enforcer",
            "quantidade": 4
          },
          {
            "card": "Seat of the Synod",
            "quantidade": 3
          },
          {
            "card": "Swamp",
            "quantidade": 1
          },
          {
            "card": "Vault of Whispers",
            "quantidade": 3
          },
          {
            "card": "Great Furnace",
            "quantidade": 2
          },
          {
            "card": "Silverbluff Bridge",
            "quantidade": 3
          },
          {
            "card": "Drossforge Bridge",
            "quantidade": 3
          },
          {
            "card": "Mistvault Bridge",
            "quantidade": 4
          }
        ],
        "sideboard": [
          {
            "card": "Blue Elemental Blast",
            "quantidade": 4
          },
          {
            "card": "Hydroblast",
            "quantidade": 1
          },
          {
            "card": "Breath Weapon",
            "quantidade": 1
          },
          {
            "card": "Extract a Confession",
            "quantidade": 1
          },
          {
            "card": "Krark-Clan Shaman",
            "quantidade": 1
          },
          {
            "card": "Cast Down",
            "quantidade": 1
          },
          {
            "card": "Turn Aside",
            "quantidade": 2
          },
          {
            "card": "Gorilla Shaman",
            "quantidade": 4
          }
        ],
        "descricao": "Grixis Affinity é um deck midrange que se adapta facilmente ao meta atual, graças ao seu acesso a três cores, que oferecem anulações em azul, compra de cartas e remoção em preto, e boardwipes eficientes mesa em vermelho. Para jogar bem com Grixis Affinity, é crucial identificar o papel de \"beatdown\" na partida, pois sua abordagem varia dependendo do deck do oponente. Por exemplo, contra Burn, priorize mãos com mais remoções e boardwipes, enquanto contra decks de Control, busque mãos com mais compra de cartas ou criaturas de baixo custo que permitam aplicar pressão cedo. Atualmente, o deck se destaca como uma boa escolha para o meta, especialmente devido ao aumento de decks de Walls e Kuldotha Burn, onde sua capacidade de compra de cartas frequentemente proporciona uma vantagem. \n É crucial saber quando fazer mulligan com o deck. Embora muitos considerem isso uma questão de sorte, existe uma lógica por trás das mãos que decido manter. Com um total de 19 terrenos no deck, a probabilidade de comprar uma terreno a cada três compras é um cálculo fácil. Portanto, ao decidir manter uma mão, avalio se posso me dar ao luxo de perder um turno, se posso jogar com uma terreno a mais e se tenho meios de cavar mais fundo no meu deck. Se as respostas forem sim, mantenho a mão. \n<p> Graças ao advento do [[Refurbished Familiar]], Affinity adquiriu uma postura nova e mais agressiva, já que agora temos consistência no número de criaturas artefato, o que irei detalhar mais no Guia de Sideboard.\n<p>Para quem pergunta, sempre digo que Grixis pode lidar com quase tudo, desde que a lista esteja adaptada aos decks esperados. No entanto, às vezes não vale a pena fazer ajustes específicos, já que o número de cartas dedicadas pode não justificar a perda contra outros decks. Nesses casos, é necessário escolher com cuidado onde alocar os recursos disponíveis.\n<p>Foi com essa lista que alcancei meu último top 1 no Pauper Challenger, para um meta onde esperava enfrentar: Burn, Rakdos Burn, Affinity, Ponza, Walls e BG/R Bloodscale. Quanto à lista: Algumas pessoas testaram o [[Sneaky Snacker]] em Affinity. Eu também testei e, honestamente, não gostei, porque o fato de exigir pagamento de mana na primeira vez que jogamos prejudica demais o plano de jogo de Grixis Affinity. Por isso, optei por usar o [[Frogmite]], que é uma excelente criatura contra Burn. Estou usando o [[Candy Trail]] porque a vida que ele dá e o scrying ajudam muito na consistência do deck. Fora isso, acredito que não há mais cartas incomuns no deck. E com o advento do [[Refurbished Familiar]], Grixis Affinity adquiriu uma postura mais agressiva, beneficiando ainda mais as listas com [[Frogmite]].",
        "estrategias": [
          {
            "deck_oponente": "UB Faeries",
            "estrategia_geral": "Nestes matchups, precisamos estar atentos a três cartas: [[Thorn of the Black Rose]], [[Murmuring Mystic]] e [[Spellstutter Sprite]]. Vou discutir a estratégia para combater cada carta individualmente.\n\n[[Thorn of the black rose]]: Seu oponente provavelmente tentará conjurar [[Thorn Of The Black Rose]] o mais cedo possível para acompanhar a vantagem de cartas. É por isso que sempre opto por manter o máximo de criaturas possível na mão para que, uma vez que eles conjurem [[Thorn Of The Black Rose]], você possa mobilizar várias criaturas de volta e tornar muito difícil para o oponente lidar com todas elas.\n\n[[Murmuring Mystic]]: Bem, esta é uma carta que não podemos deixar viver porque a quantidade de valor que ela gera é abusiva contra nosso deck, que luta para lidar com várias criaturas voadoras. Então, sempre que seu oponente tentar conjurá-la, não importa o que você faça, não os deixe desvirar com [[Murmuring Mystic]] ainda na mesa. Use cartas como [[Cast Down]] para lidar com ela ou force uma troca 2 por 1.\n\n[[Spellstutter Sprite]]: Acho que quase todos que já tiveram um [[Spellstutter Sprite]] anulando uma magia sabem o quão forte esta carta é, então recomendo sempre conjurar feitiços com alguma forma de lidar com ela. Porque se seu oponente conjurar um [[Spellstutter Sprite]] e depois devolvê-lo com um [[Ninja Of The Deep Hours]], as coisas ficarão bem complicadas para Grixis.\n\nNo entanto, ainda considero este matchup muito bom porque se seguirmos o plano básico de artefatos e compra de cartas, provavelmente venceremos este matchup. Além disso, [[Blood Fountain]] pode ser bastante útil ao retornar criaturas do cemitério. [[Makeshift Munitions]] é a carta mais forte no match; geralmente, se resolvida cedo sem resposta, tende a ganhar o jogo por conta própria, pois pode remover todas as fadas no campo de batalha.",
            "side_in": [
              {
                "card": "Turn Aside",
                "quantidade": 1,

              },
              {
                "card": "Cast Down",
                "quantidade": 1,

              }
            ],
            "side_out": [
              {
                "card": "Krark-Clan Shaman",
                "quantidade": 2,
                "motivo": "A razão para remover Krark-Clan Shaman é bastante óbvia: as criaturas do seu oponente são principalmente voadoras, e aquelas que não são têm resistência alta demais para tornar a perda de recursos valer a pena."
              }
            ]
          },
          {
            "deck_oponente": "UB Terror",
            "estrategia_geral": "Neste matchup, escolho remover 1 Galvanic Blast porque as criaturas do oponente têm todas resistência maior que 4. [[Makeshift Munitions]] não é muito útil neste confronto, pois não há alvos adequados para ele. Como o deck de Faeries, é um deck que não é mais muito jogado, então não aloquei muitos slots para ele.\n\nPortanto, acredito que este matchup é 50-50, mas pode melhorar significativamente com a adição de Red Elemental Blast.\n\nNesta partida, é crucial ganhar tempo. Portanto, o mais importante é não perder nenhum drop de terreno nos primeiros turnos e eliminar todas as criaturas 5/5 do seu oponente. O que costumo fazer é tentar jogar artefatos de baixo custo o mais rápido possível para que depois eu possa me concentrar em comprar cartas. Seu oponente só terá Counterspell para lidar com suas compras e criaturas iniciais. Vale ressaltar que, ao contrário do UB Faeries, o UB Terror usa Spell Pierce, por isso é importante estar atento a esta carta para evitar que ela se torne útil no meio ou final do jogo. Além disso, algumas listas usam uma cópia de Murmuring Mystic e, se isso acontecer, a abordagem é a mesma de UB Faeries (remova-a o mais rápido possível). No entanto, este match é ligeiramente favorável para esta versão de Grixis Affinity.",
            "side_in": [
              {
                "card": "Cast Down",
                "quantidade": 1,

              },
              {
                "card": "Extract a Confession",
                "quantidade": 1,

              }
            ],
            "side_out": [
              {
                "card": "Galvanic Blast",
                "quantidade": 1,
                "motivo": "porque as criaturas do oponente têm todas resistência maior que 4."
              },
              {
                "card": "Makeshift Munitions",
                "quantidade": 1,
                "motivo": "não é muito útil neste confronto, pois não há alvos adequados para ele."
              }
            ]
          },
          {
            "deck_oponente": "UB Control",
            "estrategia_geral": "O sideboard é quase idêntico ao UB Terror, o que significa que [[Makeshift Munitions]] e Krark-Clan Shaman são removidos porque não temos muitos alvos. Contra este deck, trata-se de jogar em torno de Murmuring Mystic e Thorn of the Black Rose. Portanto, é a mesma estratégia de Faeries (mantenha o máximo de criaturas possível e não deixe Murmuring Mystic ficar na mesa). Acho que este é um bom matchup, mas apenas ligeiramente favorável porque se o seu oponente conjurar um Murmuring Mystic e você não tiver Red Elemental Blast, você fica significativamente para trás na vantagem de cartas.",
            "side_in": [
              {
                "card": "Turn Aside",
                "quantidade": 2,

              },
              {
                "card": "Cast Down",
                "quantidade": 1,

              }
            ],
            "side_out": [
              {
                "card": "Makeshift Munitions",
                "quantidade": 1,

              },
              {
                "card": "Krark-Clan Shaman",
                "quantidade": 2,

              }
            ]
          },
          {
            "deck_oponente": "UR Control",
            "estrategia_geral": "Este é um matchup muito semelhante ao UB Control, então as cartas que são removidas são pelo mesmo motivo: Krark-Clan Shaman e [[Makeshift Munitions]] porque não há criaturas relevantes para alvejar. Mas ao contrário do UB Control, este deck tem Gorilla Shaman e Lightning Bolt, o que pode nos prejudicar muito. Portanto, além das estratégias mencionadas anteriormente, é importante jogar em torno de Gorilla Shaman e Cast Into The Fire, então procure por mãos que não só tenham artefatos de baixo custo, mas também contra-mágicas. Também é crucial estar sempre atento para não cair no \"bolt range\". No entanto, ainda considero este um bom matchup para Affinity porque nossa vantagem de cartas é melhor e Refurbished Familiar ajuda muito, reduzindo as cartas na mão do oponente.",
            "side_in": [
              {
                "card": "Blue Elemental Blast",
                "quantidade": 3,

              }
            ],
            "side_out": [
              {
                "card": "Makeshift Munitions",
                "quantidade": 1,

              },
              {
                "card": "Krark-Clan Shaman",
                "quantidade": 2,

              }
            ]
          },
          {
            "deck_oponente": "Jeskai Ephemerate",
            "estrategia_geral": "Não gosto de Krark-Clan Shaman neste matchup porque não há bons alvos. E como não temos Red Elemental Blast, precisamos de alguma forma de lidar com as criaturas do oponente.\n\nEste é um matchup onde costumo jogar de forma mais agressiva porque o loop Archaeomancer é muito forte (se você não tiver [[Nihil Spellbomb]]), então mobilizar criaturas cedo é crucial, especialmente porque seu oponente não tem remoção eficiente para elas no início do jogo Skred precisa esperar até o turno 4 para ser eficaz. Aqui, Refurbished Familiar também é incrível porque força Jeskai a descartar cartas da mão enquanto pressiona o tabuleiro.",
            "side_in": [
              {
                "card": "Cast Down",
                "quantidade": 1,

              }
            ],
            "side_out": [
              {
                "card": "Krark-Clan Shaman",
                "quantidade": 1,
                "motivo": "Não gosto de Krark-Clan Shaman neste matchup porque não há bons alvos."
              }
            ]
          },
          {
            "deck_oponente": "BG Gardens",
            "estrategia_geral": "Considero este um matchup muito bom porque nosso deck pode comprar mais cartas e criar mais criaturas do que o deck do oponente. Graças a [[Blood Fountain]], também podemos gerar muito valor. Então, o segredo no matchup é jogar em torno de Thorn of the Black Rose e Avenging Hunter, o que significa segurar algumas criaturas e depois mobilizá-las todas de uma vez. Além disso, é importante salvar Kenku Artificer, especialmente porque a criatura que ele cria pode zikar o monarca no turno em que entra e, como é indestrutível, só pode ser removida por Defile ou Deglamer em velocidade instantânea. Além disso, evite jogar [[Blood Fountain]] desnecessariamente, pois seu oponente pode removê-lo e você não obterá nenhum valor com ele. Outra carta excelente no matchup é Refurbished Familiar porque força seu oponente a sempre lidar com uma situação 2 por 1.\nGosto de Gorilla Shaman porque além de ser um corpo, ele também pode zikar seu oponente jogando BG Gardens enquanto é uma criatura.",
            "side_in": [
              {
                "card": "Turn Aside",
                "quantidade": 2,

              },
              {
                "card": "Gorilla Shaman",
                "quantidade": 2,

              }
            ],
            "side_out": [
              {
                "card": "Krark-Clan Shaman",
                "quantidade": 2,
                "motivo": "porque o deck não tem muitas criaturas."
              },
              {
                "card": "Cast Down",
                "quantidade": 1,
                "motivo": "porque não há muitos alvos para ele, e nós somos os agressores no matchup."
              },
              {
                "card": "Nihil Spellbomb",
                "quantidade": 1,
                "motivo": "é removido porque eu preciso de um slot, e BG Gardens não interage muito com o cemitério."
              }
            ]
          },
          {
            "deck_oponente": "Kuldotha Burn",
            "estrategia_geral": "Neste matchup, temos que estar o mais vigilantes possível para evitar que Gorilla Shaman atinja suas terrenos cedo, ou um Goblin Bushwhacker + Kuldotha Rebirth. Então, o segredo é tentar ganhar o máximo de tempo possível para que você possa conjurar Myr Enforcer + Reckoner's Bargain, e é por isso que sempre tento mobilizar criaturas o mais cedo possível para evitar que o oponente ataque com suas criaturas. Ou, alternativamente, use Krark-Clan Shaman para limpar o tabuleiro. Considero este um matchup muito favorável.",
            "side_in": [
              {
                "card": "Blue Elemental Blast",
                "quantidade": 4,

              },
              {
                "card": "Hydroblast",
                "quantidade": 1,

              },
              {
                "card": "Krark-Clan Shaman",
                "quantidade": 1,

              },
              {
                "card": "Breath Weapon",
                "quantidade": 1,

              }
            ],
            "side_out": [
              {
                "card": "Kenku Artificer",
                "quantidade": 1,
                "motivo": "Eu não gosto de Kenku Artificer neste matchup porque eu acho ele muito lento, que é a mesma razão para [[Makeshift Munitions]]."
              },
              {
                "card": "Makeshift Munitions",
                "quantidade": 1,
                "motivo": "Eu não gosto de Kenku Artificer neste matchup porque eu acho ele muito lento, que é a mesma razão para [[Makeshift Munitions]]."
              },
              {
                "card": "Thoughtcast",
                "quantidade": 1,
                "motivo": "para liberar um slot"
              },
              {
                "card": "Nihil Spellbomb",
                "quantidade": 2,
                "motivo": "porque Burn não interage com o cemitério."
              },
              {
                "card": "Cast Down",
                "quantidade": 2,
                "motivo": "removido porque eu adiciono mais efeitos de remoção global, reduzindo a necessidade de remoção pontual."
              }
            ]
          },
          {
            "deck_oponente": "Rakdos Burn",
            "estrategia_geral": "Este matchup é um onde eu tento cavar minhas criaturas o mais rápido possível porque precisamos de um clock rápido contra este deck. É muito difícil para nós controlarmos nosso oponente, especialmente com a adição de Sneak Snacker. Então, eu tento ser agressivo ou usar Gorilla Shaman cedo para tentar interromper Rakdos Burn. No entanto, como não temos muitas criaturas, isso é desafiador e é por isso que, ao contrário do Mono Red Burn, considero este um matchup ruim para Affinity.",
            "side_in": [
              {
                "card": "Blue Elemental Blast",
                "quantidade": 4,

              },
              {
                "card": "Hydroblast",
                "quantidade": 1,

              },
              {
                "card": "Gorilla Shaman",
                "quantidade": 3,

              }
            ],
            "side_out": [
              {
                "card": "Krark-Clan Shaman",
                "quantidade": 2,
                "motivo": "Krark-Clan Shaman é removido porque não há boas criaturas para ele destruir."
              },
              {
                "card": "Cast Down",
                "quantidade": 2,
                "motivo": "Eu removo Cast Down porque, apesar de ser remoção para criaturas voadoras, neste matchup eu adoto uma postura mais agressiva porque, ao contrário do Mono Red Burn, este deck tem vantagem de cartas tão boa quanto a nossa."
              },
              {
                "card": "Refurbished Familiar",
                "quantidade": 4,
                "motivo": "Refurbished Familiar é removido porque o fato de fazer o oponente descartar é muitas vezes melhor para eles."
              }
            ]
          },
          {
            "deck_oponente": "BG/R BloodsCale",
            "estrategia_geral": "Com a chegada de Basking Bloodscale, um novo combo surgiu usando Basking Bloodscale + Sadistic Glee. Embora ainda não tenhamos uma lista padrão, já temos as listas mais comuns que as pessoas usam (geralmente aquela com a qual Hamuda venceu o Challenger). Neste matchup, precisamos ser os agressores e sempre tentar remover duas cartas do tabuleiro, Basking Bloodscale e Writhing Chrysalis, porque a primeira é uma peça do combo e a última interrompe nossos ataques. O deck do oponente não tem muitos bloqueadores, o que nos ajuda a adotar um plano mais agressivo, então considero este um bom matchup para Grixis Affinity.",
            "side_in": [
              {
                "card": "Cast Down",
                "quantidade": 1,

              },
              {
                "card": "Krark-Clan Shaman",
                "quantidade": 1,

              }
            ],
            "side_out": [
              {
                "card": "Nihil Spellbomb",
                "quantidade": 1,
                "motivo": "porque não tem muitos alvos, e Reckoner’s Bargain para liberar um slot."
              },
              {
                "card": "Reckoner’s Bargain",
                "quantidade": 1,
                "motivo": "porque não tem muitos alvos, e Reckoner’s Bargain para liberar um slot."
              }
            ]
          },
          {
            "deck_oponente": "Caw Gates",
            "estrategia_geral": "Neste matchup, precisamos nos concentrar em mobilizar criaturas o mais rápido possível para derrotar o oponente antes que ele possa criar um Basilisk Gate massivo. Outra carta muito importante é [[Makeshift Munitions]], pois permite remover quase todas as criaturas do oponente. Além disso, é importante jogar em torno de Dust to Dust, então sempre mantenha mana aberta para conjurar Deadly Dispute ou Turn Aside. Devido à necessidade de abordar outras questões do meta, não temos muitas cartas contra este deck, o que o torna um matchup ruim após o sideboarding.",
            "side_in": [
              {
                "card": "Turn Aside",
                "quantidade": 2,

              }
            ],
            "side_out": [
              {
                "card": "Krark-Clan Shaman",
                "quantidade": 2,
                "motivo": "Krark-Clan Shaman é ruim porque as únicas criaturas que ele pode remover são Secret Cat, Outlaw Medic e Dawnbringer Cleric."
              }
            ]
          },
          {
            "deck_oponente": "GW Auras",
            "estrategia_geral": "Neste jogo, eu removo Galvanic Blast e [[Makeshift Munitions]] porque não temos bons alvos para eles. Eu trago Cast Down porque mata Crimson Acolyte. Também Krark-Clan Shaman e Breath Weapon.\n\nNeste matchup, eu foco em remover as criaturas de Auras o mais rápido possível porque elas são muito mais rápidas do que nós. Outra coisa importante é sempre priorizar conjurar Krark-Clan Shaman o mais cedo possível porque seu oponente costuma guardar criaturas hexproof e um encantamento para mobilizá-los todos de uma vez. Considero este um matchup 50-50, mas pode ser muito melhor se você usar mais Extract a Confession.",
            "side_in": [
              {
                "card": "Krark-Clan Shaman",
                "quantidade": 1,

              },
              {
                "card": "Breath Weapon",
                "quantidade": 1,

              },
              {
                "card": "Extract a Confession",
                "quantidade": 1,

              },
              {
                "card": "Cast Down",
                "quantidade": 1,

              }
            ],
            "side_out": [
              {
                "card": "Makeshift Munitions",
                "quantidade": 1,

              },
              {
                "card": "Galvanic Blast",
                "quantidade": 3,

              }
            ]
          },
          {
            "deck_oponente": "UW Fams",
            "estrategia_geral": "Eu escolhi remover Krark-Clan Shaman e [[Makeshift Munitions]] porque não há muitos bons alvos para eles. Kenku Artificer eu acho muito ruim porque, além de 4 Snap, seu oponente trará 4 Dust to Dust pós-sideboard. Eu trago Cast Down para ajudar a remover Archaeomancer + Ephemerate.\n\nNeste matchup, é importante mobilizar criaturas o mais rápido possível porque você precisa ser o agressor e sempre jogar em torno de Dust to Dust. Seu principal alvo para anular é Dust to Dust porque ele pode te prejudicar significativamente. Este é um matchup que mesmo com Red Elemental Blast, o matchup é ruim e, como nossa lista também não usa isso, considero um matchup muito ruim.",
            "side_in": [
              {
                "card": "Turn Aside",
                "quantidade": 2,

              },
              {
                "card": "Cast Down",
                "quantidade": 1,

              }
            ],
            "side_out": [
              {
                "card": "Krark-Clan Shaman",
                "quantidade": 2,
                "motivo": "Eu escolhi remover Krark-Clan Shaman e [[Makeshift Munitions]] porque não há muitos bons alvos para eles."
              },
              {
                "card": "Kenku Artificer",
                "quantidade": 1,
                "motivo": "Kenku Artificer eu acho muito ruim porque, além de 4 Snap, seu oponente trará 4 Dust to Dust pós-sideboard."
              }
            ]
          },
          {
            "deck_oponente": "Dredge",
            "estrategia_geral": "Neste matchup, seu oponente passará por duas fases: inicialmente, eles tentarão reanimar Throll of Khazad-dum ou Generous Ent para agredir você, e então eles tentarão trazer Lotleth Giant para finalizá-lo. Por esta razão, é importante ter Cast Down cedo no jogo e então impedi-los de ter três criaturas para usar Dread Return. A carta chave neste jogo é [[Nihil Spellbomb]] porque atrasa significativamente seu oponente e, como suas criaturas são fracas, é fácil agredir contra eles.",
            "side_in": [
              {
                "card": "Krark-Clan Shaman",
                "quantidade": 1,

              },
              {
                "card": "Breath Weapon",
                "quantidade": 1,

              }
            ],
            "side_out": [
              {
                "card": "Kenku Artificer",
                "quantidade": 1,

              },
              {
                "card": "Reckoner’s Bargain",
                "quantidade": 1,
                "motivo": "porque eu precisava de\nslots para remover."
              }
            ]
          },
          {
            "deck_oponente": "Elfos",
            "estrategia_geral": "Não gosto de Kenku Artificer porque neste matchup, tudo o que você quer fazer é tirar Krark-Clan Shaman, e Kenku Artificer é uma criatura lenta que não ajuda a encontrar Krark-Clan Shaman. [[Nihil Spellbomb]] é removido porque não tem interação com o cemitério.\n\nEste é um match onde eu agressivamente dou mulligan para mãos que têm Krark-Clan Shaman ou feitiços de remoção para ganhar tempo contra Elfos. Considero este um matchup muito bom para Grixis Affinity porque é muito fácil executar este plano.",
            "side_in": [
              {
                "card": "Krark-Clan Shaman",
                "quantidade": 1,

              },
              {
                "card": "Cast Down",
                "quantidade": 1,

              },
              {
                "card": "Breath Weapon",
                "quantidade": 1,

              }
            ],
            "side_out": [
              {
                "card": "Kenku Artificer",
                "quantidade": 1,
                "motivo": "porque neste matchup, tudo o que você quer fazer é tirar Krark-Clan Shaman, e Kenku Artificer é uma criatura lenta que não ajuda a encontrar Krark-Clan Shaman."
              },
              {
                "card": "Nihil Spellbomb",
                "quantidade": 2,
                "motivo": "removido porque não tem interação com o cemitério."
              }
            ]
          },
          {
            "deck_oponente": "Grixis Affinity",
            "estrategia_geral": "Este é um match onde sempre temos que jogar agressivamente, então não gosto de usar Krark-Clan Shaman para tentar interromper o oponente. Apesar de Frogmite ajudar nesta estratégia, ele é facilmente bloqueado e se torna uma carta morta. Eu removo Cast Down porque o fato de não poder causar dano ao oponente é muito disruptivo, e remover criaturas de Affinity não é muito eficaz, pois elas podem trazê-las de volta facilmente.\n\nEm vez disso, eu trago mais Gorilla Shaman para ajudar a reduzir o número de artefatos que seu oponente tem no campo e, às vezes, também para remover suas terrenos, nos dando uma vitória \"fácil\". Uma carta muito importante neste matchup é Kenku Artificer porque não pode ser removida pelo nosso deck, então sempre tente conjurá-la o mais cedo possível.",
            "side_in": [
              {
                "card": "Gorilla Shaman",
                "quantidade": 4,

              },
              {
                "card": "Blue Elemental Blast",
                "quantidade": 2,

              }
            ],
            "side_out": [
              {
                "card": "Cast Down",
                "quantidade": 2,

              },
              {
                "card": "Krark-Clan Shaman",
                "quantidade": 2,

              },
              {
                "card": "Frogmite",
                "quantidade": 2,
                "motivo": "Apesar de Frogmite ajudar nesta estratégia, ele é facilmente bloqueado e se torna uma carta morta."
              }
            ]
          },
          {
            "deck_oponente": "RG Ponza",
            "estrategia_geral": "Este matchup após o sideboarding tende a ser muito difícil porque seu oponente traz 6 ou 8 feitiços de remoção para suas terrenos indestrutíveis. Isso é difícil de lidar por causa de seu baixo custo, tornando difícil respondê-los a tempo. É por isso que eu uso Turn Aside em vez de Negate. Além disso, seu oponente pode tentar mobilizar várias criaturas grandes, o que também é desafiador para você. No entanto, com a quantidade de remoção que temos, podemos lidar com eles. Também é comum reduzir o número de criaturas por causa do sideboard. Ainda assim, considero este um matchup muito difícil para nós.",
            "side_in": [
              {
                "card": "Turn Aside",
                "quantidade": 2,

              },
              {
                "card": "Cast Down",
                "quantidade": 1,

              },
              {
                "card": "Extract a Confession",
                "quantidade": 1,

              }
            ],
            "side_out": [
              {
                "card": "Nihil Spellbomb",
                "quantidade": 2,
                "motivo": "porque o oponente não tem interação com o cemitério."
              },
              {
                "card": "Reckoner’s Bargain",
                "quantidade": 1,
                "motivo": "porque eu preciso de mais um slot."
              },
              {
                "card": "Makeshift Munitions",
                "quantidade": 1,
                "motivo": "porque não há alvos interessantes"
              }
            ]
          },
          {
            "deck_oponente": "Walls",
            "estrategia_geral": "Assim como contra Elfos, este é um matchup muito bom para Affinity, e as cartas que eu removo são quase pelos mesmos motivos, com a diferença de que eu tiro Kenku Artificer porque não queremos ser agressivos, mas sim encontrar Krark-Clan Shaman.",
            "side_in": [
              {
                "card": "Krark-Clan Shaman",
                "quantidade": 1,

              },
              {
                "card": "Cast Down",
                "quantidade": 1,

              },
              {
                "card": "Breath Weapon",
                "quantidade": 1,

              }
            ],
            "side_out": [
              {
                "card": "Kenku Artificer",
                "quantidade": 1,
                "motivo": "porque não queremos ser agressivos, mas sim encontrar Krark-Clan Shaman."
              },
              {
                "card": "Frogmite",
                "quantidade": 1,
                "motivo": "Assim como contra Elfos, este é um matchup muito bom para Affinity, e as cartas que eu removo são quase pelos mesmos motivos"
              },
              {
                "card": "Makeshift Munitions",
                "quantidade": 1,
                "motivo": "Assim como contra Elfos, este é um matchup muito bom para Affinity, e as cartas que eu removo são quase pelos mesmos motivos"
              }
            ]
          },
          {
            "deck_oponente": "Goblins Combo",
            "estrategia_geral": "Considero este um ótimo matchup porque temos várias respostas instantâneas. Então, o segredo para o match é não deixar o oponente ter uma abertura para combar. Execute seu plano de jogo o mais rápido possível, como [[Ichor Wellspring]] + Deadly Dispute (já que seu oponente dificilmente combará nos primeiros turnos) e então não dê ao seu oponente uma chance. Sempre jogue no turno deles. Além disso, priorize matar Putrid Goblin e anular First Day of Class, pois o deck do oponente não gera mana preta infinita e só tem 4 cópias de First Day of Class, tornando impossível executar o combo sem esta peça. Além disso, no Game 1, é importante tirar [[Makeshift Munitions]] o mais rápido possível porque seu oponente não tem resposta para ele, tornando o combo quase impossível de ser realizado.",
            "side_in": [
              {
                "card": "Blue Elemental Blast",
                "quantidade": 4,

              },
              {
                "card": "Breath Weapon",
                "quantidade": 1,

              },
              {
                "card": "Hydroblast",
                "quantidade": 1,

              },
              {
                "card": "Krark-Clan Shaman",
                "quantidade": 1,

              }
            ],
            "side_out": [
              {
                "card": "Frogmite",
                "quantidade": 2,
                "motivo": "porque nós não precisamos pressionar o oponente."
              },
              {
                "card": "Candy Trail",
                "quantidade": 1,
                "motivo": "porque eu não preciso de tanta seleção de cartas já que eu já trouxe muitas cartas."
              },
              {
                "card": "Cast Down",
                "quantidade": 1,

              },
              {
                "card": "Kenku Artificer",
                "quantidade": 1,
                "motivo": "porque nós não precisamos pressionar o oponente."
              },
              {
                "card": "Reckoner’s Bargain",
                "quantidade": 2,
                "motivo": "porque eu precisava de slots para cartas melhores."
              }
            ]
          },
          {
            "deck_oponente": "Grixis Affinity Mirror",
            "estrategia_geral": "Este é um match onde sempre temos que jogar agressivamente, então não gosto de usar Krark-Clan Shaman para tentar interromper o oponente. Apesar de Frogmite ajudar nesta estratégia, ele é facilmente bloqueado e se torna uma carta morta. Eu removo Cast Down porque o fato de não poder causar dano ao oponente é muito disruptivo, e remover criaturas de Affinity não é muito eficaz, pois elas podem trazê-las de volta facilmente.\n\nEm vez disso, eu trago mais Gorilla Shaman para ajudar a reduzir o número de artefatos que seu oponente tem no campo e, às vezes, também para remover suas terrenos, nos dando uma vitória \"fácil\". Uma carta muito importante neste matchup é Kenku Artificer porque não pode ser removida pelo nosso deck, então sempre tente conjurá-la o mais cedo possível.",
            "side_in": [
              {
                "card": "Gorilla Shaman",
                "quantidade": 4,

              },
              {
                "card": "Blue Elemental Blast",
                "quantidade": 2,

              }
            ],
            "side_out": [
              {
                "card": "Cast Down",
                "quantidade": 2,

              },
              {
                "card": "Krark-Clan Shaman",
                "quantidade": 2,

              },
              {
                "card": "Frogmite",
                "quantidade": 2,
                "motivo": "Apesar de Frogmite ajudar nesta estratégia, ele é facilmente bloqueado e se torna uma carta morta."
              }
            ]
          }
        ],
      }
    default: // Mockup para qualquer outro ID (Guia não encontrado)
      throw createError({
        statusCode: 404,
        statusMessage: `Guia com ID ${guideId} não encontrado.`
      });
  }
});
