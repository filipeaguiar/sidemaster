# Proporção das imagens no PDF — 1.0.6

## Causa confirmada

Na versão 1.0.5, a incorporação adicionava `width="488" height="680"` e `aspect-ratio:488/680` à imagem transparente usada para deduplicar os dados. A largura era reduzida pelo CSS responsivo, mas a altura do atributo continuava em 680 px. Com ambas as dimensões definidas, `aspect-ratio` não recalculava a altura. O fundo com `background-size:100% 100%` esticava a imagem para preencher esse retângulo.

## Correção

As imagens incorporadas recebem `height:auto` para que a altura acompanhe a largura e a proporção original. O fundo usa `contain`, preservando sua proporção. A capa decorativa do deck mantém o tamanho do banner e usa `cover`, recortando a imagem sem deformá-la. A deduplicação dos dados permanece ativa.

## Evidência

Reprodução em Electron 45.1.0 com o código real de `exportedHtml(..., { embedCachedImages:true })`, catálogo e imagem PNG de diagnóstico em cache isolado. Não foi usado o perfil do usuário. A imagem de 488 × 680 contém um círculo para evidenciar deformações.

| Contexto | Antes (px) | Depois (px) | Proporção depois |
| --- | --- | --- | --- |
| Mão com sete cartas | 121,83 × 680 | 121,83 × 169,75 | 0,71769 |
| Imagem em Markdown | Altura original fixa no mesmo caminho de exportação | 104,42 × 145,50 | 0,71768 |
| Pilha do deck | 128,19 × 178,61 | 128,19 × 178,61 | 0,71770 |

Proporção original: 488/680 = 0,717647, com diferença de arredondamento subpixel. A capa foi medida em 400,94 × 150 px com `background-size:cover`.

O PDF A4 de duas páginas foi gerado pelo `webContents.printToPDF` e renderizado com Poppler. As páginas da mão e do deck foram inspecionadas visualmente: círculos preservados e cartas sem estiramento. O título Main deck permaneceu junto do banner. Verificações de sintaxe e de integridade do diff passaram. Nenhuma suíte de testes local foi executada, conforme preferência do usuário.

Limite: a reprodução usa um guia de diagnóstico, pois o guia original do usuário não está disponível nesta sessão.
