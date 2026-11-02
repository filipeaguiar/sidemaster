## Context

O checkout usa módulos JavaScript, árvore editorial recursiva, persistência de guias e Electron. A análise estática identificou:

- `renderMarkdown()` já reconhece links inline HTTP/HTTPS, mas `collectGuideCardNames()` em `src/cards.js` coleta indiscriminadamente textos entre colchetes. O handler de abertura externa em `electron/main.cjs` aceita somente HTTPS.
- `src/translation-ui.js` compara hashes de snapshots e mostra Original alterado. A execução mantém o snapshot anterior e só inventaria novamente ao criar outro registro. O reaproveitamento atual inclui índices de parágrafo na chave.
- As unidades de tradução são blocos visuais com partes internas; `sourceHash`, `path`, intervalos e planos de segmentação pertencem àquela versão da origem.
- `renderEditor()` oferece três opções em Momento quando há matchup, mas apenas Pré-side em mãos gerais. O modelo permite grupos de mãos em subseções recursivas.

As capacidades `guide-translation` e `translation-workspace` ainda pertencem à change ativa `traduzir-guias-ollama`, não às specs principais. Por isso, esta proposta acrescenta `translation-freshness` e registra explicitamente a evolução do comportamento; não usa MODIFIED contra uma spec principal inexistente. Ao integrar/arquivar as changes, os contratos de detecção de mudança e estado de atualização deverão ser reconciliados: o histórico conserva snapshots imutáveis e o espaço de trabalho passa a representar automaticamente a origem atual.

## Goals / Non-Goals

**Goals:**

- Interpretar links externos e cartas com regras consistentes em coleta, renderização e tradução.
- Atualizar automaticamente a pendência de tradução no menor bloco visual afetado, conservando resultados válidos e histórico.
- Tornar os seletores de mãos completos em todos os destinos, com verificação visual e de persistência.

**Non-Goals:**

- Adotar um editor visual novo, ampliar o dialeto Markdown além dos contratos afetados, traduzir automaticamente após cada tecla ou instalar modelos.
- Retraduzir cópias independentes existentes, redefinir cenários de mãos legadas ou concluir tarefas pendentes de outras changes sem sua validação própria.

## Decisions

### 1. Compartilhar a distinção entre links e cartas

Reconhecer construções Markdown com destino antes de processar a notação de carta. O teste de protocolo aplica-se ao início do destino: `[artigo](https://example.org)` é link e `[Myr Enforcer]` continua sendo carta. Rótulos e destinos de links/imagens comuns, definições de referência e código não devem vazar para a coleta de cartas. Preservar o contrato existente de imagens comuns e referências explicitamente definidas.

Extrair uma rotina de classificação/tokenização reutilizável pelos consumidores afetados, evitando que uma correção apenas na renderização deixe consultas indevidas ou proteções de tradução divergentes. URLs devem manter query strings, fragmentos e escaping de atributos. Conteúdo incompleto durante digitação permanece editável; destinos fora dos protocolos aceitos não viram links externos executáveis. Uma URL isolada não ganha nova sintaxe de autolink por esta change.

Alternativa considerada: ajustar somente a regex de HTML. Ela não resolve a coleta de rótulos em `cards.js`. Uma biblioteca completa só se justifica se a análise de compatibilidade mostrar que a rotina compartilhada não consegue preservar o contrato atual.

No Electron, aceitar HTTP e HTTPS no handler existente de abertura externa, mantendo validação de URL e bloqueio da navegação interna. Verificar abertura real dos dois protocolos, além da marcação HTML.

### 2. Reconciliar o rascunho existente com uma nova revisão da origem

Adicionar uma operação de reconciliação determinística entre o snapshot salvo, suas unidades e o inventário atual. Executá-la ao entrar/voltar à aba e antes das ações que dependem de atualidade. O ponto de invalidação é o bloco visual traduzível, não cada tecla nem somente o guia inteiro.

Manter `translationId`, idiomas e configuração do registro. Arquivar origem, resultado, revisão e partes anteriores dos blocos afetados antes de atualizar o snapshot corrente; regenerar hashes, proteções, intervalos e planos desses blocos, deixando-os `pending`, sem revisão e sem resultado corrente aceito. O rótulo de interface será Não traduzido — original alterado. O histórico deve guardar dados suficientes para recuperar a versão anterior sem tratá-la como tradução atual.

Reutilizar o formato `history` existente quando suficiente; se forem necessários campos persistidos adicionais, validar e migrar retrocompativelmente pelo modelo/repositório. Não criar um registro por alteração: isso consumiria o limite de cinco traduções por guia. Detectar excedentes dos limites existentes antes de confirmar o checkpoint e informar a falha sem descartar histórico.

Alternativas consideradas: manter apenas Original alterado não atende à pendência por trecho; apagar todo o rascunho perde revisão humana; gerar uma nova execução automaticamente cria duplicatas e consome o limite de registros.

