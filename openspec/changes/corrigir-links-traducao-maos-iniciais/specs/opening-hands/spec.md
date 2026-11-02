## MODIFIED Requirements

### Requirement: SM-045 — Contexto de play e sideboard

O sistema SHALL oferecer Play, Draw ou Sempre no eixo Posição e Pré-side, Pós-side ou Sempre no eixo Momento em todas as mãos iniciais, incluindo mãos gerais do deck e mãos de matchup, independentemente da profundidade ou do caminho de criação. Sempre SHALL indicar que a avaliação vale para ambos os contextos daquele eixo e SHALL ser preservado no armazenamento, na prévia e nas exportações; na leitura em inglês SHALL aparecer como Always.

Origem: `docs/requisitos-v1.md`, linhas 83. Classificação: confirmado, ampliado para paridade entre mãos gerais e de matchup pela solicitação desta change.

#### Scenario: SM-045.1 — Mostrar o contexto
- **WHEN** o exemplo é marcado Draw e Pós-side
- **THEN** a prévia e as exportações identificam esse cenário junto às cartas.

#### Scenario: SM-045.2 — Avaliação aplicável aos dois contextos
- **WHEN** o autor seleciona Sempre em Posição e Momento de qualquer mão inicial
- **THEN** ambos os valores são salvos e reaparecem selecionados ao reabrir; a leitura mostra Sempre em português e Always em inglês.

#### Scenario: SM-045.3 — Mão geral também pode representar pós-side
- **WHEN** o autor adiciona uma mão geral em Sobre o deck ou em um grupo dentro de uma subseção Markdown
- **THEN** Momento oferece Pré-side, Pós-side e Sempre, e a escolha de Pós-side é preservada sem exigir matchup.

## ADDED Requirements

### Requirement: Seletores completos em todos os destinos de mãos iniciais

O sistema SHALL apresentar exatamente as opções Posição = Play/Draw/Sempre, Momento = Pré-side/Pós-side/Sempre e Decisão = Manter/Mulligar/Situacional em todo editor de mão inicial. SHALL manter rótulos e opções legíveis, menus operáveis por mouse e teclado e o valor selecionado visível após salvar, alternar seções, duplicar, mover para outro grupo compatível, reabrir ou importar o guia. O comportamento SHALL ser consistente nas larguras suportadas do editor e após redimensionar seus painéis.

#### Scenario: Percorrer todos os destinos permitidos
- **WHEN** a pessoa cria ou edita mãos em grupos gerais, em grupos de matchup e em grupos de subseções aninhadas dentro e fora de matchups, usando tanto a árvore quanto o botão do editor
- **THEN** cada mão oferece todas as opções dos três seletores, sem opções ocultas ou restritas pela presença de um adversário.

#### Scenario: Mover mão com cenário já definido
- **WHEN** uma mão com Posição = Sempre, Momento = Pós-side e Decisão = Situacional é movida de um grupo de matchup para um grupo geral e depois duplicada
- **THEN** original e duplicata mantêm os três valores e os seletores continuam exibindo todas as opções.

#### Scenario: Operar seletores com painel estreito
- **WHEN** o editor está na menor largura suportada ou seus painéis foram redimensionados e a pessoa abre cada seletor por mouse e teclado
- **THEN** é possível ler e selecionar qualquer opção, identificar o campo e conferir o valor escolhido sem cortes que impeçam o uso.

#### Scenario: Reabrir e importar
- **WHEN** um guia com escolhas não padrão nos três seletores é salvo, reaberto e exportado/importado em JSON
- **THEN** cada escolha reaparece selecionada e a prévia e as saídas HTML/PDF apresentam os mesmos cenários.
