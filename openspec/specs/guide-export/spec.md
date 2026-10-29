## Purpose

Leitura contínua e exportação dos guias para HTML, PDF e JSON.

## Requirements

### Requirement: SM-065 — Guia web de leitura contínua

O sistema SHALL renderizar o guia web como um documento contínuo na ordem das seções, com os dados de listas, planos e mãos associados ao guia.

Origem: `docs/requisitos-v1.md`, linhas 112. Classificação: confirmado.

#### Scenario: SM-065.1 — Ler todo o guia
- **WHEN** o documento é aberto no modo de leitura
- **THEN** é possível percorrer as seções em sequência, incluindo aquelas que não estavam selecionadas no editor.

### Requirement: SM-066 — HTML com imagens remotas

O sistema SHALL exportar um arquivo HTML com texto e estilos incorporados e imagens de cartas referenciadas por URLs remotas. Os comportamentos de hover e toque SHALL funcionar no arquivo por recursos nele incorporados, sem depender do aplicativo de edição.

Origem: `docs/requisitos-v1.md`, linhas 113. Classificação: confirmado.

#### Scenario: SM-066.1 — Abrir o arquivo exportado
- **WHEN** o HTML é aberto em outro navegador com acesso às imagens
- **THEN** o texto, a diagramação, as pilhas e as interações de cartas são reproduzidos a partir do arquivo.

#### Scenario: SM-066.2 — Ler sem carregar imagens
- **WHEN** o arquivo é aberto sem conseguir acessar as URLs de imagens
- **THEN** o texto e os estilos continuam disponíveis, com nomes e quantidades legíveis como alternativa às imagens.

### Requirement: SM-067 — PDF A4 com paginação automática

O sistema SHALL exportar um PDF em páginas A4, com fluxo contínuo e quebras automáticas, preservando conteúdo, ordem das seções e legibilidade dos blocos visuais.

Origem: `docs/requisitos-v1.md`, linhas 114. Classificação: confirmado.

#### Scenario: SM-067.1 — Paginar um guia extenso
- **WHEN** um guia ultrapassa uma página A4 e contém pilhas, tabelas e mãos
- **THEN** o PDF distribui o conteúdo por páginas A4 e conserva nomes, quantidades, imagens e textos sem cortes que os tornem ilegíveis.

#### Scenario: SM-067.2 — Leitura das cartas no PDF
- **WHEN** o guia contém referências de texto e imagens explícitas
- **THEN** os nomes ficam legíveis e as imagens explícitas são incorporadas ao PDF, conforme card-markdown.

### Requirement: SM-068 — Cópia editável JSON completa

O sistema SHALL exportar e importar um arquivo JSON que preserve os campos Markdown e a estrutura completa do guia, incluindo suas listas, identidade, seções, ordem, matchups, variantes, substituições de campos e mãos.

Origem: `docs/requisitos-v1.md`, linhas 115. Classificação: confirmado.

#### Scenario: SM-068.1 — Exportar e reimportar
- **WHEN** um guia com seções personalizadas, variantes e mãos é exportado e importado em um ambiente vazio
- **THEN** o guia recuperado mantém todos os dados e o conteúdo Markdown originais.

#### Scenario: SM-068.2 — Distinguir herança de vazio
- **WHEN** uma variante contém um campo herdado e outro substituído por texto vazio
- **THEN** o JSON preserva a diferença e a prévia após importação reproduz os dois comportamentos.

#### Scenario: SM-068.3 — Arquivo inválido
- **WHEN** a importação recebe JSON inválido ou estrutura incompatível
- **THEN** o aplicativo informa o problema e preserva os guias já existentes.

### Requirement: SM-069 — Portabilidade do arquétipo e da versão

O sistema SHALL permitir continuar a edição após importar o JSON em outro navegador ou computador, conservando a identificação da versão e sua associação ao arquétipo.

Origem: `docs/requisitos-v1.md`, linhas 116. Classificação: confirmado.

#### Scenario: SM-069.1 — Transferir o guia
- **WHEN** o arquivo exportado é importado em outro navegador
- **THEN** o guia aparece no arquétipo correspondente, com sua identificação de versão e campos editáveis.
