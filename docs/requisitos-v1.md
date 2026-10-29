# SideMaster — Requisitos da primeira versão

Status: especificação consolidada a partir da entrevista com o usuário.

## Objetivo

Criar e editar guias de decks Pauper em campos Markdown separados, com prévia visual, imagens de cartas obtidas pelo Scryfall e exportação para HTML e PDF.

Referências fornecidas pelo usuário:

- `sources/V.4 PT BR Side Guide Grixis Affinity .pptx`.
- Visualização de deck: https://www.mtggoldfish.com/deck/visual/7987742.

## Decisões confirmadas

### Uso e persistência

- A primeira versão será de uso pessoal.
- Os guias serão salvos automaticamente no navegador durante a edição.
- Mostrar o estado do salvamento e a última atualização do guia.
- O usuário compartilhará os guias por exportação para HTML ou PDF.

### Organização por arquétipo e versões

- Agrupar os guias em uma biblioteca por arquétipo, como Grixis Affinity.
- Cada versão corresponde a um guia completo e independente daquele arquétipo.
- As versões representam configurações e orientações para diferentes momentos, como o lançamento de uma coleção, um banimento ou uma mudança do metagame.
- Cada guia tem suas próprias listas, seções, matchups, variantes e exemplos de mãos iniciais.
- Preservar os guias das versões anteriores ao criar um novo guia para o mesmo arquétipo.

### Editor

- Duas colunas: edição à esquerda e resultado visual à direita.
- Navegação por um sumário hierárquico recolhível dentro da coluna de edição.
- Editar uma seção ou matchup selecionado por vez.
- A coluna de prévia mostra sempre o guia completo.
- Ao selecionar uma seção no sumário, rolar a prévia até a seção correspondente.
- Campos separados em Markdown para as partes do guia.
- Modelo inicial inspirado no PPTX de referência.
- Possibilidade de adicionar, renomear, excluir e reordenar seções.
- Painel com informações e verificações do guia e do deck.

### Cartas e Scryfall

- Integração com o Scryfall para reconhecer cartas, obter imagens e consultar dados necessários à validação.
- Aceitar nomes em inglês e português nas referências.
- Reconhecer os dois nomes como referências à mesma carta.
- Preservar a identidade das cartas quando houver tradução do conteúdo.

### Deck e sideboard

- Suporte inicial ao formato Pauper.
- Main deck e sideboard inseridos como listas em campos Markdown.
- Cada linha informa quantidade e nome da carta, como `4 [Myr Enforcer]`.
- Gerar uma versão visual do deck a partir das listas, seguindo a referência do MTGGoldfish.
- Mostrar as quantidades das cartas na visualização.

### Visualização do deck

- Mostrar main deck e sideboard separadamente.
- Agrupar as cartas por tipo, como criaturas, mágicas e terrenos.
- Apresentar cada grupo como uma pilha de cartas parcialmente sobrepostas.
- Manter nomes e quantidades visíveis nas pilhas.
- Mostrar uma imagem por carta distinta, com um indicador da quantidade de cópias.
- Exibir a imagem completa ao passar o mouse ou tocar na carta.
- Escolher automaticamente a imagem de cada carta na primeira versão.

### Matchups

- Identificar o adversário pelo nome do arquétipo, sem exigir cadastro ou reprodução da lista adversária.
- Cada matchup terá um plano geral.
- Permitir variantes opcionais com nomes livres, como Tradicional, Sneaky Snacker, Play ou Draw.
- As variantes usarão os campos do plano geral, com alterações específicas apenas nos campos que forem substituídos na variante.
- Mudanças no plano geral serão refletidas nos campos que a variante continuar usando desse plano.
- Associar as entradas e saídas do sideboard aos respectivos planos para permitir verificações de consistência.
- Registrar a avaliação do confronto em uma escala qualitativa, com justificativa em Markdown.
- A escala terá sete opções: Muito favorável, Favorável, Levemente favorável, Equilibrado, Levemente desfavorável, Desfavorável e Muito desfavorável.

### Mãos iniciais

- Permitir exemplos de mãos iniciais dentro de cada matchup.
- Cada exemplo representa um único cenário.
- Registrar a posição como Play, Draw ou Sempre. Nas mãos de matchup, registrar o momento como Pré-side, Pós-side ou Sempre; Sempre indica que a avaliação vale para ambos os contextos do respectivo campo.
- Cada mão contém sempre sete cartas, contando as cópias repetidas individualmente.
- Informações sobre mulligans ficam exclusivamente na justificativa, sem um campo próprio para a quantidade de mulligans.
- A decisão do autor será uma das opções: Manter, Mulligar ou Situacional.
- A justificativa será escrita em um campo Markdown separado.
- A lista de cartas será escrita em Markdown, com o mesmo padrão de quantidade e referência usado nas listas do deck.
- A prévia mostrará as sete cartas individualmente, incluindo as cópias repetidas.

### Verificações

- Legalidade das cartas no Pauper.
- Quantidades do main deck e do sideboard.
- Referências a cartas reconhecidas ou não reconhecidas.
- Coerência das trocas de sideboard em relação à lista base.
- Disponibilidade das quantidades indicadas nas entradas e saídas.
- Diferenças entre os totais de cartas que entram e saem.
- Contagem de sete cartas em cada exemplo de mão inicial.

### Painel de informações e validações

