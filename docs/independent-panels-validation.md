# Rolagem independente e sincronização

Verificado em 28/10/2026, no navegador integrado.

- Workspace ocupa a altura disponível. Editor e prévia possuem scroll containers separados, com teclado e contenção de rolagem.
- Seleção do sumário rola apenas a prévia, usando coordenadas relativas ao painel. O atalho de informações do header rola apenas o editor.
- Prévia destaca o item selecionado e oferece `Localizar edição` em uma barra fixa dentro do painel.
- Atualizações de texto preservam a âncora de leitura e o deslocamento. Hidratação de cartas preserva essa posição se o usuário não tiver rolado manualmente durante a consulta.
- Política Scryfall mantida: pausa de 750 ms e resultados/falhas em cache por nome.
- Desktop 1440 × 960: documento permaneceu com scroll 0; painéis com altura 774 px e conteúdos maiores que o próprio painel.
- Rodar a prévia mudou seu scroll de 1571 para 1091, mantendo o editor em 633 e a página em 0.
- `Localizar edição` retornou a prévia à mão selecionada em scroll 611, mantendo o editor em 633.
- Editar e restaurar a justificativa da demonstração manteve os mesmos offsets antes e depois da hidratação; 14 imagens carregadas nos dois exemplos. Texto original restaurado.
- Selecionar Sideboard destacou o item correto sem rolar a página.
- Viewport original restaurado: painéis empilhados com 340 px cada, overflow próprio e sem transbordamento horizontal.
- Sintaxe de `src/editor.js` verificada; nenhum erro no console na inspeção final.
- Captura de desktop: `docs/paineis-independentes.png`.

Exportações usam o documento de leitura existente; regras de impressão removem as limitações de altura e overflow.
