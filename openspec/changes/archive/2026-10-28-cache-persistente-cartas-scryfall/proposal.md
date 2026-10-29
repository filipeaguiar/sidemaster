## Why

O catálogo mantém os resultados do Scryfall apenas em memória; ao recarregar a página, o editor consulta novamente cartas já resolvidas e também repete falhas. Um cache persistente reduz chamadas redundantes, melhora a abertura de guias e preserva a regra de não repetir uma busca com o mesmo nome após uma falha.

## What Changes

- Persistir em IndexedDB os dados necessários para reconhecer cada carta e renderizar sua imagem, indexados pelo nome consultado normalizado.
- Consultar o cache antes da API e manter os resultados encontrados após refresh.
- Persistir estados de nome não encontrado e consulta indisponível, sem repetir a busca até o texto do nome mudar.
- Manter as imagens referenciadas pelas URLs do Scryfall com download sob demanda de Blobs no IndexedDB via ação de recarga para cartas do guia ainda não baixadas; não gravar imagens em base64 no `localStorage`.
- Preservar a fila de consultas e o intervalo mínimo entre chamadas à API.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `card-catalog`: persistência dos resultados do catálogo e supressão de consultas repetidas após refresh.

## Impact

- Código: `src/cards.js` e um módulo de armazenamento persistente do catálogo; a prévia continuará consumindo a mesma interface de resolução.
- Armazenamento: IndexedDB local por origem, independente dos dados dos guias.
- Serviços: Scryfall API e URLs de imagem Scryfall; não são necessárias novas dependências ou serviço remoto.
