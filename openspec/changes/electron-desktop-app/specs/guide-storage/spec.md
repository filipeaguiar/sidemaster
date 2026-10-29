## ADDED Requirements

### Requirement: Perfil local persistente do aplicativo desktop
O sistema SHALL persistir cada guia em um arquivo JSON independente e as preferências em arquivo separado dentro da pasta de dados do usuário do SideMaster. O cache de cartas SHALL ficar separado dos dados editoriais. O perfil desktop SHALL ser independente da origem do navegador e da pasta do executável.

#### Scenario: Recuperar guias e preferências
- **WHEN** a pessoa edita um guia, muda a seção e o tamanho dos painéis, aguarda confirmação de salvamento e reinicia o app
- **THEN** o guia e as preferências confirmadas são recuperados dos arquivos locais.

#### Scenario: Operar sobre um único guia
- **WHEN** um guia é criado, alterado, importado ou excluído
- **THEN** somente os arquivos desse guia e as preferências relacionadas são modificados, preservando os demais guias.

#### Scenario: Transferir um guia do navegador
- **WHEN** a pessoa exporta um guia em JSON no navegador e importa no Electron
- **THEN** o conteúdo aparece no perfil desktop sem alterar os dados do navegador.

### Requirement: Gravação automática ordenada e segura
O sistema SHALL gravar snapshots em disco durante a edição por fila assíncrona de revisões crescentes, com debounce curto e substituição atômica do arquivo no mesmo filesystem. O indicador SHALL confirmar apenas a revisão efetivamente persistida, mantendo pendente uma edição mais recente ainda não gravada.

#### Scenario: Continuar digitando durante uma gravação
- **WHEN** uma revisão termina de gravar após o autor produzir uma revisão mais recente
- **THEN** a resposta antiga não marca a revisão nova como salva nem a substitui no arquivo final.

#### Scenario: Falha durante a substituição
- **WHEN** uma gravação falha ou o processo é interrompido antes de concluir o commit
- **THEN** o último arquivo confirmado permanece válido e o snapshot incompleto não é tratado como salvo.

#### Scenario: Falha de disco com editor aberto
- **WHEN** o disco está cheio ou a gravação não tem permissão
- **THEN** o app informa a falha e mantém a edição em memória disponível para tentar novamente ou exportar.

### Requirement: Fechamento com gravações pendentes
O sistema SHALL coordenar o fechamento normal enviando todos os snapshots ainda em debounce e aguardando os commits e as preferências pendentes antes de encerrar. Uma falha SHALL manter o aplicativo aberto e apresentar recuperação; descarte de trabalho pendente SHALL exigir ação explícita.

#### Scenario: Editar e fechar imediatamente
- **WHEN** a pessoa digita uma alteração e fecha a janela antes de disparar o debounce
- **THEN** a última alteração é enviada e gravada antes do encerramento e reaparece ao reabrir.

#### Scenario: Sair enquanto a gravação está em andamento
- **WHEN** o comando Sair é acionado com revisões aguardando commit
- **THEN** o app aguarda a confirmação das revisões mais recentes antes de terminar.

#### Scenario: Falha ao fechar
- **WHEN** a gravação falha ou o renderer não responde durante a negociação de fechamento
- **THEN** o app permanece aberto, informa o problema e oferece tentar novamente, exportar o trabalho pendente ou retornar ao editor, sem descarte automático.

### Requirement: Recuperação de arquivos editoriais
O sistema SHALL preservar a última cópia anterior válida de cada guia e validar arquivos ao abri-los. A recuperação SHALL informar o uso de uma cópia anterior, conservar o arquivo corrompido e permitir acesso aos guias válidos.

#### Scenario: Recuperar um guia corrompido
- **WHEN** o arquivo de um guia está inválido e existe uma cópia anterior válida
- **THEN** o app recupera a cópia, informa a recuperação e preserva o arquivo inválido.

#### Scenario: Arquivo inválido sem cópia utilizável
- **WHEN** um guia não pode ser lido e não há cópia válida
- **THEN** o app informa o erro sem criar um arquivo vazio em seu lugar nem apagar outros guias.

#### Scenario: Não restaurar uma exclusão deliberada
- **WHEN** um guia foi excluído e ainda existe uma cópia histórica de recuperação
- **THEN** o reinício não o adiciona novamente à biblioteca automaticamente.

### Requirement: Compatibilidade do formato em disco
O sistema SHALL identificar a versão do formato de armazenamento, preservar originais antes de migrar e rejeitar gravações sobre formato mais novo não suportado.

#### Scenario: Abrir perfil de versão mais nova
- **WHEN** uma versão antiga encontra formato de armazenamento não suportado
- **THEN** informa a incompatibilidade e preserva o arquivo sem sobrescrevê-lo.
