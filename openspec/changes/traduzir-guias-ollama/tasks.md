## 1. Modelo de dados e compatibilidade

- [x] 1.1 Conferir os contratos atuais de Electron, persistência e import/export e registrar a integração com `electron-desktop-app`, sem alterar sua pendência de validação Windows.
- [x] 1.2 Adicionar idioma do conteúdo, registros/checkpoints de tradução e procedência de cópias ao modelo; incrementar esquema, preservar backup e migrar guias legados sem alterar texto.
- [x] 1.3 Validar configuração BCP 47, unidades, estados, snapshots e limites, rejeitando estruturas inválidas e formatos futuros sem sobrescrever arquivos existentes.
- [ ] 1.4 Integrar registros à persistência/revisões e JSON; verificar round-trip de guia legado, rascunho parcial e cópia independente sem iniciar geração na importação.
- [x] 1.5 Persistir planos de partes internas no esquema 4, validar versões/intervalos, manter retomada de rascunhos legados e excluir versão do esquema da comparação editorial.

## 2. Integração Ollama pelo Electron

- [x] 2.1 Criar adaptador HTTP no principal com descoberta de localhost:11434, fallback IPv4, prazo de descoberta e classificação de falhas/lista vazia.
- [x] 2.2 Implementar catálogo, detalhes, seleção/revalidação e verificação de geração textual/localidade; confirmar o contrato de metadados na versão suportada e rejeitar modelo remoto ou ambíguo.
- [x] 2.3 Expor operações específicas no preload com validação de remetente/parâmetros, destino loopback fixo, sem redirects/proxy externo e sem relaxar CSP/isolamento.
- [x] 2.4 Implementar geração de uma unidade, perfil de prompt versionado, Testar trecho, timeout ajustável e cancelamento por identificador; manter template do modelo e resposta textual simples por padrão.
- [ ] 2.5 Verificar adaptador com servidor simulado: disponível, recusado, timeout, resposta incompatível, nenhum modelo, modelo removido/remoto, origem/destino inválido, cancelamento e resposta tardia.
- [x] 2.6 Consultar metadados sem expandir o vocabulário do tokenizer e verificar descoberta/inspeção com gemma4:latest local, evitando exceder o limite de resposta.

## 3. Inventário, segmentação e preservação

- [x] 3.1 Implementar snapshot editorial sem recursão/metadados voláteis e manifesto de todos os textos por nó/campo, incluindo campos ocultos na prévia e classificação de campos desconhecidos.
- [x] 3.2 Implementar tabela de tradução/cópia para metadados, títulos, Markdown, planos, mãos e overrides, preservando herança e vazio explícito.
- [x] 3.3 Tokenizar/proteger cartas, quantidades, listas de cartas, links/URLs, código e delimitadores Markdown; traduzir somente prosa e rótulos permitidos.
- [x] 3.4 Segmentar por parágrafo/título/item, dividir unidades longas em fronteiras seguras, sinalizar blocos indivisíveis e recompor texto por intervalos/separadores originais.
- [x] 3.5 Validar proteções e estrutura em respostas automáticas e manuais, reconhecendo saída vazia/truncada e impedindo conclusão com erro.
- [ ] 3.6 Testar inventário integral, dois parágrafos, frases longas, Unicode/RTL, links versus cartas, listas/tabelas/código, proteção duplicada/ausente e herança de variantes.
- [x] 3.7 Separar bloco visual e subtrechos internos; reconstruir listas/quebras/tabelas/código pelo aplicativo e validar o caso real das três perguntas, limites, CRLF/RTL e código com linhas vazias.

## 4. Execução recuperável

- [x] 4.1 Implementar fila global de uma geração por vez, estados de execução/unidade e gravação confirmada de checkpoint antes da próxima requisição.
- [x] 4.2 Implementar pausa, retomada, cancelamento, repetição de erro e retradução deliberada com histórico; descartar respostas antigas e conservar edições humanas.
- [ ] 4.3 Integrar checkpoints com a fila do editor sem sobrescrever revisões mais novas; pausar em falha de disco/limite e conservar resultado pendente recuperável.
- [x] 4.4 Integrar fechamento normal e recuperação após interrupção: abortar chamada ativa, salvar confirmados, restaurar pendentes e aguardar ação explícita para retomar.
- [x] 4.5 Detectar mudança do original por hash, conservar snapshot e criar execução atualizada com reaproveitamento apenas de unidades compatíveis.
- [ ] 4.6 Medir guia completo de referência e crescimento de registros; confirmar ou ajustar de forma documentada os limites iniciais de 12 MiB/guia, cinco registros e 10.000 unidades, com pré-voo e controle por checkpoint.
- [ ] 4.7 Verificar retomada, edição concorrente, falha de memória/contexto/rede/disco, cancelamento e modelo alterado sem perda, mistura ou repetição de unidades confirmadas.
- [x] 4.8 Confirmar checkpoint por parte, retomada após JSON/reabertura, repetição de somente uma parte e interrupção por erro de gravação sem descartar partes concluídas.

