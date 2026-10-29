## Purpose

Exemplos de mãos iniciais com cenários e decisões por confronto.

## Requirements

### Requirement: SM-043 — Exemplos dentro do matchup

O sistema SHALL permitir cadastrar exemplos de mãos iniciais associados ao respectivo matchup.

Origem: `docs/requisitos-v1.md`, linhas 81. Classificação: confirmado.

#### Scenario: SM-043.1 — Manter exemplos separados
- **WHEN** o autor adiciona duas mãos a UB Faeries e uma a Jund Wildfire
- **THEN** cada exemplo aparece no matchup ao qual foi associado.

### Requirement: SM-044 — Um cenário por exemplo

O sistema SHALL associar cada exemplo de mão a um único cenário editorial e uma única avaliação, permitindo criar outro exemplo para representar um cenário diferente.

Origem: `docs/requisitos-v1.md`, linhas 82. Classificação: confirmado.

#### Scenario: SM-044.1 — Avaliar a mesma mão em dois contextos
- **WHEN** o autor precisa de avaliações diferentes para play e draw
- **THEN** ele registra dois exemplos, cada um com seu próprio cenário e decisão.

### Requirement: SM-045 — Contexto de play e sideboard

O sistema SHALL oferecer Play, Draw ou Sempre no eixo Posição. Nas mãos de matchup, SHALL oferecer Pré-side, Pós-side ou Sempre no eixo Momento. Sempre SHALL indicar que a avaliação vale para ambos os contextos daquele eixo e SHALL ser preservado no armazenamento, na prévia e nas exportações; na leitura em inglês SHALL aparecer como Always.

Origem: `docs/requisitos-v1.md`, linhas 83. Classificação: confirmado.

#### Scenario: SM-045.1 — Mostrar o contexto
- **WHEN** o exemplo é marcado Draw e Pós-side
- **THEN** a prévia e as exportações identificam esse cenário junto às cartas.

#### Scenario: SM-045.2 — Avaliação aplicável aos dois contextos
- **WHEN** o autor seleciona Sempre em Posição e Momento de uma mão de matchup
- **THEN** ambos os valores são salvos e reaparecem selecionados ao reabrir; a leitura mostra Sempre em português e Always em inglês.

### Requirement: SM-046 — Mão sempre com sete cartas

O sistema SHALL considerar completo um exemplo de mão com exatamente sete cartas, somando as quantidades inclusive de cartas repetidas; tamanhos diferentes SHALL gerar o problema informativo descrito em guide-validation.

Origem: `docs/requisitos-v1.md`, linhas 84. Classificação: confirmado.

#### Scenario: SM-046.1 — Contar cartas repetidas
- **WHEN** o campo informa duas cópias de uma carta e cinco outras cartas
- **THEN** a contagem do exemplo é sete.

#### Scenario: SM-046.2 — Rascunho com seis cartas
- **WHEN** a lista de uma mão totaliza seis
- **THEN** o exemplo permanece editável e o painel informa que falta uma carta para completar sete.

### Requirement: SM-047 — Mulligans registrados na justificativa

O sistema SHALL permitir registrar observações sobre mulligans no texto da justificativa e SHALL manter os exemplos como mãos de sete cartas, sem um campo próprio para quantidade de mulligans.

Origem: `docs/requisitos-v1.md`, linhas 85. Classificação: confirmado.

#### Scenario: SM-047.1 — Explicar uma condição de mulligan
- **WHEN** o autor escreve que manteria após um mulligan
- **THEN** a observação aparece na justificativa e a lista continua representando sete cartas.

### Requirement: SM-048 — Decisão de manter mulligar ou situacional

O sistema SHALL disponibilizar exatamente Manter, Mulligar e Situacional como decisões atribuídas pelo autor a um exemplo de mão.

Origem: `docs/requisitos-v1.md`, linhas 86. Classificação: confirmado.

#### Scenario: SM-048.1 — Registrar uma decisão situacional
- **WHEN** o autor seleciona Situacional
- **THEN** esse valor é preservado e exibido junto ao exemplo.

### Requirement: SM-049 — Justificativa em campo Markdown

O sistema SHALL armazenar a justificativa da mão em um campo Markdown separado da lista e dos seletores de contexto e decisão.

Origem: `docs/requisitos-v1.md`, linhas 87. Classificação: confirmado.

#### Scenario: SM-049.1 — Explicar usando cartas
- **WHEN** a justificativa contém ênfase e uma referência a carta
- **THEN** a prévia mantém a formatação e resolve a referência sem alterar a lista da mão.

### Requirement: SM-050 — Lista Markdown da mão

O sistema SHALL usar no campo de cartas da mão o mesmo padrão de quantidade e referência por linha definido para as listas do deck.

Origem: `docs/requisitos-v1.md`, linhas 88. Classificação: confirmado.

#### Scenario: SM-050.1 — Informar uma repetição
- **WHEN** a lista da mão contém `2 [Myr Enforcer]`
- **THEN** o interpretador considera duas cópias dessa carta para a mão.

### Requirement: SM-051 — Sete cartas exibidas individualmente

O sistema SHALL mostrar uma imagem por cópia na prévia de uma mão completa, incluindo repetições, formando uma faixa visual de sete cartas.

Origem: `docs/requisitos-v1.md`, linhas 89. Classificação: confirmado.

#### Scenario: SM-051.1 — Renderizar duas cópias iguais
- **WHEN** uma mão válida contém duas cópias de Myr Enforcer
- **THEN** a faixa mostra duas imagens dessa carta e sete imagens no total.
