## Purpose

Planos de confronto, trocas de sideboard e variantes herdadas.

## Requirements

### Requirement: SM-035 — Adversário identificado pelo arquétipo

O sistema SHALL identificar o adversário pelo nome do arquétipo e permitir criar e manter um matchup sem cadastrar ou reproduzir uma lista adversária.

Origem: `docs/requisitos-v1.md`, linhas 70. Classificação: confirmado.

#### Scenario: SM-035.1 — Criar UB Faeries
- **WHEN** a pessoa informa UB Faeries como adversário
- **THEN** o matchup pode receber estratégia, planos e mãos sem lista de cartas do oponente.

### Requirement: SM-036 — Plano geral do confronto

O sistema SHALL manter um plano geral em cada matchup para os campos editoriais e as trocas de sideboard.

Origem: `docs/requisitos-v1.md`, linhas 71. Classificação: confirmado.

#### Scenario: SM-036.1 — Editar o plano geral
- **WHEN** a pessoa abre um matchup sem variantes
- **THEN** ela consegue preencher os campos do plano geral.

### Requirement: SM-037 — Variantes opcionais com nomes livres

O sistema SHALL permitir criar variantes opcionais e atribuir a elas nomes definidos pelo autor.

Origem: `docs/requisitos-v1.md`, linhas 72. Classificação: confirmado.

#### Scenario: SM-037.1 — Nomear variantes
- **WHEN** a pessoa adiciona Tradicional, Sneaky Snacker e Draw ao matchup
- **THEN** cada variante fica identificada por seu nome e pode ser selecionada separadamente.

#### Scenario: SM-037.2 — Manter apenas o plano geral
- **WHEN** o matchup não precisa de variantes
- **THEN** ele funciona e pode ser exportado apenas com o plano geral.

### Requirement: SM-038 — Substituição seletiva dos campos

O sistema SHALL resolver cada campo de uma variante pelo valor específico da variante quando esse valor tiver sido definido e pelo plano geral nos demais casos. Ausência de substituição e um valor explicitamente vazio SHALL ser estados distintos.

Origem: `docs/requisitos-v1.md`, linhas 73. Classificação: confirmado.

#### Scenario: SM-038.1 — Alterar somente a estratégia
- **WHEN** a variante define apenas a estratégia
- **THEN** as entradas, saídas e os demais campos continuam usando o plano geral.

#### Scenario: SM-038.2 — Esvaziar um campo intencionalmente
- **WHEN** o autor define um texto vazio como substituição em uma variante
- **THEN** o resultado da variante fica vazio nesse campo e a intenção é preservada no salvamento e no JSON.

### Requirement: SM-039 — Atualização dos campos herdados

O sistema SHALL refletir alterações do plano geral nos campos herdados pelas variantes, preservando os campos que possuem substituição própria.

Origem: `docs/requisitos-v1.md`, linhas 74. Classificação: confirmado.

#### Scenario: SM-039.1 — Atualizar trocas compartilhadas
- **WHEN** o autor altera as entradas do plano geral e a variante não as substitui
- **THEN** a variante passa a usar as novas entradas.

#### Scenario: SM-039.2 — Preservar uma estratégia própria
- **WHEN** o autor altera a estratégia geral e a variante tem estratégia própria
- **THEN** a estratégia específica da variante é preservada.

### Requirement: SM-040 — Trocas associadas ao plano

O sistema SHALL associar campos Markdown de cartas que entram e saem a cada plano e avaliar as trocas sobre o conteúdo efetivo do plano, incluindo a herança da variante.

Origem: `docs/requisitos-v1.md`, linhas 75. Classificação: confirmado.

#### Scenario: SM-040.1 — Validar uma variante
- **WHEN** a variante substitui as saídas e herda as entradas
- **THEN** as verificações usam as saídas específicas e as entradas gerais, associadas àquela variante.

### Requirement: SM-041 — Avaliação com justificativa Markdown

O sistema SHALL permitir ao autor atribuir uma avaliação qualitativa ao confronto e escrever sua justificativa em um campo Markdown separado, exibindo ambas no guia.

Origem: `docs/requisitos-v1.md`, linhas 76. Classificação: confirmado.

#### Scenario: SM-041.1 — Apresentar a avaliação
- **WHEN** o autor seleciona Levemente desfavorável e escreve a justificativa
- **THEN** o guia mostra o rótulo associado ao confronto e renderiza a justificativa.

### Requirement: SM-042 — Escala qualitativa de sete opções

O sistema SHALL oferecer exatamente as opções Muito favorável, Favorável, Levemente favorável, Equilibrado, Levemente desfavorável, Desfavorável e Muito desfavorável para a avaliação qualitativa.

Origem: `docs/requisitos-v1.md`, linhas 77. Classificação: confirmado.

#### Scenario: SM-042.1 — Escolher na escala
- **WHEN** o autor abre o campo de avaliação
- **THEN** as sete opções estão disponíveis e o valor selecionado é preservado ao reabrir o guia.
