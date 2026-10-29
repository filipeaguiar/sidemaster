## Context

O frontend atual usa módulos ES, `localStorage` para a biblioteca e preferências, e IndexedDB para catálogo e imagens. As gravações dos guias são adiadas por 350 ms; não há protocolo de fechamento. A exportação JSON inclui todos os guias; o PDF depende de `window.open`, `document.write` e impressão pelo navegador.

O renderer Electron continuará editando e renderizando o guia. O processo principal será o único responsável pelos arquivos editoriais, diálogos e geração do PDF. Esta revisão incorpora instância única, JSON por guia, AppImage e Windows pedidos pelo usuário. O armazenamento em arquivos, a identidade e o fluxo de fechamento abaixo são a recomendação técnica para revisão.

## Goals / Non-Goals

**Goals:**
- Abrir o editor localmente em Linux e Windows, com apenas uma instância por perfil.
- Usar a área da janela para o editor, ocultando a barra de menus nativa do Electron.
- Manter guias e preferências em arquivos locais recuperáveis, com salvamento assíncrono durante a edição.
- Concluir gravações pendentes antes do fechamento normal e permitir recuperar edições quando houver falha.
- Exportar/importar um guia por operação e gerar PDF A4 com diálogo nativo de destino.
- Gerar AppImage Linux x64 e instalador NSIS Windows x64 com identidade estável e conteúdo de execução selecionado.

**Non-Goals:**
- Sincronização remota, colaboração, banco de dados remoto ou acesso automático ao perfil Chrome/Firefox.
- Instalador macOS, outras arquiteturas, publicação, assinatura de binários ou atualização automática nesta change.
- Preservar edições ainda não confirmadas em caso de encerramento forçado pelo sistema ou falha física do disco.

## Decisions

### 1. Arquivos locais por guia e preferências separadas

A pasta do perfil de produção conterá:

```text
SideMaster/
  guides/<guideId>.json
  recovery/<guideId>.bak.json
  settings.json
  session/                         # IndexedDB e dados Chromium regeneráveis
```

Cada arquivo editorial conterá versão do formato de armazenamento, revisão e o guia completo. IDs existentes, identidade das cartas, versões editoriais e campos Markdown serão preservados; a revisão de gravação não substitui a versão editorial nem o schema do guia. A biblioteca será obtida dos arquivos de guias, sem um arquivo monolítico obrigatório que concentre todo o conteúdo.

`settings.json` guardará o guia e a seção selecionados, expansão da árvore, larguras dos painéis e estado da janela. Restauração de geometria manterá a janela acessível em monitores disponíveis. O cache Scryfall continua em IndexedDB sob `session/`, com o comportamento de consultas já definido em `card-catalog`. O JSON portátil de um guia não inclui preferências nem cache.

O contrato de repositório terá um adaptador desktop sobre operações específicas do preload: listar, gravar e excluir guia; ler e gravar preferências. Inicialização, importação e exclusão deixam de regravar toda a biblioteca no desktop. O caminho web existente pode continuar usando seu adaptador local enquanto houver acesso pelo navegador.

**Alternativas consideradas:** manter todo o estado no `localStorage` conserva o vínculo com a origem Chromium e regrava a biblioteca inteira; um único JSON de sistema concentra o risco de corrupção e aumenta as escritas; SQLite adicionaria migração e dependências sem necessidade para o modelo documental atual.

### 2. Gravações assíncronas, ordenadas e recuperáveis

O renderer mantém a edição fluida, marca a revisão como pendente e envia snapshots completos do guia com debounce curto de 300 ms. Gravações são executadas no processo principal, em fila por guia e com revisões crescentes. Uma resposta de revisão antiga não marca uma edição mais recente como salva. Criação, importação e exclusão aguardam sua confirmação no processo principal.

Para cada atualização, validar a estrutura e o ID, escrever arquivo temporário no mesmo diretório, sincronizar e fechar o arquivo e substituir o destino por renomeação compatível com a plataforma. Preservar a cópia anterior validada em `recovery/` também por gravação segura. Só confirmar “salvo” depois do commit da revisão. Em erro, preservar o último arquivo válido, manter o snapshot em memória e apresentar a falha.

Ao iniciar, arquivos temporários incompletos não substituem dados confirmados. Um guia corrompido pode ser recuperado da cópia válida anterior, com aviso e preservação do arquivo corrompido para diagnóstico. Outros guias permanecem acessíveis. Sem cópia válida, informar o problema sem substituir silenciosamente por um guia vazio. A recuperação de corrupção exige que o guia exista em `guides/`; não ressuscitar guias excluídos a partir de backups remanescentes.

