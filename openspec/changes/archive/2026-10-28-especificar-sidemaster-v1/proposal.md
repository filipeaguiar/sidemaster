## Why

O SideMaster precisa transformar os requisitos acordados em contratos verificáveis para construir guias Pauper com conteúdo Markdown, cartas visuais e exportação. A especificação deve preservar a organização por arquétipo, as versões como guias independentes e as decisões de edição registradas em `docs/requisitos-v1.md`.

## What Changes

- Especificar cada item confirmado com identificação própria, comportamento normativo e cenários de aceitação.
- Organizar os contratos em 14 capacidades e registrar uma matriz de rastreabilidade para todos os itens do documento de origem.
- Documentar a sintaxe e o modelo apresentados na entrevista como propostas de detalhamento, identificando sua origem.
- Registrar as recomendações técnicas como decisões propostas no design.
- Especificar a preparação para tradução e manter a execução por LLM em fase posterior.
- Preparar design e tarefas de implementação; esta mudança entrega os artefatos de planejamento.

## Capabilities

### New Capabilities

- `guide-storage`: uso pessoal, salvamento automático, recuperação e estado do salvamento.
- `archetype-library`: agrupamento por arquétipo e guias independentes para cada versão do metagame.
- `guide-editor`: duas colunas, campos Markdown, sumário, personalização e prévia integral sincronizada à seleção.
- `card-catalog`: reconhecimento bilíngue, imagens e dados do Scryfall, preservando a identidade da carta.
- `deck-lists`: listas Markdown de main deck e sideboard para Pauper e origem comum de seus dados.
- `deck-visualization`: grupos por tipo, pilhas compactas, quantidades e interação com imagens.
- `matchup-plans`: arquétipo adversário, plano geral, variantes com campos herdados e avaliação qualitativa.
- `opening-hands`: exemplos de sete cartas com cenário, decisão e justificativa.
- `guide-validation`: legalidade, contagens, referências, trocas de sideboard e tamanho das mãos.
- `guide-status-panel`: resumo expansível e problemas associados a campos, com ações disponíveis.
- `guide-export`: leitura web, HTML, PDF A4 e cópia editável JSON.
- `translation-readiness`: preparação de dados para tradução futura por LLM.
- `card-markdown`: detalhamento proposto para referências, imagens de cartas e compatibilidade com Markdown comum.
- `guide-template`: detalhamento proposto do modelo de seções e campos baseado no documento de origem.

### Modified Capabilities

Nenhuma. O projeto ainda não tem specs de capacidades existentes.

## Impact

- Artefatos locais em `openspec/changes/especificar-sidemaster-v1/`; o documento de requisitos é preservado.
- A implementação futura envolve interface web, persistência no navegador, integração com Scryfall e renderização/exportação do guia.
- O uso inicial é pessoal e a execução de tradução por LLM permanece em fase posterior.
- A matriz distingue requisitos confirmados, detalhamentos propostos, recomendações técnicas e critérios de aceite repetidos.
