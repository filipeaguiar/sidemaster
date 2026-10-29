# Main deck visual

Verificado em 28/10/2026, a partir da referência visual fornecida pelo usuário.

## Composição

- Main deck e sideboard possuem painéis próprios com cabeçalho, arte automática, arquétipo, versão, cores e contagens.
- Grade organizada por tipo, com uma pilha por identidade de carta e imagens sobrepostas por cópia. Até quatro cópias são desenhadas; o rótulo sempre mantém a quantidade exata.
- Nomes e quantidades continuam visíveis sem interação. Hover amplia a imagem; clique/toque abre um diálogo que pode ser fechado. No HTML independente, os links abrem a imagem completa.
- Tipos múltiplos não duplicam a carta: criaturas artefato entram em Criaturas, terrenos artefato em Terrenos.
- Terminologia solicitada: Mágicas Instantâneas.
- Curva de mana usa quantidades e exclui terrenos. Dados vêm da consulta já existente, sem chamadas extras de estatísticas.
- Resultados reconhecidos ficam disponíveis de forma síncrona na renderização seguinte, evitando reconstruir pilhas conhecidas como placeholders durante a edição.
- Política de 750 ms, fila de requisições e cache de falhas por nome preservada.

## Evidências

- `node --test tests/*.test.mjs`: 18 testes passaram, incluindo grupos sem duplicação, curva, cores, limite de imagens, quantidade exata, aliases de identidade, cartas não encontradas e escape de texto.
- `openspec validate deck-visualization --strict --json --no-interactive`: passou; especificação ajustada para o refinamento visual solicitado.
- Navegador integrado: lista de demonstração com 60 cartas, 17 identidades, 60 imagens carregadas e nenhum erro de consulta. Grupos: Criaturas 12, Artefatos 12, Encantamentos 2, Mágicas Instantâneas 10, Feitiços 4, Terrenos 20.
- Diálogo de ampliação de Myr Enforcer aberto e fechado pela UI.
- HTML baixado e inspecionado: 17 pilhas, 60 imagens de cópias e curva de mana.
- Patreon baixado e inspecionado: 17 imagens de cartas do deck, quantidades preservadas, além de 14 imagens dos exemplos de mãos. Sem classes, estilos, scripts ou atributos de dados. A composição de pilhas é simplificada para uma imagem por identidade nessa saída.
- Viewport 390 × 900: grade de duas colunas, sem transbordamento horizontal da página ou da prévia. Viewport original restaurado após a verificação.
- A lista de exemplo foi inserida somente no guia de demonstração já existente, identificado como Grixis Affinity — demonstração visual. Os quatro guias anteriores não foram editados.
- Captura: `docs/main-deck-visual.png`.

Impressão utiliza os mesmos componentes e estilos com regras para A4; não foi gerado um novo PDF nesta verificação. O Firefox externo do usuário não está disponível para automação nesta sessão.
