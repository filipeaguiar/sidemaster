# SideMaster Desktop

## Requisitos e comandos

- Node.js 22.12.x e npm compatível com o `package-lock.json`.
- `npm ci` instala Electron 45.1.0 e electron-builder 26.18.0.
- `npm start` abre o perfil separado `SideMaster-dev`.
- `npm run dist:linux` gera Linux x64 em `release/SideMaster-1.0.0-x86_64.AppImage`.
- `npm run dist:win` gera os dois pacotes Windows x64: instalador `release/SideMaster-1.0.0-Setup.exe` e executável portátil `release/SideMaster-1.0.0-Portable.exe`.
- `npm run dist:appimage-portable` gera somente o AppImage Linux e o `.exe` Portable Windows em uma única chamada. Execute em Linux com Wine instalado; o alvo AppImage exige Linux e o build Windows cruzado no Linux usa Wine.
- Os comandos de build usam `--publish never`: geram pacotes locais ou artefatos do CI. A publicação em Releases é uma ação separada e explícita pelo `gh`.
- As janelas do aplicativo não exibem a barra de menus padrão do Electron.
- Linux exige as bibliotecas compartilhadas do Electron. Para usar AppImage, a distribuição também precisa de FUSE 2 ou de executar `--appimage-extract` e abrir o AppRun extraído.
- Gere o instalador Windows em Windows; o workflow usa `windows-2022` e verifica instalação e inicialização. Build cross-platform em Linux não conta como teste do aplicativo no Windows.

## Ícone

O ícone nativo usa o mesmo símbolo das duas cartas do header, com o losango e uma linha na carta frontal. O SVG está em `electron/assets/sidemaster-icon.svg`. `npm run icons` usa ImageMagick (`magick`) para gerar o PNG de 512 px e o ICO com tamanhos 16, 32, 48, 64, 128 e 256 px; os arquivos gerados são incluídos nos pacotes.

A janela Electron usa PNG no Linux e ICO no Windows. O AppImage inclui o ícone de launcher e `.DirIcon`; o Portable inclui recursos de ícone Windows. A interface também possui favicon SVG com fallback PNG, servido pelo protocolo local somente nos caminhos explícitos desses assets. O identificador de aplicativo Windows e a associação de janela Linux usam `io.sidemaster.app`.

Na revisão de 29/10/2026, a geometria do SVG foi comparada com a do header. O PNG extraído do ícone externo do AppImage correspondeu byte a byte ao asset de 512 px, com `.DirIcon` apontando para ele. Os seis tamanhos do ICO foram encontrados e comparados nos recursos PE de `SideMaster.exe` e do Portable. Os assets, favicon e configuração do processo principal também foram conferidos nos arquivos ASAR empacotados. Essa inspeção não substitui a execução nativa Windows ainda pendente.

## Perfil e transferência

Em produção, os arquivos ficam em `%APPDATA%/SideMaster` no Windows e em `$XDG_CONFIG_HOME/SideMaster` (ou `~/.config/SideMaster`) no Linux. Guias individuais ficam em `guides/<guideId>.json`; cópias anteriores em `recovery/`; preferências em `settings.json`; dados regeneráveis do Chromium/IndexedDB em `session/`. O diretório é independente da pasta de instalação e sobrevive à atualização e à desinstalação padrão do Windows.

Para migrar guias existentes no navegador, exporte cada guia como JSON e importe um por operação no desktop. A exportação JSON do desktop também contém somente o guia ativo. A biblioteca do navegador permanece no seu perfil e não é lida pelo aplicativo.

## Gravação e recuperação

O indicador de gravação confirma cada revisão após a gravação atômica. O fechamento normal envia alterações pendentes e espera a confirmação. Em caso de falha, o app fica aberto e oferece nova tentativa, exportação das edições pendentes, retorno ao editor ou descarte explícito. Arquivos corrompidos são preservados em `recovery/corrupt/` quando há uma cópia recuperável. O sistema operacional ou uma falha física pode interromper uma edição antes da confirmação; exporte cópias JSON periódicas para transferência adicional.

## PDF

O PDF é gerado por uma janela de impressão isolada do Electron, em A4 com fundos e CSS de impressão. Imagens já armazenadas no cache são incorporadas. Imagens sem cache dependem de rede e podem aparecer como nome alternativo se o prazo de carregamento terminar.

## Verificação

`npm test` executa os testes do modelo, parser, imagens e cache. O workflow `.github/workflows/desktop-packages.yml` constrói e inicia o AppImage no runner Linux e constrói, instala e inicia o NSIS em runner Windows. A verificação de atualização entre versões usa o mesmo perfil e não apaga dados durante desinstalação padrão.

Na revisão local atual, o AppImage Linux x64 foi gerado (`release/SideMaster-1.0.0-x86_64.AppImage`, cerca de 120 MB), inspecionado e iniciado fora do checkout, com perfil de teste isolado. O smoke test ponta a ponta confirmou a ausência da barra de menus nativa, selecionou um guia de uma biblioteca legada, rejeitou importações inválidas e IDs duplicados, exportou JSON unitário, HTML, HTML Patreon e PDF, conferiu cancelamento/falha de escrita e fechou imediatamente após uma edição. A revisão final ficou salva em `guides/<guideId>.json`. Uma segunda execução no mesmo perfil saiu sem abrir outro renderer. O PDF foi lido por `pdfinfo`: uma página A4, 594,96 × 841,92 pt.

No mesmo AppImage, Scryfall encontrou Myr Enforcer; a imagem foi armazenada no IndexedDB em `session/IndexedDB`. Depois de encerrar e reabrir o aplicativo com esse perfil e sem chamadas de rede, a carta e a imagem foram recuperadas do cache. O gerador PDF incorpora imagens disponíveis no cache; imagens indisponíveis continuam usando o nome alternativo se não carregarem dentro do prazo. A lista do `app.asar` contém apenas o runtime, ícones, HTML e módulos usados; PPTX/HTML fonte, coleções de arte, recortes, scripts de análise e diretórios de planejamento ficaram fora.

O job Windows está configurado para construir NSIS e Portable 1.0.0, instalar, testar edição e fechamento, tentar uma segunda instância, gerar NSIS e Portable 1.0.1, atualizar a instalação e verificar que o guia continua disponível. Os arquivos Linux e Windows são anexados à execução do workflow como artefatos baixáveis. O job precisa ser executado em um runner Windows para confirmar os executáveis e o ciclo de atualização; esta máquina Linux não fornece essa evidência ainda.
