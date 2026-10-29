## ADDED Requirements

### Requirement: SM-001 — Uso pessoal

O sistema SHALL permitir o uso pessoal da biblioteca e do editor no navegador, sem exigir conta ou serviço remoto de armazenamento de guias.

Origem: `docs/requisitos-v1.md`, linhas 18. Classificação: confirmado.

#### Scenario: SM-001.1 — Abrir o ambiente pessoal
- **WHEN** a pessoa abre o aplicativo pela primeira vez
- **THEN** ela consegue criar e editar um guia sem cadastrar uma conta.

### Requirement: SM-002 — Salvamento automático no navegador

O sistema SHALL persistir automaticamente as alterações do guia no armazenamento do navegador e recuperar o conteúdo gravado ao reabrir o aplicativo.

Origem: `docs/requisitos-v1.md`, linhas 19. Classificação: confirmado.

#### Scenario: SM-002.1 — Recuperar uma alteração
- **WHEN** a pessoa altera um campo Markdown, aguarda a confirmação de salvamento e reabre o aplicativo
- **THEN** o guia recuperado contém a alteração e a mesma estrutura de seções.

#### Scenario: SM-002.2 — Falha ao gravar
- **WHEN** a gravação local falha durante uma edição
- **THEN** o texto permanece disponível na sessão e o estado de salvamento informa a falha, sem afirmar que a alteração foi salva.

### Requirement: SM-003 — Estado do salvamento e última atualização

O sistema SHALL apresentar o estado da gravação do guia e a data e hora de sua última atualização confirmada, atualizando essa informação após uma gravação bem-sucedida.

Origem: `docs/requisitos-v1.md`, linhas 20. Classificação: confirmado.

#### Scenario: SM-003.1 — Confirmar a gravação
- **WHEN** uma edição é persistida com sucesso
- **THEN** o indicador informa que o guia foi salvo e mostra a data e hora correspondentes.

#### Scenario: SM-003.2 — Atualização ainda pendente
- **WHEN** o conteúdo muda e a gravação ainda está pendente
- **THEN** o indicador diferencia a alteração pendente da última versão efetivamente gravada.

### Requirement: SM-004 — Compartilhamento por arquivos de leitura

O sistema SHALL disponibilizar exportações HTML e PDF do guia pessoal para compartilhamento, conforme os contratos de guide-export.

Origem: `docs/requisitos-v1.md`, linhas 21. Classificação: confirmado.

#### Scenario: SM-004.1 — Compartilhar um guia
- **WHEN** a pessoa escolhe exportar em HTML ou PDF
- **THEN** ela recebe o arquivo de leitura correspondente ao guia selecionado.
