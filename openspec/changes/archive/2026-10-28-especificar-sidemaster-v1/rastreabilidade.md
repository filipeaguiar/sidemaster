# Rastreabilidade dos requisitos do SideMaster

Fonte: [documento de requisitos](../../../docs/requisitos-v1.md). O texto original permanece preservado.

Integridade da fonte (SHA-256): `4615eac93c09378f2b54806f2d23469be4c4fdb27c0ac20772ee5fb57a4033e5`.

Cobertura: 90 requisitos especificados em 14 capacidades, com 118 cenários. A tabela também cobre os critérios de aceite, o modelo proposto e as recomendações técnicas.

## Como ler

- `SM-*` identifica um requisito individual com um ou mais cenários WHEN/THEN. Os arquivos agrupam requisitos pela capacidade do OpenSpec.
- As decisões confirmadas formam o escopo v1. A execução por LLM permanece futura; a preparação de dados pertence ao contrato atual.
- A sintaxe e o modelo conservam a classificação de detalhamento proposto do documento de origem.
- `D1` a `D3` são recomendações técnicas propostas, detalhadas no design; não são apresentadas como decisões confirmadas.
- Critérios de aceite repetidos apontam para os mesmos requisitos, evitando criar obrigações duplicadas.

## Specs por capacidade

| Capacidade | Requisitos | Cenários |
| --- | ---: | ---: |
| [guide-storage](specs/guide-storage/spec.md) | 4 | 6 |
| [archetype-library](specs/archetype-library/spec.md) | 5 | 5 |
| [guide-editor](specs/guide-editor/spec.md) | 9 | 12 |
| [card-catalog](specs/card-catalog/spec.md) | 4 | 6 |
| [deck-lists](specs/deck-lists/spec.md) | 5 | 6 |
| [deck-visualization](specs/deck-visualization/spec.md) | 7 | 8 |
| [matchup-plans](specs/matchup-plans/spec.md) | 8 | 11 |
| [opening-hands](specs/opening-hands/spec.md) | 9 | 10 |
| [guide-validation](specs/guide-validation/spec.md) | 7 | 16 |
| [guide-status-panel](specs/guide-status-panel/spec.md) | 6 | 7 |
| [guide-export](specs/guide-export/spec.md) | 5 | 9 |
| [translation-readiness](specs/translation-readiness/spec.md) | 3 | 3 |
| [card-markdown](specs/card-markdown/spec.md) | 5 | 6 |
| [guide-template](specs/guide-template/spec.md) | 13 | 13 |

## Cobertura de cada item da fonte