A atomicidade evita um JSON parcialmente substituído após falha do processo. Ela não é uma promessa de durabilidade absoluta diante de falhas de hardware ou desligamento forçado antes da confirmação.

### 3. Fechamento coordenado e instância única

O fechamento normal segue: suspender novas edições, solicitar ao renderer o envio de todos os snapshots ainda em debounce, aguardar confirmações das revisões mais recentes e preferências, concluir as filas e só então destruir a janela e encerrar o processo. O mesmo procedimento vale para fechar a janela e para o comando Sair. O último caractere ainda não enviado faz parte dessa negociação.

Se uma gravação falhar ou o renderer não responder dentro do prazo, manter o aplicativo aberto e oferecer tentar novamente, exportar a edição pendente ou voltar ao editor. Exportar não descarta automaticamente a edição. Sair descartando trabalho exige uma ação explícita adicional. Uma saída limpa não mostra confirmação extra a cada fechamento bem-sucedido. Não depender de gravação iniciada depois de o processo terminar.

Usar `app.requestSingleInstanceLock` antes de abrir a biblioteca e de aceitar gravações. Uma segunda execução do mesmo perfil restaura e foca a janela existente. Desenvolvimento utiliza perfil e lock distintos para não editar dados de produção durante verificações.

### 4. Identidade fixa e atualização

Fixar `name: sidemaster`, `productName: SideMaster` e `appId: io.sidemaster.app`. O processo principal define a raiz de `userData` como `SideMaster` dentro de `app.getPath('appData')`, com `sessionData` em sua subpasta `session`, antes de inicializar sessão/janela. Desenvolvimento usa `SideMaster-dev`; verificações automatizadas usam diretório temporário isolado.

Nome do executável, versão do pacote ou localização do AppImage não alteram a raiz dos guias. Atualização/reinstalação do executável conserva o perfil. O instalador Windows não remove dados do usuário na desinstalação padrão. Migrações de formato preservam cópia anterior antes de alterar arquivos.

### 5. Renderer isolado e protocolo local

Registrar um esquema padrão, seguro e compatível com Fetch/CORS antes de `ready`; carregar o app em origem fixa `sidemaster://app/`. O handler serve apenas recursos de execução permitidos e rejeita hosts, métodos e caminhos fora dessa raiz, inclusive travessia de diretórios.

Usar `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true` e `webSecurity` ativo. O preload expõe somente métodos específicos, com validação de remetente/origem, IDs, revisões, schema e tamanho dos payloads. Não expor `ipcRenderer`, canais genéricos, caminhos de gravação livres, shell nem APIs de filesystem ao renderer. Caminhos de exportação são obtidos por diálogo controlado pelo processo principal.

Bloquear navegação externa e popups arbitrários. Links HTTPS validados abrem no navegador do sistema. Imagens em cache com URL `blob:` permanecem no visualizador interno; não são passadas ao shell. A CSP permite módulos e estilos locais, os estilos gerados necessários e recursos Scryfall, `blob:` e `data:` conforme o tipo; não permitir scripts arbitrários do guia.

