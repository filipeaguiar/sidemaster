## Context

O checkout atual usa JavaScript sem framework, uma árvore recursiva de seções (`schemaVersion: 2`) e Electron com renderer isolado, preload restrito e persistência atômica por guia. `src/storage.js` também mantém um modo navegador. A change ativa `electron-desktop-app` já implementou essa base; sua verificação de distribuição Windows permanece pendente e fora deste trabalho.

Os textos estão em títulos e campos Markdown, planos gerais, overrides explícitos de variantes e justificativas de mãos. Listas de cartas, valores categóricos e metadados convivem com esses textos. `effectivePlan()` distingue campo herdado de override vazio; traduzir apenas o HTML ou o plano efetivo destruiria essa distinção. A leitura e os exports ainda contêm rótulos fixos em português.

## Goals / Non-Goals

**Goals:** tradução local opcional do conteúdo completo; requisições pequenas e sequenciais; gerenciamento e revisão próprios; retomada durável; referências preservadas; cópia traduzida independente e exportável.

**Non-Goals:** instalação ou download de Ollama/modelos; início automático de serviços; provedores remotos; treinamento; escolha obrigatória de modelo; tradução da interface administrativa inteira; sincronização automática bidirecional entre guias; execução da tradução no modo navegador nesta etapa.

## Decisions

### 1. Transporte local pelo processo principal

Adicionar um adaptador Ollama no processo principal e métodos específicos no preload: descobrir/listar modelos, testar uma unidade, gerar uma unidade e cancelar por identificador de execução. Validar remetente, tipos, limites e identificadores, seguindo o IPC existente. O renderer não recebe uma operação HTTP genérica.

Ao abrir Traduções e ao clicar em **Verificar novamente**, consultar `GET /api/tags` em `http://localhost:11434`; usar `http://127.0.0.1:11434` como fallback se a resolução de localhost falhar. Prazo de descoberta: 3 segundos por tentativa. Separar indisponibilidade, timeout, resposta incompatível e lista vazia. Exibir nome/tag e tamanho dos modelos, com parâmetros/quantização quando informados. A lista representa modelos disponíveis, não somente os carregados na memória.

Restringir o destino a loopback na porta 11434, sem redirects nem encaminhamento de proxy de rede. Não ampliar `connect-src` do renderer nem desabilitar `webSecurity`/isolamento. Consultar `POST /api/show` e o catálogo: rejeitar `remote_host`/`remote_model` preenchidos e verificar metadados locais (`model_info`, arquitetura/pesos e capacidades quando informadas). Metadados ambíguos bloqueiam a geração com diagnóstico de compatibilidade; ausência de sufixo `cloud` no nome não comprova execução local. Documentar modo local do Ollama (`OLLAMA_NO_CLOUD=1`) e exigir verificação do caráter local antes da primeira geração. Não inferir especialização em tradução pelo nome.

Alternativa considerada: `fetch` direto do renderer. A origem `sidemaster://app` exigiria compatibilidade de CORS/CSP; o processo principal evita essa configuração e mantém operações restritas. URLs remotas/configuração livre de porta ficam fora do escopo solicitado.

### 2. Modelo selecionável e teste de compatibilidade

Usar `POST /api/generate` com `stream: false`, `model`, `prompt`, `system` quando compatível e opções limitadas. Preservar o template padrão do modelo; não ativar `raw` por padrão. Um perfil avançado opcional permite ajustar o prompt com placeholders obrigatórios de texto, idioma de origem e idioma de destino, inclusive para modelos especializados. Perfil e sua versão são congelados por execução. Não exigir JSON nem ferramentas, que muitos modelos modestos não suportam.

Antes da execução completa, disponibilizar **Testar trecho** com uma unidade curta e protegida. Mostrar a resposta ao usuário e validar preservação estrutural; esse teste não certifica qualidade linguística nem suporte a todos os pares de idiomas. Modelo sem geração textual, remoto ou com resposta inválida não inicia o lote. Mudança de modelo/perfil cria nova execução para não misturar resultados silenciosamente.

Alternativa considerada: fixar um modelo de tradução. O usuário ainda não escolheu modelo/hardware; seleção explícita e teste deixam essa escolha aberta sem alegar compatibilidade universal.

