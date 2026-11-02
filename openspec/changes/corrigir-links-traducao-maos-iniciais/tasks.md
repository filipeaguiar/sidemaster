## 1. Compatibilidade e regressões

- [x] 1.1 Conferir a integração com os contratos ativos de `traduzir-guias-ollama` e registrar a evolução de snapshot antigo para histórico preservado e espaço de trabalho da origem atual, sem marcar tarefas daquela change como concluídas.
- [ ] 1.2 Adicionar regressões de links HTTP/HTTPS misturados com cartas, rótulo igual a nome de carta, imagens comuns, definições de referência, código e URLs com query/fragmento; verificar ausência de consultas indevidas ao catálogo.
- [ ] 1.3 Adicionar regressões de alteração de um entre dois blocos revisados e de inserção, exclusão, repetição e movimentação de parágrafos, incluindo títulos, planos/overrides e justificativas de mãos.

## 2. Links Markdown e cartas

- [x] 2.1 Implementar classificação compartilhada de construções Markdown e referências de cartas e integrá-la à renderização/coleta, preservando referências de links e imagens comuns já especificadas.
- [x] 2.2 Alinhar proteção/validação da tradução à classificação de links, permitindo traduzir rótulos e conservando destinos e referências de cartas.
- [x] 2.3 Permitir abertura externa de HTTP e HTTPS no Electron com validação de URL, mantendo bloqueios de protocolos indevidos e navegação interna.
- [ ] 2.4 Verificar no navegador e no Electron a leitura de links e cartas no mesmo parágrafo, o painel sem falsas cartas ausentes e a abertura real de ambos os protocolos no desktop.

## 3. Reconciliação incremental das traduções

- [x] 3.1 Implementar correspondência por identidade do nó/campo e conteúdo, conservando resultados compatíveis após deslocamentos e deixando correspondências ambíguas pendentes; cobrir isolamento entre guias e idiomas.
- [x] 3.2 Arquivar origem/resultados/revisões/partes dos blocos afetados e atualizar snapshot, hashes, intervalos e proteções; tratar adições/exclusões, novos IDs de duplicatas e atualização direta de campos estruturados.
- [x] 3.3 Regenerar os planos internos apenas dos blocos alterados e preservar partes dos blocos válidos, sem reutilizar planos vinculados a outra origem.
- [x] 3.4 Persistir a reconciliação na fila existente e validar histórico/checkpoints, compatibilidade legada e limites; evoluir esquema com migração/backup somente se necessário.
- [x] 3.5 Integrar a reconciliação à entrada/retorno à aba e às verificações antes de continuar/criar cópia, sem criar registros ou iniciar inferência automaticamente.
- [x] 3.6 Exibir Não traduzido — original alterado na revisão e refletir a pendência na árvore, filtros, contadores e prévia integral, com origem atual e acesso ao resultado anterior no histórico.
- [x] 3.7 Atualizar a condição de conclusão/criação de cópia para exigir resultados válidos da origem atual, conservando cópias independentes já criadas.
- [x] 3.8 Revalidar identidade e versão da origem ao aceitar resultados automáticos/manuais; testar resposta atrasada, edição concorrente e falha de gravação sem sobrescrita nem falso progresso.
- [ ] 3.9 Verificar reabertura e round-trip JSON de rascunho reconciliado, múltiplos idiomas e uso sem Ollama; confirmar que continuar processa somente os trechos pendentes.

## 4. Opções e apresentação das mãos iniciais

- [x] 4.1 Centralizar opções de Posição/Momento/Decisão e disponibilizar Play/Draw/Sempre, Pré-side/Pós-side/Sempre e Manter/Mulligar/Situacional em qualquer mão, preservando os padrões existentes.
- [ ] 4.2 Cobrir por regressões os destinos permitidos por `allowedChildren()`, incluindo grupos gerais, matchups e subseções recursivas dentro/fora de matchups; verificar todos os valores dos três seletores.
- [ ] 4.3 Percorrer a matriz de destinos do design pelos botões da árvore e do editor; verificar também importação, duplicação e movimentação entre grupos gerais/de matchup sem perda de valores.
- [ ] 4.4 Inspecionar menus abertos por mouse/teclado nas larguras suportadas, inclusive painel estreito e divisórias redimensionadas; corrigir cortes, contraste ou layout que impeçam ler/selecionar opções.
- [ ] 4.5 Verificar que opções não padrão continuam selecionadas após alternar seções, salvar/reabrir e round-trip JSON, e que Sempre aparece como Always na leitura em inglês.

## 5. Validação integrada e evidências

- [ ] 5.1 Executar `npm test` e as regressões pertinentes de links, tradução, persistência e mãos, corrigindo falhas relacionadas ao escopo.
- [ ] 5.2 Executar o fluxo visual: abrir tradução concluída, editar um bloco do guia, voltar à aba, conferir pendência localizada/histórico/bloqueio da cópia, resolver o bloco e confirmar a conclusão atualizada.
- [ ] 5.3 Exportar guia de referência com cartas, links HTTP/HTTPS e mãos gerais/de matchup para HTML, HTML Patreon, PDF e JSON; inspecionar destinos de links, cenários e preservação da sintaxe, incluindo round-trip JSON.
- [ ] 5.4 Registrar evidência por cenário e ambiente, distinguindo inspeção estática, testes automatizados, verificação visual e plataformas não verificadas; reconciliar os requisitos sobrepostos ao integrar as changes de tradução.
- [x] 5.5 Executar `openspec validate corrigir-links-traducao-maos-iniciais --strict --json --no-interactive` e revisar a coerência entre proposta, design, specs e evidências antes de concluir as tarefas.
