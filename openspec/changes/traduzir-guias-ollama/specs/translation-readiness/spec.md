## MODIFIED Requirements

### Requirement: SM-070 — Tradução por LLM em fase posterior

O sistema SHALL oferecer execução opcional de tradução por LLM local via Ollama no aplicativo desktop, conforme ollama-connection, guide-translation e translation-workspace, e manter os fluxos existentes utilizáveis sem provedor, credenciais ou execução de tradução. A integração SHALL evoluir a preparação dos dados sem tornar a tradução pré-requisito para usar os guias.

Origem: evolução de `docs/requisitos-v1.md`, linha 120, pela change `traduzir-guias-ollama`.

#### Scenario: SM-070.1 — Usar a primeira versão
- **WHEN** a pessoa cria, edita, salva e exporta um guia na v1
- **THEN** esses fluxos funcionam sem configurar nem executar uma LLM.

#### Scenario: Executar tradução opcional no desktop
- **WHEN** a pessoa abre Traduções com Ollama local e modelo compatível disponíveis
- **THEN** consegue iniciar a tradução gerenciada do guia sem sobrescrever o texto original.

### Requirement: SM-072 — Preservação dos elementos estruturados

O sistema SHALL representar referências de cartas, quantidades e comandos de formatação de forma que a transformação de idioma preserve seus vínculos e estrutura. O contrato de tradução SHALL exigir essa preservação e sua verificação antes de aceitar uma unidade, incluindo resultados editados manualmente.

Origem: evolução de `docs/requisitos-v1.md`, linha 122, pela change `traduzir-guias-ollama`.

#### Scenario: SM-072.1 — Definir o contrato de transformação
- **WHEN** um campo contém uma referência, uma imagem explícita, uma quantidade e formatação Markdown
- **THEN** a representação estruturada identifica esses elementos e permite comparar a preservação antes e depois da transformação de idioma.

#### Scenario: Rejeitar unidade que danifica referência
- **WHEN** uma transformação altera uma referência de carta, quantidade ou estrutura protegida
- **THEN** a unidade é sinalizada e exige correção antes de compor uma tradução completa.
