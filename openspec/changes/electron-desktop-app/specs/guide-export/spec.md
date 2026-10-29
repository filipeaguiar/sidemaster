## MODIFIED Requirements

### Requirement: SM-067 — PDF A4 com paginação automática

O sistema SHALL exportar um PDF em páginas A4, com fluxo contínuo e quebras automáticas, preservando conteúdo, ordem das seções e legibilidade dos blocos visuais. No Electron, SHALL gerar o PDF diretamente pelo mecanismo de impressão do aplicativo e oferecer diálogo nativo de salvamento, sem exigir uma janela de impressão manual do navegador.

Origem: `docs/requisitos-v1.md`, linhas 114; revisão desktop em `electron-desktop-app`.

#### Scenario: SM-067.1 — Paginar um guia extenso
- **WHEN** um guia ultrapassa uma página A4 e contém pilhas, tabelas e mãos
- **THEN** o PDF distribui o conteúdo por páginas A4 e conserva nomes, quantidades, imagens e textos sem cortes que os tornem ilegíveis.

#### Scenario: SM-067.2 — Leitura das cartas no PDF
- **WHEN** o guia contém referências de texto e imagens explícitas
- **THEN** os nomes ficam legíveis e as imagens explícitas disponíveis são incorporadas ao PDF, conforme card-markdown.

#### Scenario: Gerar PDF com imagens locais sem rede
- **WHEN** a pessoa exporta um guia no Electron sem rede e as imagens estão em cache
- **THEN** o PDF incorpora essas imagens sem exigir novo download.

#### Scenario: Carta sem imagem disponível
- **WHEN** uma imagem não está em cache e não pode ser obtida dentro do prazo de preparação
- **THEN** o PDF mantém nome e quantidade legíveis e a exportação informa a indisponibilidade sem aguardar indefinidamente.

#### Scenario: Cancelar ou falhar na geração
- **WHEN** a pessoa cancela o destino ou a geração/gravação falha
- **THEN** o app distingue cancelamento de erro, não afirma que o arquivo foi salvo, libera os recursos de impressão e mantém o editor aberto.

### Requirement: SM-068 — Cópia editável JSON completa

O sistema SHALL exportar e importar um guia por operação em um arquivo JSON que preserve os campos Markdown e a estrutura completa do guia, incluindo listas, identidade, seções, ordem, matchups, variantes, substituições de campos e mãos. A exportação SHALL incluir apenas o guia selecionado, preservando o envelope versionado com exatamente um item em `guides`. O app SHALL aceitar objetos legados de guia e oferecer seleção de um único guia ao abrir um arquivo legado de biblioteca, sem importação em lote nem sobrescrita silenciosa por ID.

Origem: `docs/requisitos-v1.md`, linhas 115; revisão de escopo por guia em `electron-desktop-app`.

#### Scenario: SM-068.1 — Exportar e reimportar
- **WHEN** um guia com seções personalizadas, variantes e mãos é exportado e importado em um ambiente vazio
- **THEN** o guia recuperado mantém todos os dados e o conteúdo Markdown originais.

#### Scenario: SM-068.2 — Distinguir herança de vazio
- **WHEN** uma variante contém um campo herdado e outro substituído por texto vazio
- **THEN** o JSON preserva a diferença e a prévia após importação reproduz os dois comportamentos.

#### Scenario: SM-068.3 — Arquivo inválido
- **WHEN** a importação recebe JSON inválido ou estrutura incompatível
- **THEN** o aplicativo informa o problema e preserva os guias já existentes.

#### Scenario: Exportar somente o guia selecionado
- **WHEN** a biblioteca possui vários guias e a pessoa exporta o guia ativo
- **THEN** o arquivo contém somente o snapshot atual desse guia, incluindo a edição corrente, sem os outros guias, cache ou preferências globais.

#### Scenario: Abrir arquivo legado de biblioteca
- **WHEN** a pessoa seleciona um JSON legado que contém vários guias válidos
- **THEN** o app apresenta uma escolha de guia e importa somente o escolhido, preservando todos os demais dados da biblioteca.

#### Scenario: Importar ID existente
- **WHEN** o guia escolhido possui ID já presente na biblioteca
- **THEN** a importação informa o conflito e preserva o guia existente sem sobrescrita.

### Requirement: SM-069 — Portabilidade do arquétipo e da versão

O sistema SHALL permitir continuar a edição após importar o JSON de um guia em outro navegador, aplicativo Electron ou computador, conservando a identificação da versão e sua associação ao arquétipo.

Origem: `docs/requisitos-v1.md`, linhas 116; extensão desktop em `electron-desktop-app`.

#### Scenario: SM-069.1 — Transferir o guia
- **WHEN** o arquivo exportado é importado em outro ambiente suportado
- **THEN** o guia aparece no arquétipo correspondente, com sua identificação de versão e campos editáveis.

## ADDED Requirements

### Requirement: Resultado das exportações nativas
No Electron, o sistema SHALL oferecer diálogos de destino para JSON, HTML, HTML Patreon e PDF e confirmar sucesso somente após a gravação do arquivo. Cancelamento e falha SHALL ter resultados distintos, sem alterar ou excluir o guia.

#### Scenario: Confirmar exportação concluída
- **WHEN** o arquivo é gravado com sucesso no destino escolhido
- **THEN** o app confirma a conclusão da exportação correspondente.

#### Scenario: Cancelar o destino
- **WHEN** a pessoa cancela o diálogo de salvamento
- **THEN** nenhum arquivo novo é gravado e a interface não apresenta sucesso nem falha de exportação.

#### Scenario: Exportar falha por falta de permissão
- **WHEN** o destino escolhido não pode ser gravado
- **THEN** o app apresenta o erro e mantém a edição disponível para selecionar outro destino.
