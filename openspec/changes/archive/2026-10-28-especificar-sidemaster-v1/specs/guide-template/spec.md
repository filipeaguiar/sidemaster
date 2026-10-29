## ADDED Requirements

### Requirement: SM-078 — Informações do guia

No modelo proposto, o sistema SHALL fornecer campos para título, autoria, identificação da versão e data de referência. Essas seções SHALL permanecer personalizáveis conforme guide-editor.

Origem: `docs/requisitos-v1.md`, linhas 142. Classificação: modelo proposto.

#### Scenario: SM-078.1 — Preencher o modelo
- **WHEN** o autor preenche título, autoria, versão e data
- **THEN** os quatro valores permanecem associados ao guia e são recuperados ao reabri-lo

### Requirement: SM-079 — Apresentação do autor

No modelo proposto, o sistema SHALL fornecer uma seção Markdown para apresentação do autor. Essas seções SHALL permanecer personalizáveis conforme guide-editor.

Origem: `docs/requisitos-v1.md`, linhas 143. Classificação: modelo proposto.

#### Scenario: SM-079.1 — Preencher o modelo
- **WHEN** o autor escreve sua apresentação
- **THEN** a seção é editável e aparece na posição correspondente do guia

### Requirement: SM-080 — Sobre o deck

No modelo proposto, o sistema SHALL fornecer campos Markdown para plano de jogo, mulligan e adaptação ao metagame. Essas seções SHALL permanecer personalizáveis conforme guide-editor.

Origem: `docs/requisitos-v1.md`, linhas 144. Classificação: modelo proposto.

#### Scenario: SM-080.1 — Preencher o modelo
- **WHEN** o autor preenche os três assuntos
- **THEN** cada assunto pode ser editado e exibido dentro de Sobre o deck

### Requirement: SM-081 — Main deck no modelo

No modelo proposto, o sistema SHALL fornecer uma seção de main deck ligada à lista e à sua visualização. Essas seções SHALL permanecer personalizáveis conforme guide-editor.

Origem: `docs/requisitos-v1.md`, linhas 145. Classificação: modelo proposto.

#### Scenario: SM-081.1 — Preencher o modelo
- **WHEN** o main deck é preenchido
- **THEN** a seção usa o conteúdo e o bloco visual definidos em deck-lists e deck-visualization

### Requirement: SM-082 — Sideboard no modelo

No modelo proposto, o sistema SHALL fornecer uma seção de sideboard ligada à lista e à sua visualização. Essas seções SHALL permanecer personalizáveis conforme guide-editor.

Origem: `docs/requisitos-v1.md`, linhas 146. Classificação: modelo proposto.

#### Scenario: SM-082.1 — Preencher o modelo
- **WHEN** o sideboard é preenchido
- **THEN** a seção usa sua própria lista e o respectivo bloco visual

### Requirement: SM-083 — Escolhas de cartas e base de mana

No modelo proposto, o sistema SHALL fornecer campos Markdown para escolhas de cartas e base de mana. Essas seções SHALL permanecer personalizáveis conforme guide-editor.

Origem: `docs/requisitos-v1.md`, linhas 147. Classificação: modelo proposto.

#### Scenario: SM-083.1 — Preencher o modelo
- **WHEN** o autor documenta por que usa uma carta e como compôs os terrenos
- **THEN** os textos e referências podem ser lidos na seção correspondente

### Requirement: SM-084 — Maybeboard

No modelo proposto, o sistema SHALL fornecer uma seção Markdown para cartas e alternativas consideradas pelo autor. Essas seções SHALL permanecer personalizáveis conforme guide-editor.

Origem: `docs/requisitos-v1.md`, linhas 148. Classificação: modelo proposto.

#### Scenario: SM-084.1 — Preencher o modelo
- **WHEN** o autor escreve uma referência e sua justificativa no Maybeboard
- **THEN** a seção renderiza o texto e a referência sem adicionar a carta às contagens do deck base

### Requirement: SM-085 — Matchups no modelo

No modelo proposto, o sistema SHALL fornecer uma seção de matchups com plano geral e variantes opcionais. Essas seções SHALL permanecer personalizáveis conforme guide-editor.

Origem: `docs/requisitos-v1.md`, linhas 149. Classificação: modelo proposto.

#### Scenario: SM-085.1 — Preencher o modelo
- **WHEN** o autor adiciona um matchup ao modelo
- **THEN** ele recebe a estrutura definida em matchup-plans e pode adicionar variantes

### Requirement: SM-086 — Encerramento e redes sociais

No modelo proposto, o sistema SHALL fornecer uma seção Markdown de encerramento e redes sociais. Essas seções SHALL permanecer personalizáveis conforme guide-editor.

Origem: `docs/requisitos-v1.md`, linhas 150. Classificação: modelo proposto.

#### Scenario: SM-086.1 — Preencher o modelo
- **WHEN** o autor escreve uma mensagem final e seus links
- **THEN** o encerramento aparece com os links como conteúdo Markdown editável

### Requirement: SM-087 — Justificativa das trocas

No modelo proposto, o sistema SHALL oferecer um campo Markdown para justificar as entradas e saídas do sideboard, separado das listas de troca.

Origem: `docs/requisitos-v1.md`, linhas 156. Classificação: modelo proposto.

#### Scenario: SM-087.1 — Explicar o sideboard
- **WHEN** o autor escreve o motivo das trocas
- **THEN** o texto aparece associado ao plano sem ser interpretado como uma lista de cartas.

### Requirement: SM-088 — Estratégia do matchup

No modelo proposto, o sistema SHALL oferecer um campo Markdown próprio para o plano de jogo do matchup.

Origem: `docs/requisitos-v1.md`, linhas 157. Classificação: modelo proposto.

#### Scenario: SM-088.1 — Explicar a postura
- **WHEN** o autor descreve quando pressionar e quando controlar
- **THEN** a estratégia é salva separadamente e renderizada no plano correspondente.

### Requirement: SM-089 — Interações e cuidados técnicos

No modelo proposto, o sistema SHALL oferecer um campo Markdown para interações e cuidados técnicos com referências a cartas.

Origem: `docs/requisitos-v1.md`, linhas 158. Classificação: modelo proposto.

#### Scenario: SM-089.1 — Registrar uma interação
- **WHEN** o autor explica uma interação entre cartas nesse campo
- **THEN** o texto renderizado e as referências ficam associados ao confronto.

### Requirement: SM-090 — Ajustes sugeridos no confronto

No modelo proposto, o sistema SHALL oferecer um campo Markdown para ajustes sugeridos, mantendo a avaliação e sua justificativa segundo matchup-plans.

Origem: `docs/requisitos-v1.md`, linhas 159. Classificação: modelo proposto.

#### Scenario: SM-090.1 — Sugerir uma alteração futura
- **WHEN** o autor recomenda mais uma carta para um metagame específico
- **THEN** a sugestão aparece como conteúdo editorial e não altera automaticamente a lista base.