### 3. Corresponder conteúdo sem depender de índices absolutos

Restringir o reaproveitamento ao mesmo guia/idioma, identidade estável do nó, campo/subcampo e configuração compatível. Dentro de cada campo, alinhar a sequência de blocos por conteúdo exato e estrutura protegida, usando hashes como índice e igualdade como confirmação. Preservar ordem relativa e usar vizinhança para resolver repetições; correspondências ambíguas ficam pendentes em vez de transferir revisão humana a outro bloco. Índices e intervalos são recalculados após o alinhamento.

Blocos idênticos deslocados conservam resultado; inseridos ficam pendentes; excluídos saem do documento e dos totais, mantendo histórico. Nós duplicados têm novos IDs e são conteúdo novo. Movimentação com os mesmos IDs não invalida texto. Mudanças em cartas, opções de mão, listas e outros campos de cópia direta atualizam a projeção estruturada sem chamadas ao modelo. Overrides de variantes conservam a distinção entre herança e vazio explícito.

Planos de partes internas pertencem ao conteúdo original do bloco. Uma alteração invalida o bloco e seu plano antigo, preservado no histórico; otimizar o reaproveitamento dentro de um bloco alterado fica fora desta proposta.

### 4. Refletir a atualidade no progresso e nos checkpoints

Usar o inventário reconciliado como fonte para árvore, filtros, revisão, prévia e bloqueio da cópia. A prévia mostra origem atual e pendência explícita nos blocos alterados; resultados antigos são acessados pelo histórico. Invalidar caches das duas colunas após reconciliação.

Salvar pela mesma fila do editor antes de continuar geração. Cada requisição e confirmação manual verifica versão/hash da origem e identidade da unidade; respostas que chegam após mudança não podem concluir o novo bloco. Reabrir/JSON reconstrói a mesma pendência sem iniciar inferência. Guias traduzidos independentes já criados não participam da reconciliação.

### 5. Centralizar as opções de mãos e auditar os destinos

Definir opções compartilhadas de Posição, Momento e Decisão, removendo a condição de matchup na disponibilidade de Momento. Manter os valores padrão existentes. O contexto do adversário altera apenas a associação e apresentação da mão.

A auditoria deve partir de `allowedChildren()`, não de uma profundidade fixa:

| Destino do grupo de mãos | Caminhos a verificar | Opções esperadas |
| --- | --- | --- |
| Sobre o deck ou outra seção compatível fora de matchup | Árvore e botão Adicionar do editor | As três opções de cada eixo |
| Subseções Markdown recursivas fora de matchup | Ao menos dois níveis, árvore e editor | As três opções de cada eixo |
| Grupo de mãos diretamente no matchup | Árvore e editor | As três opções de cada eixo |
| Subseções compatíveis dentro do matchup | Ao menos dois níveis, árvore e editor | As três opções de cada eixo |
| Mão movida, duplicada ou importada | Abrir e editar em cada contexto | As três opções e valores preservados |

Verificar menus abertos, foco por teclado, contraste e layout nas larguras suportadas, inclusive após arrastar divisórias. Ajustes de flex/grid, quebra de linha e dimensões devem evitar que os três campos fiquem inacessíveis. Existência de `<option>` no código não comprova apresentação correta.

## Risks / Trade-offs

- Blocos repetidos ou resegmentados podem gerar correspondência ambígua → preservar histórico e deixar pendente quando não houver correspondência segura.
- Históricos aumentam o tamanho do guia → reutilizar limites atuais e informar falhas de pré-voo/checkpoint sem remoção silenciosa.
- Reconciliação concorrente com autosave/geração pode sobrescrever revisões → usar a fila existente, conferir origem ao aceitar resposta e persistir antes de avançar.
- As specs de tradução ainda estão em outra change ativa → integrar os contratos explicitamente, sem alegar conclusão ou arquivamento daquela change.
- Menus nativos variam entre navegador e Electron → realizar verificação visual e por teclado em ambos os ambientes disponíveis e registrar qualquer plataforma não verificada.

## Migration Plan

1. Adicionar regressões dos contratos de links, invalidação e paridade de opções antes das correções correspondentes.
2. Implementar classificação compartilhada e abertura HTTP/HTTPS; depois reconciliação, persistência e projeção da tradução; depois paridade/layout dos seletores.
3. Reconciliar rascunhos legados ao abrir, sem geração, preservando dados anteriores. Se o esquema precisar evoluir, usar migração e backup existentes e verificar round-trip JSON.
4. Executar a suíte pertinente e os fluxos visuais/exportações, registrando evidência por cenário e plataforma. As tarefas só serão concluídas com evidência da implementação.

## Open Questions

Nenhuma decisão de produto bloqueante. Durante a implementação, confirmar se o histórico e o validador atuais comportam todas as revisões necessárias e documentar qualquer evolução do esquema. A intenção adotada para Momento é paridade completa entre mãos gerais e de matchup.
