# Opção Sempre nas mãos iniciais

Verificado em 2026-10-29.

- Posição oferece Play, Draw e Sempre. Nas mãos de matchup, Momento oferece Pré-side, Pós-side e Sempre. Cada Sempre indica ambos os contextos do respectivo eixo; os valores padrão existentes foram mantidos.
- A leitura em português mostra Sempre; inglês e fallback do catálogo mostram Always. Os valores internos continuam Sempre e não passam pela geração da tradução.
- Cenário isolado no navegador com ponte desktop simulada: selecionar os dois valores, observar a prévia, aguardar salvamento e recarregar manteve Sempre em ambos. Captura: `opening-hands-always.png`. Guias reais não foram modificados.
- Verificação em Node: round-trip JSON com normalizeGuide, renderização em português e montagem de cópia traduzida em inglês preservaram os valores e os rótulos esperados.
- `npm test`: 57 testes aprovados. `openspec validate opening-hands --type spec --strict --json --no-interactive`: aprovado sem issues.
- `npm run dist:appimage-portable`: concluído. Editor e renderer de leitura extraídos dos arquivos app.asar contidos no AppImage e no Portable correspondem byte a byte aos fontes atuais.
