## ADDED Requirements

### Requirement: Invalidação automática por trecho alterado

O sistema SHALL reconciliar cada rascunho de tradução com o conteúdo editorial atual ao acessar ou retornar à aba Traduções e antes de continuar geração ou criar a cópia traduzida. Cada bloco traduzível cujo conteúdo de origem mudou SHALL aparecer como Não traduzido — original alterado, perder a conclusão e a revisão válidas para a origem atual e integrar o filtro de pendentes. O texto anterior e suas edições humanas SHALL permanecer recuperáveis no histórico, vinculados à origem anterior. A reconciliação SHALL ocorrer sem Ollama, sem criar outro registro de tradução e sem iniciar geração.

#### Scenario: Alterar um de dois parágrafos revisados
- **WHEN** uma seção contém dois parágrafos revisados e a pessoa altera somente o segundo no guia e volta à aba Traduções
- **THEN** o segundo aparece não traduzido com o novo original, o primeiro conserva tradução e revisão e o resultado anterior do segundo permanece no histórico.

#### Scenario: Alterar título ou justificativa
- **WHEN** a pessoa edita um título, texto Markdown, campo autoral de plano/variante ou justificativa de mão inicial já traduzido
- **THEN** somente os blocos afetados ficam pendentes e o novo texto original fica disponível para revisão/tradução.

#### Scenario: Reabrir um rascunho antigo sem serviço
- **WHEN** o guia foi alterado desde seu checkpoint e a pessoa abre um rascunho salvo com o Ollama desligado
- **THEN** a divergência é reconciliada por trecho e as pendências aparecem sem perder resultados anteriores ou iniciar requisições.

### Requirement: Correspondência estável de conteúdo e estrutura

O sistema SHALL associar resultados a guia, idioma, nó e campo, verificando conteúdo e contexto de geração compatíveis antes do reaproveitamento. Inserir ou remover parágrafos SHALL NOT transferir resultados para outro texto por coincidência de índice. Blocos inalterados e compatíveis SHALL conservar resultados mesmo quando sua posição muda; conteúdo novo traduzível SHALL ficar pendente e conteúdo removido SHALL deixar de compor o documento e o progresso atuais, preservado no histórico. Mudanças apenas de ordem, movimentação, metadados técnicos ou checkpoints SHALL NOT invalidar prosa inalterada. Campos estruturados não traduzíveis SHALL ser sincronizados sem geração, respeitando o inventário existente.

#### Scenario: Inserir parágrafo antes de conteúdo traduzido
- **WHEN** um parágrafo novo é inserido no início de um campo com dois parágrafos traduzidos
- **THEN** o novo parágrafo fica pendente e os dois anteriores conservam resultados associados a seus respectivos textos na nova posição.

#### Scenario: Remover ou mover conteúdo
- **WHEN** uma subseção com identificador estável é movida sem alterar seu conteúdo e um parágrafo de outra seção é excluído
- **THEN** a subseção conserva as traduções compatíveis e a nova posição, e o parágrafo excluído deixa de entrar na completude e na prévia atuais.

#### Scenario: Duplicar uma seção
- **WHEN** uma seção é duplicada com novos identificadores
- **THEN** os novos nós são inventariados como conteúdo novo e não assumem a identidade ou revisão humana dos nós originais.

#### Scenario: Alterar somente o cenário de uma mão
- **WHEN** a pessoa troca Momento de Pré-side para Sempre sem alterar a justificativa
- **THEN** o contexto estruturado é atualizado na leitura traduzida sem chamada ao modelo e a tradução inalterada da justificativa é preservada.

### Requirement: Pendência refletida em toda a área de tradução

O sistema SHALL refletir os trechos invalidados nos indicadores da árvore, filtros, contadores e prévia integral, e SHALL impedir que sejam apresentados como resultados atuais traduzidos ou revisados. A tradução do guia atual SHALL deixar de estar concluída enquanto houver conteúdo traduzível pendente. Criar guia traduzido SHALL exigir resultados válidos para o conteúdo atual; cópias independentes já criadas SHALL permanecer inalteradas.

#### Scenario: Editar guia cuja tradução estava concluída
- **WHEN** uma tradução estava completa e um parágrafo do original é alterado
- **THEN** a seção indica pendência, o contador de concluídos diminui, a prévia sinaliza o trecho não traduzido e a criação de nova cópia fica indisponível até resolver a pendência.

#### Scenario: Reconciliar vários idiomas
- **WHEN** o guia tem rascunhos para inglês e espanhol e um trecho original muda
- **THEN** cada rascunho indica a pendência ao ser acessado, sem misturar resultados entre idiomas nem modificar cópias independentes existentes.

### Requirement: Atualização durável e proteção contra respostas antigas

O sistema SHALL persistir a reconciliação usando os checkpoints e a fila de salvamento do guia, preservando a possibilidade de retomar após reabertura ou round-trip JSON. Resultados automáticos ou manuais SHALL ser aceitos somente para a versão de origem a que correspondem. Se o original mudar durante uma requisição, a resposta antiga SHALL NOT concluir ou substituir a tradução do novo texto. Falha de gravação SHALL ser informada e SHALL impedir avanço que dependa de um checkpoint não confirmado.

#### Scenario: Resposta chega após edição da origem
- **WHEN** uma geração foi iniciada para um trecho que é alterado antes de a resposta retornar
- **THEN** a resposta não conclui o novo trecho e o texto atual permanece pendente, com os resultados anteriores preservados.

#### Scenario: Continuar após reabertura
- **WHEN** a reconciliação foi salva, o guia foi reaberto ou exportado/importado em JSON e a pessoa manda continuar a tradução
- **THEN** os trechos válidos permanecem confirmados e somente os pendentes são processados para a origem atual.

#### Scenario: Falha ao salvar a atualização
- **WHEN** a gravação da reconciliação falha
- **THEN** a interface informa a falha, conserva os dados recuperáveis e não inicia geração nem cria cópia como se o novo checkpoint estivesse salvo.
