## MODIFIED Requirements

### Requirement: SM-076 — Compatibilidade com Markdown comum

O sistema SHALL preservar links e imagens Markdown comuns como `[texto](url)` e `![descrição](url)`, distinguindo-os das referências de cartas sem URL e respeitando referências de link explicitamente definidas no próprio Markdown. Em links externos inline, o destino iniciado por `http://` ou `https://` SHALL ter precedência sobre a interpretação do rótulo como carta. Renderização, coleta de referências e proteção para tradução SHALL adotar a mesma distinção, sem consultar o catálogo para rótulos ou destinos de links/imagens comuns. `[Carta]` e `![Carta]` sem destino SHALL manter a semântica de carta.

Origem: `docs/requisitos-v1.md`, linhas 134. Classificação: detalhamento proposto, complementado pela solicitação desta change.

#### Scenario: SM-076.1 — Link e imagem comuns
- **WHEN** o campo contém um link com URL e uma imagem com URL
- **THEN** os dois são renderizados como Markdown comum e não geram consultas de cartas pelo texto dos rótulos.

#### Scenario: SM-076.2 — Definição explícita de link
- **WHEN** o Markdown define `[referência]: https://example.org` e usa `[referência]`
- **THEN** o link explicitamente definido é respeitado como link comum.

#### Scenario: SM-076.3 — Misturar carta e links externos
- **WHEN** um parágrafo contém `[Myr Enforcer]`, `![Island]`, `[artigo](https://example.org/a?x=1&y=2#parte)` e `[lista](http://example.org/lista)`
- **THEN** apenas Myr Enforcer e Island são referências de cartas, os links mantêm rótulos e destinos completos e não aparecem como cartas ausentes no painel.

#### Scenario: SM-076.4 — Rótulo igual a nome de carta
- **WHEN** o guia contém `[Myr Enforcer](https://example.org)`
- **THEN** o trecho é um link externo comum, sem hover de carta nem consulta ao catálogo pelo rótulo.

#### Scenario: SM-076.5 — Preservar links na tradução e saídas
- **WHEN** um guia com links HTTP/HTTPS é traduzido ou exportado para HTML, HTML Patreon, PDF ou JSON
- **THEN** os destinos permanecem preservados, o rótulo pode ser traduzido como prosa, as saídas de leitura mantêm links acionáveis e o JSON conserva a sintaxe editável.

## ADDED Requirements

### Requirement: Abertura externa de links HTTP e HTTPS no desktop

O aplicativo Electron SHALL abrir links Markdown externos válidos com protocolo HTTP ou HTTPS no navegador padrão, preservando o guia aberto. SHALL manter o bloqueio de navegação interna arbitrária e de abertura externa de outros protocolos.

#### Scenario: Abrir cada protocolo a partir do guia
- **WHEN** a pessoa aciona um link HTTP ou HTTPS na prévia do editor ou na leitura da tradução
- **THEN** o destino é encaminhado ao navegador padrão e o editor permanece no guia atual.

#### Scenario: Destino fora dos protocolos aceitos
- **WHEN** o conteúdo tenta abrir um destino com protocolo `javascript:` ou `file:`
- **THEN** o aplicativo não executa o destino nem o encaminha ao navegador externo.