## 5. Interface de traduções e revisão

- [x] 5.1 Adicionar acesso Traduções, lista por guia/idioma/data e configuração de idiomas/modelo/perfil, incluindo código personalizado e inglês sugerido.
- [x] 5.2 Mostrar descoberta do serviço, catálogo vazio/erros e Testar trecho; explicar disponibilidade no desktop quando não houver preload.
- [x] 5.3 Adicionar progresso persistido, item atual, erros e controles de início/pausa/retomada/cancelamento/repetição/exclusão com confirmação do rascunho salvo.
- [x] 5.4 Implementar navegação hierárquica, original/tradução lado a lado, edição, marcação de revisão, filtros e prévia integral; manter revisão disponível sem Ollama.
- [x] 5.5 Mostrar Original alterado, revisão humana pendente, fallback de rótulos e condições de criação da cópia; validar navegação por teclado e foco nas ações/erros.
- [x] 5.6 Reorganizar configuração/teste/início com ação principal explícita, razões de bloqueio, instrução avançada recolhida e navegação por seção com somente título/ícone agregado; conferir larguras de 980/1440 px e fluxo de rascunho zero, início, pausa, revisão e cópia.
- [x] 5.7 Mostrar bloco único na revisão, progresso interno recolhível, falha por parte, repetição isolada e montagem da cópia após conclusão de todas as partes.
- [x] 5.8 Apresentar guia completo original à esquerda e tradução progressiva à direita, pendências explícitas, partes internas aceitas, configuração recolhível, rolagem sincronizada opcional e acesso à revisão; validar progresso, pausa/retomada, correção e larguras 980/1440 px.

## 6. Cópia traduzida e exportações

- [x] 6.1 Remontar cópia completa com novos IDs, mesmo arquétipo, idioma/procedência e estrutura preservada, sem registros recursivos ou alteração do original.
- [x] 6.2 Persistir/abrir a cópia, vincular execução, recuperar criação parcialmente gravada por procedência e impedir sobrescrita silenciosa de cópias editadas.
- [x] 6.3 Criar catálogo de leitura português/inglês para planos, avaliações, mãos, baralhos, contadores e acessibilidade, preservando enums internos e fallback inglês informado.
- [x] 6.4 Aplicar idioma/direção e leitura localizada na prévia, HTML, PDF e fragmento Patreon, preservando atributos seguros no sanitizador Patreon e Unicode/RTL.
- [ ] 6.5 Validar round-trip JSON, independência após excluir o original, preservação de cartas/herança, rótulos ingleses, fallback de outro idioma e paginação/legibilidade do PDF A4 renderizado.

## 7. Validação integrada e documentação

- [ ] 7.1 Executar testes relevantes e smoke em Electron com serviço simulado para configuração, revisão, pausa, fechamento, retomada e falhas; confirmar regressão dos fluxos sem Ollama.
- [ ] 7.2 Executar fluxo real com Ollama e modelo local instalado: detectar/listar, testar trecho, traduzir guia completo sequencialmente, revisar amostra, retomar e gerar/exportar cópia. Registrar modelo, idiomas, Ollama, hardware e evidências; marcar indisponibilidade como pendência, sem substituir evidência real por simulação.
- [x] 7.3 Documentar preparação externa do Ollama/modelo, modo local, limites, escolha do perfil, localização dos rascunhos, recuperação e distinção entre preservação estrutural e qualidade linguística.
- [ ] 7.4 Registrar validação da interface e artefatos exportados, executar `openspec validate traduzir-guias-ollama --strict --json --no-interactive` e concluir somente tarefas com evidência correspondente.
- [x] 7.5 Registrar testes de regressão da segmentação, fluxo simulado por parte e teste do bloco real com Ollama; reconstruir AppImage/Portable e inspecionar fontes empacotados.
