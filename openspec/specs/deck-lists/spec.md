## Purpose

Listas separadas de main deck e sideboard para decks Pauper.

## Requirements

### Requirement: SM-023 — Formato inicial Pauper

O sistema SHALL tratar os guias da primeira versão como guias Pauper e aplicar a eles as regras desse formato descritas em guide-validation.

Origem: `docs/requisitos-v1.md`, linhas 52. Classificação: confirmado.

#### Scenario: SM-023.1 — Criar um guia inicial
- **WHEN** um guia é criado pelo modelo inicial
- **THEN** o formato usado nas verificações é Pauper.

### Requirement: SM-024 — Listas Markdown separadas

O sistema SHALL fornecer campos Markdown distintos para main deck e sideboard, preservando suas linhas originais.

Origem: `docs/requisitos-v1.md`, linhas 53. Classificação: confirmado.

#### Scenario: SM-024.1 — Editar as duas listas
- **WHEN** a pessoa preenche o main deck e depois o sideboard
- **THEN** cada campo conserva sua lista e a prévia distingue as duas zonas.

### Requirement: SM-025 — Quantidade e referência por linha

O sistema SHALL interpretar cada linha de carta no padrão quantidade inteira positiva seguida de referência entre colchetes, como `4 [Myr Enforcer]`, mantendo a origem da linha para apontar problemas.

Origem: `docs/requisitos-v1.md`, linhas 54. Classificação: confirmado.

#### Scenario: SM-025.1 — Interpretar a linha
- **WHEN** uma lista contém `4 [Myr Enforcer]`
- **THEN** a entrada informa quantidade quatro e referência Myr Enforcer.

#### Scenario: SM-025.2 — Linha incompleta
- **WHEN** uma linha de carta está sem quantidade, com quantidade não positiva ou com referência incompleta
- **THEN** o texto permanece editável e um problema indica aquela linha, sem inventar uma quantidade válida.

### Requirement: SM-026 — Visualização derivada das listas

O sistema SHALL gerar os blocos visuais a partir das listas Markdown vigentes, segundo deck-visualization, usando a referência de composição compacta fornecida pelo usuário.

Origem: `docs/requisitos-v1.md`, linhas 55. Classificação: confirmado.

#### Scenario: SM-026.1 — Atualizar a representação
- **WHEN** a pessoa altera uma quantidade na lista
- **THEN** o bloco visual passa a refletir a mesma quantidade após a interpretação do campo.

### Requirement: SM-027 — Quantidades na visualização

O sistema SHALL mostrar, na visualização do deck, a quantidade correspondente à carta na zona representada.

Origem: `docs/requisitos-v1.md`, linhas 56. Classificação: confirmado.

#### Scenario: SM-027.1 — Ler a quantidade
- **WHEN** uma carta aparece quatro vezes no main deck normalizado
- **THEN** a visualização do main deck mostra o indicador quatro para essa carta.