| Linha | Item da fonte | Classificação | Especificação |
| ---: | --- | --- | --- |
| 7 | Criar e editar guias de decks Pauper em campos Markdown separados, com prévia visual, imagens de cartas obtidas pelo Scryfall e exportação para HTML e PDF. | objetivo ou referencia | [SM-001](specs/guide-storage/spec.md), [SM-002](specs/guide-storage/spec.md), [SM-010](specs/guide-editor/spec.md), [SM-015](specs/guide-editor/spec.md), [SM-019](specs/card-catalog/spec.md), [SM-023](specs/deck-lists/spec.md), [SM-066](specs/guide-export/spec.md), [SM-067](specs/guide-export/spec.md) |
| 11 | `sources/V.4 PT BR Side Guide Grixis Affinity .pptx`. | objetivo ou referencia | [SM-016](specs/guide-editor/spec.md), [SM-078](specs/guide-template/spec.md), [SM-079](specs/guide-template/spec.md), [SM-080](specs/guide-template/spec.md), [SM-081](specs/guide-template/spec.md), [SM-082](specs/guide-template/spec.md), [SM-083](specs/guide-template/spec.md), [SM-084](specs/guide-template/spec.md), [SM-085](specs/guide-template/spec.md), [SM-086](specs/guide-template/spec.md) |
| 12 | Visualização de deck: https://www.mtggoldfish.com/deck/visual/7987742. | objetivo ou referencia | [SM-026](specs/deck-lists/spec.md), [SM-028](specs/deck-visualization/spec.md), [SM-029](specs/deck-visualization/spec.md), [SM-030](specs/deck-visualization/spec.md), [SM-031](specs/deck-visualization/spec.md), [SM-032](specs/deck-visualization/spec.md), [SM-033](specs/deck-visualization/spec.md) |
| 18 | A primeira versão será de uso pessoal. | confirmado | [SM-001](specs/guide-storage/spec.md) |
| 19 | Os guias serão salvos automaticamente no navegador durante a edição. | confirmado | [SM-002](specs/guide-storage/spec.md) |
| 20 | Mostrar o estado do salvamento e a última atualização do guia. | confirmado | [SM-003](specs/guide-storage/spec.md) |
| 21 | O usuário compartilhará os guias por exportação para HTML ou PDF. | confirmado | [SM-004](specs/guide-storage/spec.md) |
| 25 | Agrupar os guias em uma biblioteca por arquétipo, como Grixis Affinity. | confirmado | [SM-005](specs/archetype-library/spec.md) |
| 26 | Cada versão corresponde a um guia completo e independente daquele arquétipo. | confirmado | [SM-006](specs/archetype-library/spec.md) |
| 27 | As versões representam configurações e orientações para diferentes momentos, como o lançamento de uma coleção, um banimento ou uma mudança do metagame. | confirmado | [SM-007](specs/archetype-library/spec.md) |
| 28 | Cada guia tem suas próprias listas, seções, matchups, variantes e exemplos de mãos iniciais. | confirmado | [SM-008](specs/archetype-library/spec.md) |
| 29 | Preservar os guias das versões anteriores ao criar um novo guia para o mesmo arquétipo. | confirmado | [SM-009](specs/archetype-library/spec.md) |
| 33 | Duas colunas: edição à esquerda e resultado visual à direita. | confirmado | [SM-010](specs/guide-editor/spec.md) |
| 34 | Navegação por um sumário hierárquico recolhível dentro da coluna de edição. | confirmado | [SM-011](specs/guide-editor/spec.md) |
| 35 | Editar uma seção ou matchup selecionado por vez. | confirmado | [SM-012](specs/guide-editor/spec.md) |
| 36 | A coluna de prévia mostra sempre o guia completo. | confirmado | [SM-013](specs/guide-editor/spec.md) |
| 37 | Ao selecionar uma seção no sumário, rolar a prévia até a seção correspondente. | confirmado | [SM-014](specs/guide-editor/spec.md) |
| 38 | Campos separados em Markdown para as partes do guia. | confirmado | [SM-015](specs/guide-editor/spec.md) |
| 39 | Modelo inicial inspirado no PPTX de referência. | confirmado | [SM-016](specs/guide-editor/spec.md) |
| 40 | Possibilidade de adicionar, renomear, excluir e reordenar seções. | confirmado | [SM-017](specs/guide-editor/spec.md) |
| 41 | Painel com informações e verificações do guia e do deck. | confirmado | [SM-018](specs/guide-editor/spec.md) |
| 45 | Integração com o Scryfall para reconhecer cartas, obter imagens e consultar dados necessários à validação. | confirmado | [SM-019](specs/card-catalog/spec.md) |
| 46 | Aceitar nomes em inglês e português nas referências. | confirmado | [SM-020](specs/card-catalog/spec.md) |
| 47 | Reconhecer os dois nomes como referências à mesma carta. | confirmado | [SM-021](specs/card-catalog/spec.md) |
| 48 | Preservar a identidade das cartas quando houver tradução do conteúdo. | confirmado | [SM-022](specs/card-catalog/spec.md) |
| 52 | Suporte inicial ao formato Pauper. | confirmado | [SM-023](specs/deck-lists/spec.md) |
| 53 | Main deck e sideboard inseridos como listas em campos Markdown. | confirmado | [SM-024](specs/deck-lists/spec.md) |
| 54 | Cada linha informa quantidade e nome da carta, como `4 [Myr Enforcer]`. | confirmado | [SM-025](specs/deck-lists/spec.md) |
| 55 | Gerar uma versão visual do deck a partir das listas, seguindo a referência do MTGGoldfish. | confirmado | [SM-026](specs/deck-lists/spec.md) |
| 56 | Mostrar as quantidades das cartas na visualização. | confirmado | [SM-027](specs/deck-lists/spec.md) |
| 60 | Mostrar main deck e sideboard separadamente. | confirmado | [SM-028](specs/deck-visualization/spec.md) |
| 61 | Agrupar as cartas por tipo, como criaturas, mágicas e terrenos. | confirmado | [SM-029](specs/deck-visualization/spec.md) |
| 62 | Apresentar cada grupo como uma pilha de cartas parcialmente sobrepostas. | confirmado | [SM-030](specs/deck-visualization/spec.md) |
| 63 | Manter nomes e quantidades visíveis nas pilhas. | confirmado | [SM-031](specs/deck-visualization/spec.md) |
| 64 | Mostrar uma imagem por carta distinta, com um indicador da quantidade de cópias. | confirmado | [SM-032](specs/deck-visualization/spec.md) |
| 65 | Exibir a imagem completa ao passar o mouse ou tocar na carta. | confirmado | [SM-033](specs/deck-visualization/spec.md) |
| 66 | Escolher automaticamente a imagem de cada carta na primeira versão. | confirmado | [SM-034](specs/deck-visualization/spec.md) |
| 70 | Identificar o adversário pelo nome do arquétipo, sem exigir cadastro ou reprodução da lista adversária. | confirmado | [SM-035](specs/matchup-plans/spec.md) |
| 71 | Cada matchup terá um plano geral. | confirmado | [SM-036](specs/matchup-plans/spec.md) |
| 72 | Permitir variantes opcionais com nomes livres, como Tradicional, Sneaky Snacker, Play ou Draw. | confirmado | [SM-037](specs/matchup-plans/spec.md) |
| 73 | As variantes usarão os campos do plano geral, com alterações específicas apenas nos campos que forem substituídos na variante. | confirmado | [SM-038](specs/matchup-plans/spec.md) |
| 74 | Mudanças no plano geral serão refletidas nos campos que a variante continuar usando desse plano. | confirmado | [SM-039](specs/matchup-plans/spec.md) |
| 75 | Associar as entradas e saídas do sideboard aos respectivos planos para permitir verificações de consistência. | confirmado | [SM-040](specs/matchup-plans/spec.md) |
| 76 | Registrar a avaliação do confronto em uma escala qualitativa, com justificativa em Markdown. | confirmado | [SM-041](specs/matchup-plans/spec.md) |
| 77 | A escala terá sete opções: Muito favorável, Favorável, Levemente favorável, Equilibrado, Levemente desfavorável, Desfavorável e Muito desfavorável. | confirmado | [SM-042](specs/matchup-plans/spec.md) |
| 81 | Permitir exemplos de mãos iniciais dentro de cada matchup. | confirmado | [SM-043](specs/opening-hands/spec.md) |
| 82 | Cada exemplo representa um único cenário. | confirmado | [SM-044](specs/opening-hands/spec.md) |
| 83 | Registrar se o exemplo é no play ou na draw e se é pré-side ou pós-side. | confirmado | [SM-045](specs/opening-hands/spec.md) |
| 84 | Cada mão contém sempre sete cartas, contando as cópias repetidas individualmente. | confirmado | [SM-046](specs/opening-hands/spec.md) |
| 85 | Informações sobre mulligans ficam exclusivamente na justificativa, sem um campo próprio para a quantidade de mulligans. | confirmado | [SM-047](specs/opening-hands/spec.md) |
| 86 | A decisão do autor será uma das opções: Manter, Mulligar ou Situacional. | confirmado | [SM-048](specs/opening-hands/spec.md) |
| 87 | A justificativa será escrita em um campo Markdown separado. | confirmado | [SM-049](specs/opening-hands/spec.md) |
| 88 | A lista de cartas será escrita em Markdown, com o mesmo padrão de quantidade e referência usado nas listas do deck. | confirmado | [SM-050](specs/opening-hands/spec.md) |
| 89 | A prévia mostrará as sete cartas individualmente, incluindo as cópias repetidas. | confirmado | [SM-051](specs/opening-hands/spec.md) |
| 93 | Legalidade das cartas no Pauper. | confirmado | [SM-052](specs/guide-validation/spec.md) |
| 94 | Quantidades do main deck e do sideboard. | confirmado | [SM-053](specs/guide-validation/spec.md) |
| 95 | Referências a cartas reconhecidas ou não reconhecidas. | confirmado | [SM-054](specs/guide-validation/spec.md) |
| 96 | Coerência das trocas de sideboard em relação à lista base. | confirmado | [SM-055](specs/guide-validation/spec.md) |
| 97 | Disponibilidade das quantidades indicadas nas entradas e saídas. | confirmado | [SM-056](specs/guide-validation/spec.md) |
| 98 | Diferenças entre os totais de cartas que entram e saem. | confirmado | [SM-057](specs/guide-validation/spec.md) |
| 99 | Contagem de sete cartas em cada exemplo de mão inicial. | confirmado | [SM-058](specs/guide-validation/spec.md) |
| 103 | Exibir um resumo compacto acima das duas colunas do editor. | confirmado | [SM-059](specs/guide-status-panel/spec.md) |
| 104 | Permitir expandir o resumo para consultar informações e detalhes das validações. | confirmado | [SM-060](specs/guide-status-panel/spec.md) |
| 105 | Mostrar os problemas encontrados e indicar o campo correspondente para correção. | confirmado | [SM-061](specs/guide-status-panel/spec.md) |
| 106 | Manter o salvamento disponível mesmo quando houver problemas. | confirmado | [SM-062](specs/guide-status-panel/spec.md) |
| 107 | Manter as exportações HTML e PDF disponíveis mesmo quando houver problemas. | confirmado | [SM-063](specs/guide-status-panel/spec.md) |
| 108 | As validações terão caráter informativo e não bloquearão o fluxo de trabalho. | confirmado | [SM-064](specs/guide-status-panel/spec.md) |
| 112 | Guia web de leitura contínua. | confirmado | [SM-065](specs/guide-export/spec.md) |
| 113 | HTML com texto e estilos no arquivo; imagens das cartas carregadas da internet. | confirmado | [SM-066](specs/guide-export/spec.md) |
| 114 | PDF como relatório A4, com conteúdo contínuo e quebras automáticas. | confirmado | [SM-067](specs/guide-export/spec.md) |
| 115 | Exportar e importar uma cópia editável em arquivo JSON, preservando a estrutura completa e os campos Markdown dos guias. | confirmado | [SM-068](specs/guide-export/spec.md) |
| 116 | A cópia editável permite continuar o trabalho em outro navegador ou computador, mantendo a organização por arquétipo e a identificação da versão do guia. | confirmado | [SM-069](specs/guide-export/spec.md) |
| 120 | Tradução por LLM em uma etapa posterior. | confirmado | [SM-070](specs/translation-readiness/spec.md) |
| 121 | Manter os campos separados para permitir tradução por parte do guia. | confirmado | [SM-071](specs/translation-readiness/spec.md) |
| 122 | Preservar referências às cartas, quantidades e comandos de formatação durante a tradução. | confirmado | [SM-072](specs/translation-readiness/spec.md) |
| 126 | O usuário solicitou uma distinção por modificador entre o nome com hover e a imagem direta. A sintaxe apresentada foi: | detalhamento proposto | [SM-073](specs/card-markdown/spec.md), [SM-074](specs/card-markdown/spec.md) |
| 130 | \| `[Myr Enforcer]` \| Nome destacado; imagem ao passar o mouse ou tocar. \| | detalhamento proposto | [SM-073](specs/card-markdown/spec.md) |
| 131 | \| `![Myr Enforcer]` \| Imagem da carta diretamente no documento. \| | detalhamento proposto | [SM-074](specs/card-markdown/spec.md) |
| 132 | \| `4 [Myr Enforcer]` \| Em um campo de lista, carta e quantidade para a visualização do deck. \| | detalhamento proposto | [SM-075](specs/card-markdown/spec.md) |
| 134 | Links e imagens comuns do Markdown mantêm sua sintaxe habitual, como `[texto](url)` e `![descrição](url)`. | detalhamento proposto | [SM-076](specs/card-markdown/spec.md) |
| 136 | Na exportação para PDF, as referências de texto permanecem legíveis e as imagens explícitas são incorporadas à diagramação. | detalhamento proposto | [SM-077](specs/card-markdown/spec.md) |
| 140 | Esta organização adapta o conteúdo do PPTX às decisões confirmadas. As seções permanecem personalizáveis. | detalhamento proposto | [SM-016](specs/guide-editor/spec.md), [SM-017](specs/guide-editor/spec.md) |
| 142 | 1. Informações do guia: título, autoria, versão e data de referência. | detalhamento proposto | [SM-078](specs/guide-template/spec.md) |
| 143 | 2. Apresentação do autor. | detalhamento proposto | [SM-079](specs/guide-template/spec.md) |
| 144 | 3. Sobre o deck: plano de jogo, mulligan e adaptação ao metagame. | detalhamento proposto | [SM-080](specs/guide-template/spec.md) |
| 145 | 4. Main deck e sua visualização. | detalhamento proposto | [SM-081](specs/guide-template/spec.md) |
| 146 | 5. Sideboard e sua visualização. | detalhamento proposto | [SM-082](specs/guide-template/spec.md) |
| 147 | 6. Escolhas de cartas e base de mana. | detalhamento proposto | [SM-083](specs/guide-template/spec.md) |
| 148 | 7. Maybeboard. | detalhamento proposto | [SM-084](specs/guide-template/spec.md) |
| 149 | 8. Matchups, com plano geral e variantes opcionais. | detalhamento proposto | [SM-085](specs/guide-template/spec.md) |
| 150 | 9. Encerramento e redes sociais. | detalhamento proposto | [SM-086](specs/guide-template/spec.md) |
| 154 | Nome do arquétipo adversário. | detalhamento proposto | [SM-035](specs/matchup-plans/spec.md) |
| 155 | Cartas que entram e saem. | detalhamento proposto | [SM-040](specs/matchup-plans/spec.md) |
| 156 | Justificativa das trocas. | detalhamento proposto | [SM-087](specs/guide-template/spec.md) |
| 157 | Plano de jogo. | detalhamento proposto | [SM-088](specs/guide-template/spec.md) |
| 158 | Interações e cuidados técnicos. | detalhamento proposto | [SM-089](specs/guide-template/spec.md) |
| 159 | Avaliação qualitativa do confronto, justificativa em Markdown e ajustes sugeridos. | detalhamento proposto | [SM-090](specs/guide-template/spec.md), [SM-041](specs/matchup-plans/spec.md), [SM-042](specs/matchup-plans/spec.md) |
| 160 | Exemplos de mãos iniciais e comentários sobre keep ou mulligan. | detalhamento proposto | [SM-043](specs/opening-hands/spec.md), [SM-044](specs/opening-hands/spec.md), [SM-045](specs/opening-hands/spec.md), [SM-046](specs/opening-hands/spec.md), [SM-047](specs/opening-hands/spec.md), [SM-048](specs/opening-hands/spec.md), [SM-049](specs/opening-hands/spec.md), [SM-050](specs/opening-hands/spec.md), [SM-051](specs/opening-hands/spec.md) |
| 162 | Cada exemplo de mão segue as decisões da seção Mãos iniciais: sete cartas, um cenário, decisão e justificativa em Markdown. | detalhamento proposto | [SM-043](specs/opening-hands/spec.md), [SM-044](specs/opening-hands/spec.md), [SM-045](specs/opening-hands/spec.md), [SM-046](specs/opening-hands/spec.md), [SM-047](specs/opening-hands/spec.md), [SM-048](specs/opening-hands/spec.md), [SM-049](specs/opening-hands/spec.md), [SM-050](specs/opening-hands/spec.md), [SM-051](specs/opening-hands/spec.md) |
| 168 | Guardar uma identificação estável da carta junto à referência reconhecida, além do texto digitado, para sustentar nomes em dois idiomas e traduções futuras. | recomendacao tecnica proposta | [D1 — recomendação proposta](design.md) |
| 169 | Usar as mesmas listas como origem da grade visual e das verificações para evitar divergências entre representações. | recomendacao tecnica proposta | [D2 — recomendação proposta](design.md) |
| 170 | Informar a data da última consulta de legalidade e distinguir uma consulta pendente de um deck efetivamente validado. | recomendacao tecnica proposta | [D3 — recomendação proposta](design.md) |
| 174 | Organizar múltiplos guias por arquétipo, tratando cada versão como um guia independente e preservando os anteriores. | criterio de aceite | [SM-005](specs/archetype-library/spec.md), [SM-006](specs/archetype-library/spec.md), [SM-007](specs/archetype-library/spec.md), [SM-008](specs/archetype-library/spec.md), [SM-009](specs/archetype-library/spec.md) |
| 175 | Criar um guia a partir do modelo e editar seções separadamente. | criterio de aceite | [SM-016](specs/guide-editor/spec.md), [SM-015](specs/guide-editor/spec.md) |
| 176 | Adicionar, renomear, excluir e reordenar seções. | criterio de aceite | [SM-017](specs/guide-editor/spec.md) |
| 177 | Visualizar a edição em duas colunas. | criterio de aceite | [SM-010](specs/guide-editor/spec.md) |
| 178 | Selecionar uma seção por vez no sumário hierárquico recolhível, exibindo seus campos na coluna de edição. | criterio de aceite | [SM-011](specs/guide-editor/spec.md), [SM-012](specs/guide-editor/spec.md) |
| 179 | Manter o guia completo na prévia e rolar até a seção escolhida no sumário. | criterio de aceite | [SM-013](specs/guide-editor/spec.md), [SM-014](specs/guide-editor/spec.md) |
| 180 | Reconhecer referências às cartas em inglês e português. | criterio de aceite | [SM-020](specs/card-catalog/spec.md), [SM-021](specs/card-catalog/spec.md) |
| 181 | Distinguir referências com hover de imagens explícitas. | criterio de aceite | [SM-073](specs/card-markdown/spec.md), [SM-074](specs/card-markdown/spec.md) |
| 182 | Transformar listas Markdown de main deck e sideboard em blocos visuais com quantidades. | criterio de aceite | [SM-024](specs/deck-lists/spec.md), [SM-025](specs/deck-lists/spec.md), [SM-026](specs/deck-lists/spec.md), [SM-027](specs/deck-lists/spec.md) |
| 183 | Exibir main deck e sideboard separados, agrupados por tipo em pilhas parcialmente sobrepostas, com nomes e quantidades visíveis. | criterio de aceite | [SM-028](specs/deck-visualization/spec.md), [SM-029](specs/deck-visualization/spec.md), [SM-030](specs/deck-visualization/spec.md), [SM-031](specs/deck-visualization/spec.md) |
| 184 | Abrir a imagem completa das cartas no hover ou toque, usando imagens escolhidas automaticamente. | criterio de aceite | [SM-033](specs/deck-visualization/spec.md), [SM-034](specs/deck-visualization/spec.md) |
| 185 | Criar planos gerais e variantes nomeadas em matchups. | criterio de aceite | [SM-036](specs/matchup-plans/spec.md), [SM-037](specs/matchup-plans/spec.md) |
| 186 | Identificar os adversários pelo nome do arquétipo. | criterio de aceite | [SM-035](specs/matchup-plans/spec.md) |
| 187 | Reutilizar nas variantes os campos do plano geral e permitir substituir apenas os campos específicos de cada variante. | criterio de aceite | [SM-038](specs/matchup-plans/spec.md), [SM-039](specs/matchup-plans/spec.md) |
| 188 | Registrar a avaliação dos confrontos na escala qualitativa de sete opções, com justificativa em Markdown. | criterio de aceite | [SM-041](specs/matchup-plans/spec.md), [SM-042](specs/matchup-plans/spec.md) |
| 189 | Criar exemplos de mãos de sete cartas, com cenário play/draw e pré/pós-side, decisão Manter/Mulligar/Situacional e justificativa em Markdown. | criterio de aceite | [SM-043](specs/opening-hands/spec.md), [SM-044](specs/opening-hands/spec.md), [SM-045](specs/opening-hands/spec.md), [SM-046](specs/opening-hands/spec.md), [SM-047](specs/opening-hands/spec.md), [SM-048](specs/opening-hands/spec.md), [SM-049](specs/opening-hands/spec.md), [SM-050](specs/opening-hands/spec.md), [SM-051](specs/opening-hands/spec.md) |
| 190 | Exibir as sete cartas da mão individualmente e apontar quando a lista tiver uma quantidade diferente. | criterio de aceite | [SM-051](specs/opening-hands/spec.md), [SM-058](specs/guide-validation/spec.md) |
| 191 | Exibir os problemas de legalidade, quantidades, referências e trocas no painel. | criterio de aceite | [SM-052](specs/guide-validation/spec.md), [SM-053](specs/guide-validation/spec.md), [SM-054](specs/guide-validation/spec.md), [SM-055](specs/guide-validation/spec.md), [SM-056](specs/guide-validation/spec.md), [SM-057](specs/guide-validation/spec.md) |
| 192 | Exibir o painel como resumo compacto acima das duas colunas, com detalhes expansíveis e indicação dos campos com problemas. | criterio de aceite | [SM-059](specs/guide-status-panel/spec.md), [SM-060](specs/guide-status-panel/spec.md), [SM-061](specs/guide-status-panel/spec.md) |
| 193 | Permitir salvar e exportar guias mesmo quando o painel indicar problemas. | criterio de aceite | [SM-062](specs/guide-status-panel/spec.md), [SM-063](specs/guide-status-panel/spec.md), [SM-064](specs/guide-status-panel/spec.md) |
| 194 | Recuperar no navegador um guia salvo anteriormente. | criterio de aceite | [SM-002](specs/guide-storage/spec.md) |
| 195 | Salvar automaticamente as alterações, exibindo o estado do salvamento e a última atualização. | criterio de aceite | [SM-002](specs/guide-storage/spec.md), [SM-003](specs/guide-storage/spec.md) |
| 196 | Exportar e importar uma cópia editável em JSON, preservando os campos Markdown e a estrutura do guia. | criterio de aceite | [SM-068](specs/guide-export/spec.md), [SM-069](specs/guide-export/spec.md) |
| 197 | Exportar HTML com imagens remotas e PDF A4 com paginação automática. | criterio de aceite | [SM-066](specs/guide-export/spec.md), [SM-067](specs/guide-export/spec.md) |
| 198 | Manter a estrutura de conteúdo preparada para a futura tradução por LLM. | criterio de aceite | [SM-070](specs/translation-readiness/spec.md), [SM-071](specs/translation-readiness/spec.md), [SM-072](specs/translation-readiness/spec.md) |

## Limites desta entrega

Os arquivos descrevem comportamento e aceitação para implementação futura. A conclusão dos artefatos OpenSpec e a cobertura da matriz não significam que o aplicativo, os cenários ou as integrações já estejam implementados.