### 3. Registro de tradução associado ao original

Adicionar `contentLanguage` (BCP 47, padrão legado `pt-BR`) e `translations[]` opcionais ao guia. Cada registro contém `translationId`, idiomas, modelo/tag/digest quando disponíveis, perfil, datas, estado, snapshot editorial de origem, hash desse snapshot, manifesto de unidades, checkpoints e `generatedGuideId` opcional. O snapshot exclui registros de tradução, cache, resultados de validação e timestamps voláteis, evitando recursão e falsas divergências. Contém toda a estrutura necessária para remontar uma cópia mesmo após mudanças no original.

Unidades identificam `nodeId` ou metadado do guia, campo, ordem, intervalo no texto, hash de origem, mapa de proteções, texto traduzido, revisão humana e erro. Estados da execução: rascunho, executando, pausada, interrompida, com erros, cancelada, concluída. Unidades: pendente, executando, traduzida, revisada, erro. Ao reabrir, execuções em andamento tornam-se interrompidas e suas unidades não confirmadas voltam a pendentes.

Persistir pelo repositório do guia com a mesma fila de revisões do editor: confirmar o checkpoint de uma unidade antes de iniciar a seguinte. Mesclar o checkpoint no registro atual, nunca gravar de volta um snapshot antigo do guia inteiro. Falha de gravação pausa a fila, mantém o resultado em memória e expõe recuperação. Ao fechar normalmente, abortar a unidade ativa, gravar resultados confirmados e participar da negociação existente de fechamento.

Alternativa considerada: arquivos separados para traduções. Embutir os registros permite reutilizar persistência, recuperação e transporte JSON atuais. Mitigar crescimento com limites explícitos, contador de tamanho e exclusão deliberada de rascunhos; nunca remover registros silenciosamente.

### 4. Inventário de todo o guia com regras por tipo de campo

Percorrer o snapshot em ordem editorial, incluindo seções vazias/ocultas na prévia, e aplicar uma tabela explícita de campos:

| Conteúdo | Tratamento |
| --- | --- |
| Título do guia e títulos de seções/subseções, mãos e variantes | Traduzir texto autoral; preservar nomes próprios de arquétipos/cartas identificados e permitir revisão |
| `fields.markdown` em qualquer nó | Traduzir prosa e rótulos de links; preservar estrutura e destinos |
| Plano: `strategy`, `justification`, `interactions`, `adjustments`, `assessment` | Traduzir todo texto não vazio |
| Plano: `in`, `out` e overrides correspondentes | Preservar linhas de cartas/quantidades; traduzir prosa complementar, se houver |
| Variantes | Traduzir apenas chaves presentes em `overrides`; preservar ausência e vazio explícito |
| Mãos: `justification` | Traduzir; preservar `cards` integralmente |
| `deck.main`, `deck.sideboard`, IDs e tipos de nós | Copiar integralmente |
| `rating`, `turn`, `phase`, `decision` | Conservar valores internos; localizar na leitura por catálogo |
| Autor, arquétipo, rótulo de versão e datas | Copiar como identificadores/metadados, sem geração automática |

Campos desconhecidos são preservados e sinalizados no inventário para impedir que cobertura incompleta seja anunciada como tradução completa. Não transformar herança em overrides materializados. Uma unidade só com elementos protegidos é copiada sem invocar o modelo.

### 5. Segmentação preservando o documento

A implementação mantém blocos de revisão com intervalos no campo original e um plano versionado de partes internas. Listas e tabelas não são enviadas como um texto cheio de marcadores estruturais: cada item/célula fornece somente sua prosa, enquanto numeração, recuos, quebras, pipes, alinhamento e cercas de código são recompostos pelo aplicativo. Parágrafos longos continuam sendo um bloco visual com várias chamadas limitadas por fronteiras de palavras. Código cercado, inclusive com linhas vazias ou cerca final ausente, é preservado sem geração. As referências inline continuam protegidas e validadas. O resultado do modelo não pode introduzir numeração/quebras ou separadores extras dentro da parte.

