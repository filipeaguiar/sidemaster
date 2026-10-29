## ADDED Requirements

### Requirement: SM-070 — Tradução por LLM em fase posterior

O sistema SHALL reservar a execução de tradução por LLM para uma etapa posterior e manter os fluxos da v1 utilizáveis sem provedor, credenciais ou execução de tradução. Esta capacidade especifica preparação dos dados.

Origem: `docs/requisitos-v1.md`, linhas 120. Classificação: confirmado.

#### Scenario: SM-070.1 — Usar a primeira versão
- **WHEN** a pessoa cria, edita, salva e exporta um guia na v1
- **THEN** esses fluxos funcionam sem configurar nem executar uma LLM.

### Requirement: SM-071 — Conteúdo endereçável por campo

O sistema SHALL preservar campos Markdown separados e identificáveis por guia e seção, permitindo que uma integração futura enderece uma parte do documento para tradução.

Origem: `docs/requisitos-v1.md`, linhas 121. Classificação: confirmado.

#### Scenario: SM-071.1 — Identificar uma parte traduzível
- **WHEN** o guia possui apresentação e justificativas de diferentes matchups
- **THEN** cada campo pode ser identificado separadamente sem extrair o texto de um HTML ou PDF renderizado.

### Requirement: SM-072 — Preservação dos elementos estruturados

O sistema SHALL representar referências de cartas, quantidades e comandos de formatação de forma que uma futura transformação de idioma preserve seus vínculos e estrutura. O contrato de tradução SHALL exigir essa preservação.

Origem: `docs/requisitos-v1.md`, linhas 122. Classificação: confirmado.

#### Scenario: SM-072.1 — Definir o contrato de transformação
- **WHEN** um campo contém uma referência, uma imagem explícita, uma quantidade e formatação Markdown
- **THEN** a representação estruturada identifica esses elementos e permite comparar a preservação antes e depois de uma futura transformação de idioma.