Referências: [Electron security](https://www.electronjs.org/docs/latest/tutorial/security/), [protocol](https://www.electronjs.org/docs/latest/api/protocol/) e [app](https://www.electronjs.org/docs/latest/api/app).

### 6. Importação/exportação por guia e gravação nativa

Exportar apenas o snapshot atual do guia selecionado, inclusive as edições ainda não confirmadas no armazenamento interno. Manter o envelope JSON existente com `schemaVersion`, `exportedAt` e `guides` contendo exatamente um guia. A API desktop usa diálogo nativo e só retorna sucesso após a gravação do arquivo escolhido; cancelamento e erro têm resultados distintos.

Importação valida o arquivo inteiro antes de persistir um guia. Aceitar o envelope unitário e o objeto legado de guia. Para um JSON legado com vários guias, apresentar seleção explícita e importar somente o escolhido, preservando os restantes na biblioteca e no arquivo de origem. IDs já existentes são rejeitados com mensagem clara e sem sobrescrita; substituir/mesclar fica fora desta change.

JSON, HTML e HTML Patreon usam diálogo de salvamento e mensagens corretas de conclusão/cancelamento/falha. Retirar textos de interface que prometem backup de toda a biblioteca. Os exports HTML continuam portáteis, com imagens remotas conforme `guide-export`; o formato JSON do guia não depende da organização interna do perfil desktop.

### 7. PDF direto pelo Electron

Usar uma operação específica de exportação PDF no preload. Capturar o guia atual e preparar HTML de impressão com a renderização existente. Preferir imagens já em cache, incorporando seus bytes ao documento de impressão; resolver imagens restantes com prazo limitado e manter nomes/quantidades legíveis se indisponíveis. Não converter as imagens locais de volta em URLs remotas durante essa preparação para PDF.

O processo principal valida o pedido e cria uma janela oculta, isolada, de duração limitada, que carrega apenas o documento de impressão por recurso interno temporário. Ela não possui API de escrita em disco nem executa scripts do conteúdo editorial; navegação e popups ficam bloqueados. O recurso temporário não expõe arquivos locais arbitrários.

Aguardar documento, fontes e imagens até o prazo definido; gerar bytes com `webContents.printToPDF` em A4, estilos de impressão e fundos habilitados. Salvar no destino escolhido no diálogo nativo e informar sucesso apenas após a gravação. Cancelar ou falhar encerra a janela e limpa os recursos temporários sem fechar o editor. Não usar uma exceção geral para permitir `window.open('about:blank')`.

Referência: [Electron webContents.printToPDF](https://www.electronjs.org/docs/latest/api/web-contents#contentsprinttopdfoptions).

### 8. AppImage, Windows e arquivos necessários

Usar uma versão estável de `electron-builder`, com lockfile, no lugar de Electron Forge. Ele oferece diretamente AppImage e NSIS: [documentação estável](https://www.electron.build/v26/docs/).

Entregar Linux x64 em `.AppImage`, instalador NSIS Windows `.exe` e executável Portable Windows `.exe`, com ícones e metadados SideMaster. `npm run dist:win` deve gerar NSIS e Portable em uma chamada; `npm run dist:appimage-portable` deve gerar o AppImage e o Portable na mesma chamada em Linux com Wine. Ambos os pacotes Windows usam o perfil local `%APPDATA%/SideMaster`, separado do arquivo executável. Cross-build não substitui a execução real no sistema alvo. Configurar o workflow para anexar os pacotes como artefatos baixáveis; execução hospedada depende de um repositório/runner disponível, sem publicação automática.

A lista positiva de inclusão contém manifesto de runtime, processo principal/preload, `index.html`, módulos e CSS efetivamente usados em `src/`, página de impressão, ícones e dependências de produção. Inspecionar o pacote resultante. Excluir `sources/`, `all_card_arts/`, recortes/templates, scripts Python, guias JSON de referência, `tests/`, `docs/`, `openspec/`, `.codex/`, arquivos de desenvolvimento e builds anteriores. Guias e preferências reais ficam no perfil do usuário e nunca entram no instalador.

Documentar versões Node/Electron suportadas e dependências do host e do runtime, inclusive requisitos AppImage/FUSE da distribuição usada na verificação. Criação de binário Windows em Linux não comprova instalação e execução no Windows.

## Risks / Trade-offs

- [Mais operações nativas e IPC] → Bridge pequena por operação, validação em main e testes de payloads, origem e caminhos inválidos.
- [Escritas concorrentes ou falha no meio do commit] → Instância única, filas por arquivo, revisões, substituição atômica e cópia anterior validada.
- [Disco cheio ou sem permissão no encerramento] → Manter a janela aberta e oferecer recuperação/exportação da edição em memória.
- [Grande volume de imagens] → Manter cache regenerável separado dos JSONs editoriais; não duplicar imagens em cada guia.
- [CSP ou protocolo afetarem módulos/imagens/PDF] → Exercitar os fluxos na versão empacotada, com e sem rede.
- [Diferenças Linux/Windows no filesystem e impressão] → Executar os mesmos cenários em cada sistema alvo e registrar pendências quando o runner não estiver disponível.

## Migration Plan

1. Preparar identidade, perfis separados, Electron, protocolo e bridge; manter a versão web disponível para exportar dados existentes.
2. Introduzir adaptador de arquivos com backups e migrações versionadas; importar explicitamente guias do navegador via JSON unitário ou seleção em arquivo legado.
3. Integrar salvamento, preferências, fechamento seguro e instância única.
4. Integrar exportação por guia e PDF nativo, preservando campos, herança e estrutura.
5. Gerar e executar AppImage e NSIS, verificar atualização do executável sobre o mesmo perfil e documentar resultados por sistema.

Rollback: os JSONs portáteis por guia continuam importáveis no editor web. Uma versão desktop antiga não pode sobrescrever silenciosamente arquivos de armazenamento com formato mais novo; deve informar incompatibilidade e conservar os originais.

## Open Questions

Nenhuma decisão funcional adicional é necessária para planejar a implementação. Certificados de assinatura, publicação e outras arquiteturas ficam para changes futuras; evidência de execução Windows exige host/runner Windows durante a implementação.