O esquema 4 persiste planos de partes, offsets, estados e resultados após cada chamada. Guias 1–3 continuam normalizados com o backup existente. Rascunhos legados conservam IDs, fonte, resultados confirmados e endereço por parágrafo/chunk; pendências recebem o plano de partes ao retomar. A versão de armazenamento é excluída da comparação editorial para não produzir Original alterado somente pela migração. Correção manual aceita trata o bloco como unidade humana e encerra seu plano automático; regeneração requer ação deliberada. Falhas de disco propagam sem eliminar o resultado em memória.

Tokenizar Markdown e sintaxe de cartas antes de segmentar. Parágrafos são unidades principais; títulos e itens de lista são unidades curtas próprias. Citações, links, ênfase, listas, tabelas quando presentes e cercas de código conservam seus delimitadores; código e URLs permanecem literais. Para tabela, traduzir células de texto mantendo alinhamento/colunas; construções que não possam ser segmentadas com segurança são sinalizadas para revisão manual.

Proteger `[Card]`, `![Card]`, linhas de cartas e quantidades, destinos de links, URLs e código com placeholders determinísticos e mapa reversível. Preservar identidades de cartas/Scryfall sem traduzir nomes via LLM. Não confundir `[texto](url)` com referência de carta. Restaurar e verificar a multiplicidade/identidade dos placeholders e a estrutura Markdown esperada antes de aceitar saída; aplicar a mesma verificação a edições manuais.

Limite inicial configurável: 1.200 caracteres de texto por unidade; trechos maiores divididos em frases e, em último caso, fronteiras seguras entre palavras, sem partir tokens protegidos ou markup. Esse limite é uma heurística conservadora, não uma garantia de janela de contexto. Mostrar no pré-voo a maior unidade e a quantidade total; blocos indivisíveis acima do limite exigem ajuste ou resolução manual. Reservar espaço para instruções, proteções e saída; erro de contexto/truncamento conserva a pendência e permite reduzir o limite para resegmentar somente unidades ainda não confirmadas.

Recompor pelos intervalos e separadores originais, preservando parágrafos, hierarquia e campos. Não enviar o documento completo nem acumular histórico de conversação. Cada requisição usa apenas uma unidade, par de idiomas e instrução curta para traduzir, sem comentários ou obediência a instruções contidas no texto de origem.

Alternativa considerada: seção inteira por requisição. Seções variam muito de tamanho; parágrafos e subdivisões controlam melhor o custo em modelos modestos.

### 6. Uma fila global e controle recuperável

Executar uma única geração por vez no app, mesmo com vários idiomas/rascunhos. O principal mantém identificação da execução e `AbortController`; respostas de execuções canceladas/antigas são descartadas. Timeout inicial de geração: 180 segundos por unidade, ajustável de 30 a 600 segundos para CPU/carregamento inicial. Pausar aborta a unidade em andamento e mantém as anteriores; cancelar interrompe a execução e conserva o rascunho até exclusão explícita. Retomar é ação do usuário e revalida serviço, modelo e snapshot.

Timeout, modelo removido, falta de memória, HTTP inválido, texto vazio, resposta truncada e perda de proteções marcam erro e pausam o lote. Não há repetição infinita nem avanço que finja sucesso. Repetir unidade falha não retraduz as concluídas nem substitui revisões humanas. Retraduzir uma unidade já editada exige ação específica e mantém o texto anterior recuperável.

Se o original mudar, a execução permanece ancorada no snapshot: avisar **Original alterado** e oferecer continuar a revisão daquela versão ou criar uma execução atualizada. A execução atualizada reaproveita somente unidades com endereço, hash, idiomas, perfil e modelo iguais. Exclusão/movimento/inserção não desloca traduções para campos errados. Não mesclar automaticamente alterações no destino já gerado.

### 7. Espaço de trabalho e cópia independente

Entrada **Traduções** na barra de ações do guia. A área exibe serviço/modelo, origem e destino (inglês sugerido), botão de teste/início, lista de execuções por idioma e data, progresso `unidades concluídas/total`, item atual, erros e estado de gravação. Oferecer destinos comuns (`en`, `es`, `fr`, `de`, `it`, `pt-BR`) e código BCP 47 personalizado validado; idiomas iguais não iniciam tradução. A seleção de idioma não promete que o modelo conhece aquele par.

