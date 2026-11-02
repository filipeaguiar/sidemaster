## Why

O guia combina referências de cartas e links Markdown, mas a coleta de cartas ainda interpreta rótulos de links como nomes de cartas e o desktop abre somente HTTPS. Além disso, alterações no original geram apenas um aviso global de tradução desatualizada, e o seletor Momento oferece menos opções nas mãos gerais que nas mãos de matchup.

## What Changes

- Distinguir referências `[Carta]` e `![Carta]` de links `[texto](http://...)` e `[texto](https://...)`, usando o início do destino para reconhecer o protocolo; preservar os links na leitura, tradução e exportações, sem consultas indevidas ao catálogo.
- Abrir links HTTP e HTTPS no navegador externo a partir do desktop.
- Marcar automaticamente como **Não traduzido — original alterado** cada trecho cuja origem mudou, refletindo a pendência na árvore, filtros, progresso e prévia; preservar resultados anteriores no histórico e os trechos ainda válidos.
- Sincronizar a tradução com o conteúdo atual ao voltar à aba, sem exigir criar outra execução nem iniciar geração automaticamente; impedir que resultados antigos concluam a tradução do guia atual.
- Disponibilizar as mesmas opções em qualquer mão inicial: Posição = Play/Draw/Sempre; Momento = Pré-side/Pós-side/Sempre; Decisão = Manter/Mulligar/Situacional.
- Auditar e corrigir apresentação, seleção e persistência dos drop-downs em todos os destinos permitidos da árvore, inclusive subseções recursivas, duplicação e movimentação.

## Capabilities

### New Capabilities

- `translation-freshness`: atualização incremental dos trechos de tradução após mudanças no guia, com pendência explícita e histórico preservado.

### Modified Capabilities

- `card-markdown`: precedência de links HTTP/HTTPS sobre referências de cartas, incluindo coleta de referências e abertura no desktop.
- `opening-hands`: paridade dos seletores de contexto em mãos gerais e de matchup e verificação em todos os locais de criação/edição.

## Impact

- Áreas previstas: `src/markdown.js`, `src/cards.js`, `src/reading.js`, `electron/main.cjs`, `src/editor.js`, `src/styles.css`, `src/translation-engine.js`, `src/translation-segments.js`, `src/translation-ui.js` e `src/translation-preview.js`; modelo/persistência apenas se necessários para compatibilidade dos checkpoints.
- Estender testes de interpretação Markdown, catálogo, tradução e mãos; verificar os fluxos visíveis no navegador e no Electron e as saídas HTML, HTML Patreon, PDF e JSON.
- A integração de tradução já existe no checkout e está descrita na change ativa `traduzir-guias-ollama`. Esta change complementa esse trabalho com atualização por trecho; sua implementação deve reconciliar o contrato anterior de snapshot, sem alterar a situação das tarefas pendentes daquela change ou de `electron-desktop-app`.
- Sem novas dependências obrigatórias e sem mudanças de formato que descartem guias ou traduções existentes. O escopo desta entrega é a proposta e seus artefatos; implementação e verificação funcional permanecem nas tarefas.
