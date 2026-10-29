## ADDED Requirements

### Requirement: SM-028 — Main deck e sideboard separados

O sistema SHALL apresentar main deck e sideboard em blocos visualmente identificados e separados.

Origem: `docs/requisitos-v1.md`, linhas 60. Classificação: confirmado.

#### Scenario: SM-028.1 — Carta nas duas zonas
- **WHEN** uma carta tem três cópias no main deck e uma no sideboard
- **THEN** cada zona apresenta seu próprio bloco e a quantidade correspondente.

### Requirement: SM-029 — Agrupamento por tipo

O sistema SHALL organizar as cartas em grupos de tipo sem duplicar a contagem de uma carta por ela ter múltiplos tipos. A convenção de grupo principal é detalhada no design.

Origem: `docs/requisitos-v1.md`, linhas 61. Classificação: confirmado.

#### Scenario: SM-029.1 — Agrupar artefatos com outro tipo
- **WHEN** a lista contém uma criatura artefato e um terreno artefato
- **THEN** cada carta aparece em um único grupo principal e os totais permanecem iguais aos da lista.

### Requirement: SM-030 — Pilhas parcialmente sobrepostas

O sistema SHALL renderizar cada grupo de cartas como uma pilha com sobreposição parcial das imagens.

Origem: `docs/requisitos-v1.md`, linhas 62. Classificação: confirmado.

#### Scenario: SM-030.1 — Renderizar um grupo
- **WHEN** um grupo contém três cartas distintas
- **THEN** as três imagens formam uma pilha compacta com sobreposição parcial.

### Requirement: SM-031 — Nomes e quantidades visíveis

O sistema SHALL manter o nome e a quantidade de cada carta visíveis na pilha compacta, sem depender de hover para ler essas informações.

Origem: `docs/requisitos-v1.md`, linhas 63. Classificação: confirmado.

#### Scenario: SM-031.1 — Ler a pilha sem interação
- **WHEN** a pessoa consulta um grupo compacto sem passar o mouse
- **THEN** ela consegue identificar o nome e a quantidade de todas as cartas do grupo.

### Requirement: SM-032 — Uma imagem por carta distinta

O sistema SHALL mostrar uma imagem por identidade distinta de carta em cada zona do deck, com quantidade agregada, em vez de repetir as imagens por cópia.

Origem: `docs/requisitos-v1.md`, linhas 64. Classificação: confirmado.

#### Scenario: SM-032.1 — Agregar repetições
- **WHEN** a mesma identidade aparece em linhas equivalentes da lista e totaliza quatro cópias
- **THEN** a zona exibe uma imagem com quantidade quatro.

### Requirement: SM-033 — Imagem completa no hover e toque

O sistema SHALL permitir visualizar a imagem completa de uma carta da pilha ao passar o mouse ou tocar, oferecendo uma forma de encerrar a visualização ampliada.

Origem: `docs/requisitos-v1.md`, linhas 65. Classificação: confirmado.

#### Scenario: SM-033.1 — Abrir pelo mouse
- **WHEN** a pessoa passa o mouse sobre uma carta compacta
- **THEN** a imagem completa fica visível.

#### Scenario: SM-033.2 — Abrir por toque
- **WHEN** a pessoa toca na carta em um dispositivo de toque
- **THEN** a imagem completa abre e pode ser fechada.

### Requirement: SM-034 — Escolha automática da imagem

O sistema SHALL selecionar automaticamente uma imagem disponível da carta resolvida na primeira versão. A identidade da carta SHALL permanecer independente da edição usada pela imagem.

Origem: `docs/requisitos-v1.md`, linhas 66. Classificação: confirmado.

#### Scenario: SM-034.1 — Carta com várias edições
- **WHEN** a carta resolvida possui diferentes edições com imagem
- **THEN** uma imagem é escolhida automaticamente e o guia pode ser editado e exportado sem selecionar edição ou arte.
