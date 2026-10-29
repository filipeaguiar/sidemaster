## Why

O SideMaster precisa permitir publicar seus guias em inglês e outros idiomas sem copiar manualmente cada seção para uma ferramenta externa. Um modelo de tradução executado no Ollama local pode processar o guia completo em unidades pequenas, adequadas a hardware modesto, mantendo revisão humana e preservando a estrutura editorial.

## What Changes

- Adicionar uma área específica **Traduções**, acessível pelo guia, com configuração, histórico por idioma, acompanhamento e revisão lado a lado.
- Detectar automaticamente o Ollama em `localhost:11434`, listar os modelos disponíveis e permitir selecionar um modelo instalado, inclusive modelos especializados em tradução, sem fixar um produto ou tamanho de modelo.
- Permitir escolher idioma de origem e destino, com inglês como sugestão inicial e suporte a outros idiomas por código de idioma.
- Traduzir todo o conteúdo autoral do guia, percorrendo sua árvore e seus campos; manter parágrafos/listas como blocos visuais e enviar seus subtrechos de prosa sequencialmente, preservando a estrutura pelo aplicativo e verificando cartas, quantidades e herança de variantes.
- Salvar rascunhos e resultados após cada unidade, oferecendo pausa, retomada, cancelamento, repetição de falhas e edição manual. Identificar alterações posteriores no original.
- Gerar uma cópia independente, editável e identificada pelo idioma a partir da tradução completa, sem sobrescrever o guia de origem. Reutilizar as exportações JSON, HTML, HTML Patreon e PDF com rótulos de leitura no idioma de destino quando disponíveis.
- Manter edição, leitura e exportação utilizáveis sem Ollama. A integração desta etapa utiliza o aplicativo Electron e modelos locais; o modo navegador continua com seus fluxos existentes.

## Capabilities

### New Capabilities

- `ollama-connection`: descoberta do serviço local, catálogo e seleção de modelos, verificação de compatibilidade e transporte restrito pelo Electron.
- `guide-translation`: inventário completo de conteúdo, segmentação, preservação estrutural, execução sequencial recuperável e criação de cópia traduzida.
- `translation-workspace`: gerenciamento por guia e idioma, configuração, progresso, revisão e ações sobre traduções.

### Modified Capabilities

- `translation-readiness`: evoluir a preparação futura para execução opcional de tradução local, conservando campos endereçáveis e elementos estruturados.
- `guide-export`: incluir idioma e rascunhos de tradução no JSON e apresentar a cópia traduzida nas saídas de leitura, com idioma do documento e rótulos localizados.

## Impact

- Estender `electron/main.cjs` e `electron/preload.cjs` com operações específicas para descoberta, geração e cancelamento; adicionar adaptador HTTP local sem expor rede arbitrária ao renderer.
- Adicionar módulos de inventário/segmentação/execução e tela de tradução, integrando `src/editor.js`, `src/model.js`, `src/storage.js`, `src/reading.js`, `index.html` e estilos.
- Ampliar o esquema de guia de forma retrocompatível para idioma, registros de tradução, checkpoints e procedência das cópias. Reutilizar persistência local e gravação atômica existentes.
- Coordenar com a change ativa `electron-desktop-app`, cuja infraestrutura já está presente no checkout; não condicionar esta proposta à validação ainda pendente dos pacotes Windows.
- Dependência de execução externa: Ollama e modelo instalados pelo usuário. Não instalar, baixar, iniciar serviços nem usar provedores em nuvem nesta change. Não traduzir a interface administrativa inteira nem escolher um modelo obrigatório.
