## ADDED Requirements

### Requirement: Idiomas e snapshot de origem
O sistema SHALL exigir idiomas de origem e destino BCP 47 válidos e distintos, sugerir inglês como destino e assumir `pt-BR` para guias legados sem idioma declarado. SHALL registrar modelo, perfil, idiomas e snapshot editorial imutável antes da primeira geração, excluindo outras traduções e metadados voláteis do snapshot.

#### Scenario: Começar tradução para outro idioma
- **WHEN** a pessoa inicia uma tradução de português para inglês ou outro código válido
- **THEN** um registro vinculado ao guia conserva o snapshot completo, os idiomas e a configuração daquela execução.

#### Scenario: Idiomas iguais ou inválidos
- **WHEN** o código de idioma é inválido ou os idiomas são equivalentes
- **THEN** a configuração informa o problema e nenhuma geração é iniciada.

### Requirement: Cobertura integral da árvore editorial
O sistema SHALL inventariar todo conteúdo autoral do guia na ordem da árvore, incluindo título, títulos de subseções, Markdown, estratégia, justificativas, interações, ajustes, avaliação textual, variantes e mãos. SHALL copiar IDs estruturais do snapshot, listas de cartas, quantidades, autor, arquétipo, versão, datas e valores categóricos sem submetê-los à geração. SHALL preservar campos desconhecidos e sinalizar os que exigem classificação antes de declarar cobertura completa.

#### Scenario: Traduzir trecho fora da seção selecionada
- **WHEN** existem textos em subseções recolhidas, planos, overrides e justificativas de mãos
- **THEN** todos os campos autorais são incluídos, independentemente da seleção do editor ou visibilidade na prévia.

#### Scenario: Preservar herança
- **WHEN** uma variante contém estratégia herdada, justificativa própria e override vazio de interações
- **THEN** somente a justificativa própria é traduzida e a ausência de estratégia e o override vazio continuam distintos na cópia.

### Requirement: Segmentação sequencial por parágrafo
O sistema SHALL apresentar parágrafos e listas como blocos de revisão e traduzir seus subtrechos de prosa por requisições curtas e sequenciais. SHALL detectar numeração, marcadores de listas/títulos/citações, quebras de linha, separadores/alinhamento de tabelas e código antes da geração, manter esses elementos fora dos subtrechos enviados e reconstruí-los a partir da origem. Referências inline SHALL continuar protegidas e verificadas. SHALL subdividir prosa longa em fronteiras seguras, sem cortar tokens protegidos, preservar separadores e ordem e nunca enviar o guia inteiro ou histórico acumulado. SHALL executar no máximo uma geração por vez no aplicativo.

#### Scenario: Lista visual única com três partes internas
- **WHEN** um bloco contém três perguntas numeradas, inclusive uma linha legada sem espaço após o número
- **THEN** a revisão mostra o bloco completo, o modelo recebe três fragmentos de prosa sem numeração/quebras estruturais e o aplicativo remonta os números e separadores exatos da origem.

#### Scenario: Retomar uma parte com erro
- **WHEN** a segunda parte falha após a primeira ter sido confirmada e o rascunho é reaberto
- **THEN** a primeira permanece salva, a falha é identificada dentro do bloco e repetir somente a segunda parte não regenera a primeira; o bloco só fica concluído após todas as partes válidas.

#### Scenario: Código e tabela
- **WHEN** o conteúdo inclui código cercado com linhas vazias e uma tabela Markdown
- **THEN** código é copiado sem geração, células de prosa são traduzidas separadamente e delimitadores, alinhamento, quantidades e referências permanecem preservados.

#### Scenario: Dois parágrafos no mesmo campo
- **WHEN** um campo contém dois parágrafos dentro do limite
- **THEN** eles produzem duas requisições sequenciais e são remontados na mesma ordem e com a separação original.

#### Scenario: Parágrafo acima do limite
- **WHEN** um parágrafo excede o limite configurado, inicialmente 1.200 caracteres
- **THEN** ele é subdividido sem truncar texto nem tokens protegidos e sua posição no campo é preservada.

#### Scenario: Construção indivisível
- **WHEN** uma construção não pode ser dividida com segurança dentro do limite
- **THEN** a unidade é sinalizada para ajuste ou resolução manual e não é omitida nem marcada como traduzida.