Lista hierárquica de unidades à esquerda; original e tradução editável lado a lado; filtros pendentes/com erro/não revisadas; ações de pausa, retomada, cancelamento, repetir e marcar revisão. Prévia integral usa o mesmo renderer dos exports. Revisão é manual e explicitamente distinta de geração ou validação estrutural. Rascunhos permanecem acessíveis sem serviço disponível. Exclusão de rascunho com trabalho salvo exige confirmação na interface do produto.

A leitura principal compara dois documentos: snapshot integral à esquerda e projeção progressiva no idioma de destino à direita. A projeção reutiliza o renderer de leitura com prefixos de IDs distintos, substitui cada intervalo por resultado aceito ou indicador de pendência e também mostra partes internas confirmadas de blocos incompletos. Não reutiliza a prosa original como fallback do destino. Herança de variantes e elementos protegidos continuam derivados da estrutura do guia. É uma projeção sem gravação: a montagem/exportação final mantém sua validação estrita. Cada checkpoint atualiza somente o painel de destino, preservando rolagem e mantendo o original estável. Ações nos blocos abrem a aba Revisar trecho. A configuração recolhe ao iniciar e pode ser reaberta; a área de leitura ocupa o espaço restante. Rolagem sincronizada opcional associa as seções pelos IDs estáveis e navegação por título localiza ambos os lados.

A revisão de usabilidade organiza configuração/rascunhos em uma lateral, com prompt/limites em um disclosure avançado. A área principal apresenta Configurar → Testar trecho → Iniciar tradução, teste e ação principal próximos e motivo de bloqueio visível. Um rascunho vazio usa Iniciar tradução; progresso parcial usa Continuar tradução. O rascunho só é criado ao iniciar após a amostra válida. A navegação agrupa as unidades por seção/subseção, exibindo somente título e ícone de estado agregado, com nome acessível e tooltip. A revisão expõe o caminho do campo e Anterior/Próximo para os parágrafos. Voltar ao guia pausa a geração antes de sair. Evidências da revisão estão em `docs/translation-interface-validation.md`.

**Criar guia traduzido** fica disponível quando todas as unidades têm resultado válido ou resolução manual válida, sem exigir marcação humana de todas elas. Se houver unidades não revisadas, informar isso no ato da criação. Gerar novos `guideId`/IDs de nós, conservar `archetypeId` e registrar idioma, snapshot de origem e mapeamento de procedência. Copiar estrutura sem `translations[]` para evitar duplicação recursiva. Persistir a cópia antes de confirmar sucesso, abrir no editor comum e guardar o vínculo no registro de origem. Se o segundo commit falhar, localizar a cópia pelo `translationId` de procedência e reparar o vínculo, sem criar duplicatas ao repetir. Regeneração após edição da cópia cria outra cópia ou exige escolha explícita, sem sobrescrita silenciosa.

Alternativa considerada: substituir textos do guia original. Cópias independentes preservam o original e seguem o conceito existente de guias completos por versão.

### 8. Leitura localizada e portabilidade

Separar idioma do conteúdo do idioma da interface administrativa. Catálogo inicial de leitura em português e inglês para títulos fixos de campos, avaliações, decisões, fases, contadores de cartas, notas de variante, rótulos de baralho, legendas e textos de acessibilidade/fallbacks apresentados ao leitor. Manter enums internos existentes para validação. Outros idiomas recebem prosa traduzida e fallback de rótulos em inglês, explicitamente indicado na área de tradução. Cobrir escrita Unicode e aplicar direção de leitura com base no idioma, incluindo RTL.

HTML inclui `lang`/`dir`; PDF e Patreon usam a mesma renderização localizada. Como o Patreon recebe fragmento sanitizado, conservar atributos seguros de idioma/direção no contêiner, sem exigir um documento HTML completo. JSON de um guia original inclui seus registros e checkpoints; JSON da cópia traduzida inclui idioma e procedência, sem depender do guia original para leitura/edição. Importar/reabrir nunca inicia inferência automaticamente.

### 9. Limites e validação

