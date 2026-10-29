## ADDED Requirements

### Requirement: SM-073 — Referência textual com imagem de apoio

No detalhamento proposto, o sistema SHALL interpretar `[Myr Enforcer]` em texto corrido como referência à carta, renderizando seu nome destacado e uma imagem no hover ou toque.

Origem: `docs/requisitos-v1.md`, linhas 130. Classificação: detalhamento proposto.

#### Scenario: SM-073.1 — Referenciar em um parágrafo
- **WHEN** o campo contém `Use [Myr Enforcer] para pressionar.`
- **THEN** a prévia mantém a frase com o nome destacado e permite consultar a imagem da carta.

### Requirement: SM-074 — Modificador de imagem explícita

No detalhamento proposto, o sistema SHALL interpretar `![Myr Enforcer]`, sem URL, como imagem direta da carta no documento.

Origem: `docs/requisitos-v1.md`, linhas 131. Classificação: detalhamento proposto.

#### Scenario: SM-074.1 — Inserir a imagem
- **WHEN** o campo contém `![Myr Enforcer]`
- **THEN** a imagem da carta aparece diretamente na prévia e nas exportações compatíveis.

### Requirement: SM-075 — Referência com quantidade no contexto de lista

No detalhamento proposto, o sistema SHALL interpretar `4 [Myr Enforcer]` como quantidade e carta quando estiver em um campo de lista de deck, sideboard, trocas ou mãos, usando a apresentação própria desse contexto.

Origem: `docs/requisitos-v1.md`, linhas 132. Classificação: detalhamento proposto.

#### Scenario: SM-075.1 — Usar a mesma sintaxe em contextos distintos
- **WHEN** o deck contém `4 [Myr Enforcer]` e uma mão contém `2 [Myr Enforcer]`
- **THEN** o deck agrega quatro na imagem única e a mão mostra duas imagens individuais dessa identidade.

### Requirement: SM-076 — Compatibilidade com Markdown comum

No detalhamento proposto, o sistema SHALL preservar links e imagens Markdown comuns como `[texto](url)` e `![descrição](url)`, distinguindo-os das referências de cartas sem URL e respeitando referências de link explicitamente definidas no próprio Markdown.

Origem: `docs/requisitos-v1.md`, linhas 134. Classificação: detalhamento proposto.

#### Scenario: SM-076.1 — Link e imagem comuns
- **WHEN** o campo contém um link com URL e uma imagem com URL
- **THEN** os dois são renderizados como Markdown comum e não geram consultas de cartas pelo texto dos rótulos.

#### Scenario: SM-076.2 — Definição explícita de link
- **WHEN** o Markdown define `[referência]: https://example.org` e usa `[referência]`
- **THEN** o link explicitamente definido é respeitado como link comum.

### Requirement: SM-077 — Referências legíveis no PDF

No detalhamento proposto, o sistema SHALL manter as referências textuais de cartas legíveis no PDF e incorporar as imagens solicitadas pelo modificador explícito; a leitura dessas informações SHALL ser independente de hover.

Origem: `docs/requisitos-v1.md`, linhas 136. Classificação: detalhamento proposto.

#### Scenario: SM-077.1 — Exportar texto e imagem
- **WHEN** um guia contém `[Myr Enforcer]` em um parágrafo e `![Myr Enforcer]` em outro bloco
- **THEN** o PDF apresenta o nome no parágrafo e a imagem explícita no bloco correspondente.
