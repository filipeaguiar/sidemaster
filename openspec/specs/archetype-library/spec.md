## Purpose

Biblioteca para agrupar, identificar e selecionar guias por arquétipo.

## Requirements

### Requirement: SM-005 — Biblioteca por arquétipo

O sistema SHALL agrupar os guias pelo arquétipo do deck do autor e permitir selecionar um guia dentro do respectivo grupo.

Origem: `docs/requisitos-v1.md`, linhas 25. Classificação: confirmado.

#### Scenario: SM-005.1 — Selecionar em um grupo
- **WHEN** existem dois guias de Grixis Affinity e um de MonoU Terror
- **THEN** a biblioteca apresenta os guias nos respectivos arquétipos e permite abrir cada guia.

### Requirement: SM-006 — Versão como guia independente

O sistema SHALL representar cada versão de um arquétipo como um guia completo e independente, com identificação própria; a versão de conteúdo não é uma revisão automática de edição nem a versão do formato JSON.

Origem: `docs/requisitos-v1.md`, linhas 26. Classificação: confirmado.

#### Scenario: SM-006.1 — Abrir duas versões
- **WHEN** a pessoa abre v1 e v2 do mesmo arquétipo
- **THEN** cada seleção recupera um documento completo com sua própria identificação.

### Requirement: SM-007 — Contexto de metagame da versão

O sistema SHALL permitir identificar e descrever o contexto de uma versão, como nova coleção, banimento ou mudança de metagame, usando a identificação do guia e seu conteúdo editorial.

Origem: `docs/requisitos-v1.md`, linhas 27. Classificação: confirmado.

#### Scenario: SM-007.1 — Identificar uma atualização de metagame
- **WHEN** a pessoa cria um guia identificado como ajustes após uma nova coleção
- **THEN** essa identificação distingue o novo guia dos anteriores na biblioteca e acompanha seu conteúdo salvo.

### Requirement: SM-008 — Conteúdo isolado entre guias

O sistema SHALL manter listas, seções, matchups, variantes e mãos pertencentes ao guia selecionado, isolando as alterações em relação aos outros guias.

Origem: `docs/requisitos-v1.md`, linhas 28. Classificação: confirmado.

#### Scenario: SM-008.1 — Editar uma versão
- **WHEN** a pessoa altera a lista, um texto e uma mão na v2
- **THEN** essas alterações são recuperadas na v2 e a v1 conserva seu conteúdo anterior.

### Requirement: SM-009 — Preservação das versões anteriores

O sistema SHALL preservar os guias existentes quando um novo guia do mesmo arquétipo for criado.

Origem: `docs/requisitos-v1.md`, linhas 29. Classificação: confirmado.

#### Scenario: SM-009.1 — Criar o próximo guia
- **WHEN** uma nova versão de Grixis Affinity é criada
- **THEN** os guias anteriores continuam disponíveis e mantêm identificadores e conteúdo.
