## 1. Base Electron, identidade e protocolo

- [x] 1.1 Adicionar manifesto npm, lockfile e versões estáveis compatíveis de Node, Electron e electron-builder, com scripts de desenvolvimento e distribuição.
- [x] 1.2 Fixar identidade SideMaster e diretórios de produção, desenvolvimento e testes; configurar sessão persistente separada dos guias e preservar dados na atualização/desinstalação padrão.
- [x] 1.3 Implementar bloqueio de instância única antes da abertura da biblioteca e restaurar/focar a janela ao receber segunda execução.
- [x] 1.4 Criar janela isolada e protocolo local seguro com validação de host, método e caminhos; configurar CSP e impedir navegação/popups arbitrários.
- [x] 1.5 Criar preload com operações específicas para guias, preferências, fechamento e arquivos de exportação, validando origem, remetente, IDs e payloads no processo principal.
- [x] 1.6 Ocultar a barra de menus padrão do Electron nas janelas do aplicativo e verificar o resultado no smoke test empacotado.

## 2. Arquivos editoriais e recuperação

- [x] 2.1 Implementar listagem, criação, leitura, gravação e exclusão por arquivo de guia, com formato versionado e sem regravar a biblioteca inteira.
- [x] 2.2 Implementar filas por guia, revisões crescentes e commit por arquivo temporário sincronizado seguido de substituição atômica no mesmo filesystem.
- [x] 2.3 Preservar cópia anterior válida, detectar arquivos corrompidos e formatos futuros, recuperar sem sobrescrever originais nem restaurar exclusões deliberadas.
- [x] 2.4 Persistir preferências em arquivo separado e restaurar seleção, expansão, layout e geometria da janela dentro dos monitores disponíveis.
- [x] 2.5 Verificar ordenação de gravações, revisão obsoleta, falha antes do commit, falta de permissão/disco e recuperação de guia corrompido em perfil temporário.

## 3. Editor e fechamento seguro

- [x] 3.1 Adaptar o repositório do editor ao backend desktop, preservando normalização e IDs e eliminando substituições globais da biblioteca na inicialização/importação/exclusão desktop.
- [x] 3.2 Integrar debounce de 300 ms, snapshots completos e confirmações por revisão, mantendo a edição pendente quando uma gravação anterior termina.
- [x] 3.3 Coordenar fechar janela e Sair: suspender novas edições, enviar snapshots ainda em debounce, aguardar filas/preferências e só então encerrar.
- [x] 3.4 Implementar recuperação de falha no fechamento com tentar novamente, exportar edição pendente e voltar ao editor; exigir ação explícita para descartar.
- [x] 3.5 Verificar editar e fechar imediatamente, sair durante commit, falha ao fechar, segunda execução e reinício com a última revisão confirmada.
- [x] 3.6 Verificar IndexedDB/cache e Scryfall sob a origem local, com e sem rede, preservando as regras existentes de consulta e os dados editoriais em arquivos separados.

## 4. Arquivos por guia e PDF nativo

- [x] 4.1 Exportar JSON do snapshot do guia ativo com envelope unitário, atualizar rótulos da interface e remover a exportação de biblioteca inteira.
- [x] 4.2 Importar um guia por operação, aceitar objeto/envelope legado e oferecer seleção única para arquivos de biblioteca; rejeitar conflito de ID sem sobrescrita.
- [x] 4.3 Implementar diálogos nativos e gravação de JSON, HTML e HTML Patreon, distinguindo sucesso após commit, cancelamento e erro.
- [x] 4.4 Preparar documento de PDF a partir do guia atual, incorporando imagens em cache e limitando a espera de recursos indisponíveis.
- [x] 4.5 Implementar janela oculta restrita e `printToPDF` em A4 com fundos e estilos; salvar por diálogo nativo e limpar janela/recursos em conclusão, cancelamento ou falha.
- [x] 4.6 Verificar JSON por guia e legado, conflito/arquivo inválido, exportação com edição pendente e cancelamento/erro de escrita; conferir PDF A4, paginação, imagens e nomes com e sem rede.

## 5. Distribuição Linux e Windows

- [x] 5.1 Configurar lista positiva de recursos de execução e ícones/metadados; excluir documentos fonte, recortes, scripts auxiliares, testes, OpenSpec, guias pessoais e saídas anteriores.
- [x] 5.2 Configurar comandos para AppImage Linux x64, instalador NSIS e executável Portable Windows x64 com electron-builder, incluindo um comando conjunto para AppImage e Portable.
- [x] 5.3 Preparar jobs separados de build/verificação e publicação de artefatos Linux/Windows; documentar versões, dependências do host, requisitos AppImage e execução dos comandos.
- [x] 5.4 Gerar e inspecionar o AppImage e executá-lo fora do checkout, verificando isolamento do perfil, edição, persistência e exportação.
- [ ] 5.5 Gerar e inspecionar NSIS e Portable; instalar/executar ambos e atualizar o NSIS no Windows, verificando os mesmos fluxos e preservação dos dados. Pendente: executar o job `windows-packages` em runner Windows; este host Linux não pode produzir essa evidência.
- [x] 5.6 Registrar evidências por sistema e instruções de uso, localização dos dados, recuperação, transferência por JSON e limites do salvamento em encerramento forçado; validar a change no OpenSpec.
