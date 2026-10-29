## ADDED Requirements

### Requirement: Aplicativo desktop independente
O sistema SHALL iniciar o editor em uma janela Electron no Linux e no Windows, sem exigir navegador externo, checkout ou servidor de desenvolvimento para executar o pacote distribuído.

#### Scenario: Abrir sem barra de menus nativa
- **WHEN** a pessoa abre o aplicativo distribuído no Linux ou Windows
- **THEN** a janela do editor não exibe a barra de menus padrão do Electron.

#### Scenario: Abrir o pacote desktop
- **WHEN** a pessoa inicia o AppImage no Linux ou o aplicativo instalado no Windows
- **THEN** a interface de edição abre com biblioteca, árvore, formulário e prévia do guia.

#### Scenario: Distribuir versão portátil no Windows
- **WHEN** a pessoa executa o arquivo Portable `.exe` gerado junto ao instalador
- **THEN** o app inicia sem instalação e mantém os guias no perfil local do SideMaster, separado do executável.

#### Scenario: Executar em desenvolvimento
- **WHEN** a pessoa usa o comando documentado de desenvolvimento
- **THEN** a janela abre os recursos locais do projeto usando um perfil de desenvolvimento isolado.

### Requirement: Recursos locais e uso sem rede
O sistema SHALL servir os módulos e recursos empacotados sob uma origem local estável, padrão e segura, compatível com imports relativos, Fetch e IndexedDB. A leitura e a edição dos guias locais SHALL funcionar sem rede; cartas não disponíveis em cache SHALL continuar identificadas pelo nome e estado apropriado.

#### Scenario: Carregar os recursos empacotados
- **WHEN** a versão distribuída inicia
- **THEN** HTML, CSS e módulos ES carregam sem servidor HTTP local.

#### Scenario: Editar sem conexão
- **WHEN** o app inicia sem rede e possui guias locais
- **THEN** os guias podem ser abertos e salvos e as imagens já armazenadas continuam disponíveis.

### Requirement: Renderer Electron isolado
O sistema SHALL manter Node.js indisponível ao renderer, habilitar isolamento de contexto e sandbox, manter `webSecurity` ativo e bloquear navegação e janelas arbitrárias. O preload SHALL expor apenas operações específicas, com validação do remetente, origem e argumentos no processo principal, sem APIs genéricas de filesystem ou IPC.

#### Scenario: Abrir link externo
- **WHEN** a pessoa aciona um link HTTPS externo válido no guia
- **THEN** o link abre no navegador padrão sem substituir a interface Electron.

#### Scenario: Ampliar imagem já em cache
- **WHEN** a pessoa aciona uma imagem com URL local `blob:`
- **THEN** o visualizador interno apresenta a imagem sem enviar a URL ao shell do sistema.

#### Scenario: Bloquear acesso privilegiado inválido
- **WHEN** um pedido contém origem não autorizada, ID inválido, caminho arbitrário ou payload incompatível
- **THEN** o processo principal rejeita a operação sem ler ou gravar arquivos fora do escopo permitido.

#### Scenario: Bloquear popups arbitrários
- **WHEN** o renderer tenta abrir uma janela por `window.open` ou navegar para outra origem
- **THEN** a operação é bloqueada; a janela de PDF só é criada pela operação nativa específica.

#### Scenario: Restringir recursos locais
- **WHEN** uma requisição ao protocolo tenta acessar host, método ou caminho não permitido
- **THEN** o handler rejeita a requisição e não entrega arquivos fora dos recursos empacotados.

### Requirement: Instância única por perfil
O sistema SHALL manter apenas uma instância editora por perfil de dados, adquirindo o bloqueio antes de abrir ou modificar a biblioteca.

#### Scenario: Abrir o aplicativo novamente
- **WHEN** a pessoa inicia outra execução com o perfil de produção já aberto
- **THEN** a nova execução não abre outro editor nem grava dados e restaura/foca a janela existente.

### Requirement: Identidade e perfis estáveis
O sistema SHALL manter identidade e diretório de dados estáveis entre versões do pacote e separar produção, desenvolvimento e verificações automatizadas.

#### Scenario: Atualizar o executável
- **WHEN** a pessoa substitui o AppImage ou atualiza o instalador Windows
- **THEN** a biblioteca e as preferências previamente confirmadas são recuperadas no mesmo perfil.

#### Scenario: Executar a versão de desenvolvimento
- **WHEN** a versão de desenvolvimento é aberta com a produção existente
- **THEN** seus dados e gravações não alteram o perfil de produção.

### Requirement: Distribuição AppImage e Windows
O sistema SHALL fornecer comandos reproduzíveis para gerar AppImage Linux x64 e instalador NSIS Windows x64, com metadados e ícones do SideMaster. O pacote SHALL incluir somente recursos necessários à execução e dependências de produção.

#### Scenario: Executar os artefatos fora do checkout
- **WHEN** os artefatos são iniciados em seus sistemas alvo sem checkout nem servidor de desenvolvimento
- **THEN** o editor abre e permite salvar, reabrir e exportar um guia.

#### Scenario: Inspecionar os arquivos empacotados
- **WHEN** o conteúdo do pacote é inspecionado
- **THEN** estão presentes os recursos de execução e ausentes documentos fonte, recortes, guias pessoais, scripts auxiliares, OpenSpec e builds anteriores.

#### Scenario: Verificar compatibilidade Windows
- **WHEN** um pacote Windows é produzido em outro sistema
- **THEN** a geração e a execução no Windows são registradas como verificações distintas e a execução só é considerada concluída com evidência no sistema alvo.
