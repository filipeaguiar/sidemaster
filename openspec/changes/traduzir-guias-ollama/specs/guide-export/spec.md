## MODIFIED Requirements

### Requirement: SM-065 — Guia web de leitura contínua

O sistema SHALL renderizar o guia web como um documento contínuo na ordem das seções, com os dados de listas, planos e mãos associados ao guia. SHALL respeitar o idioma e a direção de leitura declarados no guia, localizar rótulos fixos e valores categóricos apresentados ao leitor por catálogo português/inglês e utilizar inglês como fallback informado para outros idiomas. HTML, PDF e HTML Patreon SHALL utilizar a mesma leitura localizada sem alterar os valores internos dos campos categóricos.

Origem: `docs/requisitos-v1.md`, linha 112, e evolução pela change `traduzir-guias-ollama`.

#### Scenario: SM-065.1 — Ler todo o guia
- **WHEN** o documento é aberto no modo de leitura
- **THEN** é possível percorrer as seções em sequência, incluindo aquelas que não estavam selecionadas no editor.

#### Scenario: Exportar cópia em inglês
- **WHEN** uma cópia traduzida com idioma `en` é visualizada ou exportada para HTML, PDF ou HTML Patreon
- **THEN** textos autorais traduzidos e rótulos de leitura aparecem em inglês, preservando cartas, estrutura e valores internos usados pelo editor.

#### Scenario: Idioma sem catálogo de rótulos
- **WHEN** o conteúdo está em outro idioma sem catálogo de leitura disponível
- **THEN** o texto traduzido permanece nesse idioma e os rótulos usam inglês, conforme aviso na área Traduções; o idioma e a direção do conteúdo são aplicados ao documento HTML ou contêiner Patreon.

### Requirement: SM-068 — Cópia editável JSON completa

O sistema SHALL exportar e importar um arquivo JSON que preserve os campos Markdown e a estrutura completa do guia, incluindo suas listas, identidade, seções, ordem, matchups, variantes, substituições de campos e mãos. SHALL preservar idioma, procedência de cópias e registros de tradução do guia exportado, incluindo snapshot, configuração, resultados, revisões e checkpoints, sem iniciar geração ao importar. Guias legados sem esses campos SHALL continuar importáveis, com idioma padrão `pt-BR` e sem traduções.

Origem: `docs/requisitos-v1.md`, linha 115, e evolução pela change `traduzir-guias-ollama`.

#### Scenario: SM-068.1 — Exportar e reimportar
- **WHEN** um guia com seções personalizadas, variantes e mãos é exportado e importado em um ambiente vazio
- **THEN** o guia recuperado mantém todos os dados e o conteúdo Markdown originais.

#### Scenario: SM-068.2 — Distinguir herança de vazio
- **WHEN** uma variante contém um campo herdado e outro substituído por texto vazio
- **THEN** o JSON preserva a diferença e a prévia após importação reproduz os dois comportamentos.

#### Scenario: SM-068.3 — Arquivo inválido
- **WHEN** a importação recebe JSON inválido ou estrutura incompatível
- **THEN** o aplicativo informa o problema e preserva os guias já existentes.

#### Scenario: Transportar rascunho e cópia traduzida
- **WHEN** um guia com tradução parcial e uma cópia traduzida são exportados e importados individualmente em outro perfil
- **THEN** o primeiro conserva o rascunho retomável e a segunda conserva seu conteúdo, idioma e edição independente, sem exigir o original para leitura nem iniciar inferência automaticamente.
