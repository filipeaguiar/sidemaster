## Why

O SideMaster precisa abrir como aplicativo desktop e preservar o trabalho editorial durante a edição, o fechamento e as atualizações. A versão Electron terá uma pasta de dados própria, arquivos independentes por guia e distribuição para Linux e Windows.

## What Changes

- Iniciar o editor em janela Electron sem a barra de menus nativa, com instância única; uma segunda abertura traz a janela existente para frente.
- Salvar automaticamente cada guia em um JSON local por meio do processo principal, com revisões ordenadas, substituição atômica e cópia anterior recuperável. Salvar preferências em arquivo separado.
- Aguardar o envio das últimas edições e a conclusão das gravações antes do fechamento normal; apresentar opções de recuperação se a gravação falhar.
- Fixar a identidade do aplicativo e separar os perfis de produção e desenvolvimento, preservando dados entre atualizações.
- Exportar e importar JSON de um guia por operação, preservando a biblioteca restante. Arquivos legados de biblioteca permitem selecionar um guia para importar.
- Gerar PDF A4 diretamente com Electron e oferecer diálogos nativos para salvar JSON, HTML, HTML Patreon e PDF, distinguindo sucesso, cancelamento e erro.
- Empacotar Linux x64 como AppImage e Windows x64 como instalador NSIS e executável Portable `.exe`, usando electron-builder e apenas arquivos necessários à execução.
- Permitir gerar o AppImage e o executável Portable com um comando em Linux preparado para build Windows cruzado.
- Carregar recursos locais por protocolo seguro, usar preload restrito e preservar o cache Scryfall em IndexedDB no perfil do app.

## Capabilities

### New Capabilities
- `desktop-app`: janela Electron, instância única, isolamento, identidade estável e pacotes AppImage/Windows.

### Modified Capabilities
- `guide-storage`: armazenamento de guias em arquivos locais, preferências, gravação ordenada, recuperação e fechamento com gravações pendentes.
- `guide-export`: JSON por guia, compatibilidade com arquivos legados, exportações nativas e geração direta de PDF.

## Impact

- Adicionar processo principal, preload com operações específicas, persistência em arquivos, janela interna de PDF e configuração electron-builder.
- Adaptar `src/storage.js` e os eventos de importação, exportação, preferências e salvamento em `src/editor.js`; reutilizar modelo, validação e renderização.
- Manter IndexedDB para dados e imagens de cartas. O cache é regenerável e separado dos arquivos editoriais.
- Adicionar manifesto npm, lockfile, identidade/ícones e comandos de desenvolvimento, testes e builds para Linux/Windows.
- Excluir do pacote PPTX/HTML de referência, recortes, scripts auxiliares, testes, OpenSpec e cópias de guias presentes no checkout.
- Transferir guias da origem do navegador por JSON, sem ler ou alterar perfis de outros navegadores.