- Exibir um resumo compacto acima das duas colunas do editor.
- Permitir expandir o resumo para consultar informações e detalhes das validações.
- Mostrar os problemas encontrados e indicar o campo correspondente para correção.
- Manter o salvamento disponível mesmo quando houver problemas.
- Manter as exportações HTML e PDF disponíveis mesmo quando houver problemas.
- As validações terão caráter informativo e não bloquearão o fluxo de trabalho.

### Exportação

- Guia web de leitura contínua.
- HTML com texto e estilos no arquivo; imagens das cartas carregadas da internet.
- PDF como relatório A4, com conteúdo contínuo e quebras automáticas.
- Exportar e importar uma cópia editável em arquivo JSON, preservando a estrutura completa e os campos Markdown dos guias.
- A cópia editável permite continuar o trabalho em outro navegador ou computador, mantendo a organização por arquétipo e a identificação da versão do guia.

### Tradução futura

- Tradução por LLM em uma etapa posterior.
- Manter os campos separados para permitir tradução por parte do guia.
- Preservar referências às cartas, quantidades e comandos de formatação durante a tradução.

## Sintaxe proposta para referências

O usuário solicitou uma distinção por modificador entre o nome com hover e a imagem direta. A sintaxe apresentada foi:

| Sintaxe | Uso |
| --- | --- |
| `[Myr Enforcer]` | Nome destacado; imagem ao passar o mouse ou tocar. |
| `![Myr Enforcer]` | Imagem da carta diretamente no documento. |
| `4 [Myr Enforcer]` | Em um campo de lista, carta e quantidade para a visualização do deck. |

Links e imagens comuns do Markdown mantêm sua sintaxe habitual, como `[texto](url)` e `![descrição](url)`.

Na exportação para PDF, as referências de texto permanecem legíveis e as imagens explícitas são incorporadas à diagramação.

## Modelo inicial proposto

Esta organização adapta o conteúdo do PPTX às decisões confirmadas. As seções permanecem personalizáveis.

1. Informações do guia: título, autoria, versão e data de referência.
2. Apresentação do autor.
3. Sobre o deck: plano de jogo, mulligan e adaptação ao metagame.
4. Main deck e sua visualização.
5. Sideboard e sua visualização.
6. Escolhas de cartas e base de mana.
7. Maybeboard.
8. Matchups, com plano geral e variantes opcionais.
9. Encerramento e redes sociais.

Para cada matchup, o modelo pode oferecer campos para:

- Nome do arquétipo adversário.
- Cartas que entram e saem.
- Justificativa das trocas.
- Plano de jogo.
- Interações e cuidados técnicos.
- Avaliação qualitativa do confronto, justificativa em Markdown e ajustes sugeridos.
- Exemplos de mãos iniciais e comentários sobre keep ou mulligan.

Cada exemplo de mão segue as decisões da seção Mãos iniciais: sete cartas, um cenário, decisão e justificativa em Markdown.

## Recomendações técnicas para a implementação

As recomendações abaixo complementam os requisitos; não foram escolhas apresentadas ao usuário como alternativas.

- Guardar uma identificação estável da carta junto à referência reconhecida, além do texto digitado, para sustentar nomes em dois idiomas e traduções futuras.
- Usar as mesmas listas como origem da grade visual e das verificações para evitar divergências entre representações.
- Informar a data da última consulta de legalidade e distinguir uma consulta pendente de um deck efetivamente validado.

## Critérios de aceite do escopo definido

- Organizar múltiplos guias por arquétipo, tratando cada versão como um guia independente e preservando os anteriores.
- Criar um guia a partir do modelo e editar seções separadamente.
- Adicionar, renomear, excluir e reordenar seções.
- Visualizar a edição em duas colunas.
- Selecionar uma seção por vez no sumário hierárquico recolhível, exibindo seus campos na coluna de edição.
- Manter o guia completo na prévia e rolar até a seção escolhida no sumário.
- Reconhecer referências às cartas em inglês e português.
- Distinguir referências com hover de imagens explícitas.
- Transformar listas Markdown de main deck e sideboard em blocos visuais com quantidades.
- Exibir main deck e sideboard separados, agrupados por tipo em pilhas parcialmente sobrepostas, com nomes e quantidades visíveis.
- Abrir a imagem completa das cartas no hover ou toque, usando imagens escolhidas automaticamente.
- Criar planos gerais e variantes nomeadas em matchups.
- Identificar os adversários pelo nome do arquétipo.
- Reutilizar nas variantes os campos do plano geral e permitir substituir apenas os campos específicos de cada variante.
- Registrar a avaliação dos confrontos na escala qualitativa de sete opções, com justificativa em Markdown.
- Criar exemplos de mãos de sete cartas, com cenário play/draw e pré/pós-side, decisão Manter/Mulligar/Situacional e justificativa em Markdown.
- Exibir as sete cartas da mão individualmente e apontar quando a lista tiver uma quantidade diferente.
- Exibir os problemas de legalidade, quantidades, referências e trocas no painel.
- Exibir o painel como resumo compacto acima das duas colunas, com detalhes expansíveis e indicação dos campos com problemas.
- Permitir salvar e exportar guias mesmo quando o painel indicar problemas.
- Recuperar no navegador um guia salvo anteriormente.
- Salvar automaticamente as alterações, exibindo o estado do salvamento e a última atualização.
- Exportar e importar uma cópia editável em JSON, preservando os campos Markdown e a estrutura do guia.
- Exportar HTML com imagens remotas e PDF A4 com paginação automática.
- Manter a estrutura de conteúdo preparada para a futura tradução por LLM.