### Requirement: Preservação verificável de conteúdo estruturado
O sistema SHALL proteger referências `[Card]`, imagens `![Card]`, quantidades e linhas de cartas, URLs, destinos de links, código e delimitadores Markdown, distinguindo links de referências de carta. SHALL traduzir prosa complementar e rótulos textuais de links, preservar estrutura de listas/tabelas e validar identidade/multiplicidade das proteções antes de aceitar resultados automáticos ou manuais. Unidade inteiramente protegida SHALL ser copiada sem inferência.

#### Scenario: Cartas e links em um parágrafo
- **WHEN** o texto contém `2 [Myr Enforcer]`, `![Island]`, ênfase e um link Markdown
- **THEN** nomes/quantidades/referências, ênfase e destino do link permanecem íntegros e apenas a prosa/rótulo traduzível muda.

#### Scenario: Modelo perde proteção
- **WHEN** a resposta remove, duplica ou modifica um placeholder obrigatório
- **THEN** a unidade recebe erro, conserva original e resultado para revisão e não pode compor uma cópia concluída até ser corrigida.

### Requirement: Checkpoints e retomada durável
O sistema SHALL persistir cada unidade concluída antes de iniciar a próxima, compartilhando a fila de revisões do guia com o editor. SHALL oferecer pausa, retomada, cancelamento e repetição de unidade com erro; conservar resultados anteriores e edições humanas; e impedir resposta atrasada de sobrescrever estado mais novo. Falha de gravação SHALL pausar a execução e manter o resultado pendente acessível.

#### Scenario: Reabrir após interrupção
- **WHEN** o aplicativo encerra durante uma requisição e é reaberto
- **THEN** resultados confirmados reaparecem, a unidade não confirmada fica pendente e nenhuma inferência reinicia sem ação da pessoa.

#### Scenario: Pausar com requisição ativa
- **WHEN** a pessoa pausa ou cancela durante uma geração
- **THEN** a requisição ativa é abortada, respostas tardias são ignoradas e resultados anteriores permanecem no rascunho.

#### Scenario: Falha de geração ou gravação
- **WHEN** ocorre timeout, falta de memória, resposta vazia/truncada, erro de contexto, rede ou disco
- **THEN** o erro é identificado, a fila pausa e pode ser retomada após correção sem repetir unidades já confirmadas nem fingir progresso salvo.

### Requirement: Detecção de mudança no original
O sistema SHALL comparar o estado editorial atual com o hash do snapshot e indicar divergência sem alterar silenciosamente a base da tradução. SHALL permitir continuar o snapshot anterior ou criar execução atualizada, reaproveitando somente unidades com endereço/hash, idiomas, modelo e perfil compatíveis; SHALL preservar o histórico e revisões humanas.

#### Scenario: Editar original durante tradução
- **WHEN** um parágrafo é editado e uma subseção é movida no guia de origem
- **THEN** a área informa Original alterado e não aplica resultados a outros campos nem declara que o snapshot traduzido representa o original atual.

### Requirement: Cópia traduzida independente
O sistema SHALL permitir criar um guia traduzido somente após todas as unidades possuírem resultado estruturalmente válido ou resolução manual válida, informar unidades sem revisão humana e conservar o original. A cópia SHALL ter novos identificadores de guia/nós, mesmo arquétipo, idioma e procedência; SHALL permanecer editável/exportável sem o original e não incluir rascunhos recursivos. Criação repetida após falha parcial SHALL recuperar a cópia existente por procedência sem duplicação silenciosa.

#### Scenario: Concluir e editar em inglês
- **WHEN** a pessoa cria o guia a partir de uma tradução completa para inglês
- **THEN** a cópia salva abre no editor comum identificada pelo idioma e sua edição não altera o guia de origem.

#### Scenario: Repetir após falha no vínculo
- **WHEN** a cópia foi salva mas a gravação de seu vínculo no original falhou
- **THEN** nova tentativa localiza a cópia pela execução de origem e repara o vínculo sem criar outra cópia automaticamente.

### Requirement: Limites explícitos de armazenamento
O sistema SHALL verificar limites de tamanho e quantidade antes de criar uma execução e a cada checkpoint. Inicialmente SHALL limitar cada guia a 12 MiB de JSON, cinco registros e 10.000 unidades por execução, informando quando exportar/excluir rascunhos ou ajustar a segmentação. Não SHALL descartar conteúdo ou aumentar limites silenciosamente.

#### Scenario: Checkpoint excede o limite
- **WHEN** o resultado de uma unidade faz o guia superar o limite de persistência
- **THEN** a execução pausa, o último checkpoint válido permanece salvo e o resultado pendente continua disponível para recuperação.
