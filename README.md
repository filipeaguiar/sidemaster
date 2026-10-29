# SideMaster

Aplicativo desktop para criar, revisar e compartilhar guias de sideboard de Magic: The Gathering, com foco em Pauper.

## Downloads

Baixe a versão para seu sistema na [página de releases](https://github.com/filipeaguiar/sidemaster/releases/latest):

- **Windows x64:** executável Portable, sem instalação.
- **Linux x64:** AppImage; conceda permissão de execução antes de abrir.

Os executáveis incluem Electron e não exigem Node.js no computador de destino. Os hashes SHA-256 acompanham a release.

## Recursos

- Biblioteca local de guias e edição em Markdown.
- Seções e subseções, planos de matchup, variantes com herança e exemplos de mãos iniciais.
- Referências e imagens de cartas consultadas no Scryfall, com cache local.
- Prévia integral e exportação JSON, HTML, HTML para Patreon e PDF.
- Tradução opcional com Ollama local, revisão humana, checkpoints, pausa e retomada.
- Leitura do original à esquerda e tradução progressiva à direita, com navegação por seção e rolagem sincronizada opcional.
- Posição e Momento das mãos de matchup com a opção Sempre, apresentada como Always na leitura em inglês.

Os guias pessoais ficam no perfil do aplicativo. Use exportação/importação JSON para transferi-los entre computadores. Os exemplos e imagens de trabalho usados durante o desenvolvimento não fazem parte deste repositório.

## Tradução com Ollama

Instale e inicie o Ollama separadamente e disponibilize um modelo local com geração de texto. Ao abrir **Traduções**, o SideMaster procura o serviço em `localhost:11434` e lista os modelos instalados.

Escolha os idiomas e o modelo, use **Testar trecho** e confira a amostra. Depois, clique em **Iniciar tradução** ou **Continuar tradução**. O aplicativo processa trechos pequenos, preserva elementos estruturados e salva cada parte antes de avançar. Revise o texto antes de publicar: a validação estrutural não certifica qualidade linguística.

Veja [o guia de tradução](docs/traducoes-ollama.md) para configuração, recuperação e limites.

## Desenvolvimento

Requisitos: Node.js 22.12 ou superior e npm.

```sh
npm ci
npm test
npm start
```

O modo de desenvolvimento usa o perfil `SideMaster-dev`, separado do perfil de produção. Para editar o conteúdo, o aplicativo não depende de Ollama.

## Builds

```sh
# AppImage Linux
npm run dist:linux

# Instalador e Portable Windows
npm run dist:win

# AppImage Linux e Portable Windows
npm run dist:appimage-portable
```

Os arquivos são gerados em `release/`. O build AppImage exige Linux. Para gerar os pacotes Windows em Linux, instale Wine; para validar instalação e atualização nativas, use Windows ou o workflow do GitHub Actions. `npm run icons` recria os ícones a partir do SVG e requer ImageMagick.

Veja [a documentação desktop](docs/electron-desktop.md) para requisitos, armazenamento e verificações. O [workflow Desktop packages](.github/workflows/desktop-packages.yml) executa builds e verificações em Linux e Windows.

## Estrutura

- `src/`: editor, leitura, cartas, armazenamento e tradução.
- `electron/`: processo principal, preload, persistência em disco e cliente Ollama.
- `tests/`: testes automatizados em Node.js.
- `scripts/`: geração de ícones e verificações desktop.
- `docs/`: requisitos, instruções e registros de validação.
- `openspec/`: especificações e histórico das mudanças planejadas.

Os scripts Python na raiz são utilitários auxiliares de extração e preparação de guias; usam dependências e arquivos de referência externos e não são necessários para executar ou construir o aplicativo.
