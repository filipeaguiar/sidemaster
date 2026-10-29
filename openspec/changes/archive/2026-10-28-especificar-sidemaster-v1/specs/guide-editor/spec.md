## ADDED Requirements

### Requirement: SM-010 — Editor em duas colunas

O sistema SHALL apresentar a área de edição à esquerda e a prévia visual à direita no layout de trabalho com duas colunas.

Origem: `docs/requisitos-v1.md`, linhas 33. Classificação: confirmado.

#### Scenario: SM-010.1 — Editar com prévia visível
- **WHEN** o guia é aberto no layout de trabalho
- **THEN** os campos de edição e o resultado visual estão disponíveis simultaneamente nas respectivas colunas.

### Requirement: SM-011 — Sumário hierárquico recolhível

O sistema SHALL oferecer, dentro da coluna de edição, um sumário hierárquico recolhível das seções, matchups e seus itens editáveis.

Origem: `docs/requisitos-v1.md`, linhas 34. Classificação: confirmado.

#### Scenario: SM-011.1 — Navegar na hierarquia
- **WHEN** a pessoa expande Matchups e UB Faeries no sumário
- **THEN** ela encontra o plano geral, suas variantes e mãos cadastradas, podendo recolher a navegação.

### Requirement: SM-012 — Uma seção selecionada por vez

O sistema SHALL mostrar os campos de uma única seção ou item de matchup selecionado por vez na coluna de edição.

Origem: `docs/requisitos-v1.md`, linhas 35. Classificação: confirmado.

#### Scenario: SM-012.1 — Trocar a seleção
- **WHEN** a pessoa seleciona UB Faeries depois de editar Main deck
- **THEN** os campos de UB Faeries ocupam a área de edição e o conteúdo já digitado no deck é preservado.

### Requirement: SM-013 — Prévia do guia completo

O sistema SHALL manter o documento inteiro na coluna de prévia, na ordem vigente das seções, mesmo quando apenas uma seção estiver selecionada para edição.

Origem: `docs/requisitos-v1.md`, linhas 36. Classificação: confirmado.

#### Scenario: SM-013.1 — Selecionar uma parte do documento
- **WHEN** a pessoa seleciona um matchup
- **THEN** a prévia continua contendo apresentação, listas, demais matchups e encerramento do guia.

#### Scenario: SM-013.2 — Atualizar um campo
- **WHEN** a pessoa altera um campo Markdown
- **THEN** o trecho correspondente é atualizado na prévia integral.

### Requirement: SM-014 — Navegação sincronizada à seleção

O sistema SHALL rolar a prévia integral até o trecho correspondente quando a pessoa selecionar uma seção no sumário.

Origem: `docs/requisitos-v1.md`, linhas 37. Classificação: confirmado.

#### Scenario: SM-014.1 — Localizar o trecho selecionado
- **WHEN** a pessoa escolhe Mãos iniciais de UB Faeries no sumário
- **THEN** a prévia posiciona o trecho desse item em uma região visível.

### Requirement: SM-015 — Campos Markdown separados

O sistema SHALL armazenar e editar as partes do guia em campos Markdown separados, preservando o conteúdo de cada campo nas trocas de seleção e na persistência.

Origem: `docs/requisitos-v1.md`, linhas 38. Classificação: confirmado.

#### Scenario: SM-015.1 — Editar duas partes
- **WHEN** a pessoa escreve a estratégia de um matchup e depois sua justificativa de sideboard
- **THEN** os dois textos ficam em campos distintos e são recuperados sem concatenação ou perda.

#### Scenario: SM-015.2 — Renderizar Markdown
- **WHEN** um campo contém título, lista, ênfase e link
- **THEN** a prévia renderiza esses elementos segundo sua sintaxe.

### Requirement: SM-016 — Modelo baseado no guia de referência

O sistema SHALL oferecer um modelo inicial inspirado na organização do PPTX fornecido, usando o contrato proposto em guide-template como detalhamento editorial.

Origem: `docs/requisitos-v1.md`, linhas 39. Classificação: confirmado.

#### Scenario: SM-016.1 — Criar a partir do modelo
- **WHEN** a pessoa inicia um guia pelo modelo
- **THEN** recebe a estrutura inicial de apresentação, informações sobre o deck, listas, maybeboard, matchups e encerramento editáveis.

### Requirement: SM-017 — Personalização das seções

O sistema SHALL permitir adicionar, renomear, excluir e reordenar seções do guia, refletindo as alterações no sumário, na prévia e nas exportações.

Origem: `docs/requisitos-v1.md`, linhas 40. Classificação: confirmado.

#### Scenario: SM-017.1 — Adicionar e renomear
- **WHEN** a pessoa adiciona uma seção e a nomeia Notas de torneio
- **THEN** a seção fica disponível no sumário e na prévia com esse nome.

#### Scenario: SM-017.2 — Excluir e reordenar
- **WHEN** a pessoa exclui uma seção e move outra para o início
- **THEN** o documento salvo e exportado usa a nova sequência e omite a seção excluída.

### Requirement: SM-018 — Acesso às informações e verificações

O sistema SHALL integrar o painel de informações e verificações do guia ao editor, conforme guide-status-panel.

Origem: `docs/requisitos-v1.md`, linhas 41. Classificação: confirmado.

#### Scenario: SM-018.1 — Consultar o estado do guia
- **WHEN** a pessoa está editando uma seção
- **THEN** ela consegue consultar o resumo e os detalhes das verificações a partir do editor.