Limites iniciais por guia: 12 MiB de JSON serializado (limite já existente no IPC), no máximo cinco registros de tradução e 10.000 unidades por execução. Verificar o espaço estimado do snapshot/manifesto antes de iniciar e o tamanho real de cada checkpoint; avisar antes de esgotar o limite. Permitir apagar/exportar rascunhos para liberar espaço; não aumentar o teto nem eliminar conteúdo automaticamente. Testar o guia completo de referência para avaliar se esses valores precisam ser revistos antes da implementação final.

Testes unitários cobrem inventário, segmentação/recomposição, proteção, herança e cópia; adaptador com servidor simulado cobre estados de rede, metadados locais/remotos, respostas fora de ordem e cancelamento. Validar a interface em Electron com Ollama real e modelo instalado, incluindo fechamento/retomada, edição de origem, revisão e todos os exports. Servidor simulado comprova controle do fluxo, mas não compatibilidade real nem qualidade linguística. Registrar modelo, versão do Ollama, hardware e trechos revisados; se indisponíveis, registrar a limitação em vez de encerrar a verificação como realizada.

## Risks / Trade-offs

- Modelo omite ou altera sentido mesmo com tokens íntegros → revisão lado a lado, teste do par de idiomas e distinção entre validade estrutural e qualidade linguística.
- Modelo especializado exige prompt próprio → perfil editável e teste curto; seleção de modelo fica com o usuário.
- Parágrafo isolado perde contexto → instrução curta de domínio e revisão; sem histórico crescente. Glossário avançado fica para evolução posterior.
- Ollama local pode representar modelo remoto → verificação de metadados, rejeição de modelos remotos e documentação do modo local; não afirmar privacidade só pelo endereço loopback.
- Tarefas embutidas ampliam JSON e podem atingir limites → pré-voo de tamanho, limites explícitos e checkpoint que pausa antes de perder trabalho.
- Alteração simultânea do guia ou resposta atrasada → snapshot imutável, hashes, identificação de execução e fila compartilhada de persistência.
- Rótulos sem catálogo no idioma escolhido → fallback inglês informado; o texto autoral continua no idioma solicitado.

## Migration Plan

1. Coordenar as extensões do preload e repositório com os arquivos atuais da change Electron, sem alterar sua pendência de validação Windows.
2. Incrementar a versão de esquema do guia, preservando backup antes da primeira gravação migrada. Guias sem campos novos recebem idioma `pt-BR` e nenhuma tradução; não alterar Markdown existente.
3. Atualizar normalização, validação, import/export e limites do processo principal antes de habilitar criação de registros. Rejeitar formatos futuros não suportados, conservando os arquivos.
4. Introduzir adaptador, motor, tela e catálogo de leitura; manter a função indisponível com explicação no navegador sem preload, preservando os fluxos existentes.
5. Validar migração, retomada, compatibilidade de exports e execução real. Reversão usa cópia anterior do perfil ou export legado compatível; não abrir/gravar esquema novo com binário antigo.

## Open Questions

- Qual modelo especializado e quais pares de idiomas serão usados na primeira verificação real? Não bloqueia a proposta nem impõe instalação; registrar na aplicação da change.
- O guia real de maior tamanho cabe com seus rascunhos no teto atual? Medir antes de confirmar limites finais, mantendo o controle explícito de espaço.

## Referências técnicas verificadas

- [Ollama: catálogo de modelos](https://docs.ollama.com/api/tags) — `GET /api/tags` e detalhes disponíveis.
- [Ollama: geração](https://docs.ollama.com/api/generate) — geração com template, opções e resposta sem streaming.
- [Ollama: FAQ](https://docs.ollama.com/faq) — bind padrão em `127.0.0.1:11434`, origens e modo local `OLLAMA_NO_CLOUD`.
- [Ollama: contrato de API no repositório oficial](https://github.com/ollama/ollama/blob/main/docs/api.md) — consulta de metadados e capacidades por `POST /api/show`.
- [Ollama: tipos de resposta oficiais](https://github.com/ollama/ollama/blob/main/api/types.go) — `remote_host`/`remote_model` em catálogo, detalhes e geração. Confirmar campos na versão instalada durante a implementação.
