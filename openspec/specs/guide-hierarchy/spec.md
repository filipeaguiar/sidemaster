## Purpose

Definir como autores organizam, editam e publicam a hierarquia de seções de um guia Pauper.

## Requirements

### Requirement: Árvore editorial editável
O sistema SHALL permitir subseções recursivas, com expansão independente da seleção e um editor por item, mantendo a prévia integral sincronizada.

#### Scenario: Selecionar subseção
- **WHEN** o autor seleciona Sobre o deck / Mãos iniciais / Exemplo 1
- **THEN** somente esse exemplo é editado e a prévia mostra seu trecho no guia completo.

### Requirement: Criação contextual e tipos especializados
O sistema SHALL oferecer criação contextual de Markdown, grupos de mãos e exemplos, matchups, planos e variantes, respeitando os destinos compatíveis.

#### Scenario: Mão geral e mão de matchup
- **WHEN** o autor cadastra uma mão em Sobre o deck e outra em UB Faeries
- **THEN** ambas têm cartas, cenário, decisão e justificativa independentes, com contagem de sete cartas e sem exigir adversário na mão geral.

### Requirement: Gerenciamento dos itens
O sistema SHALL permitir renomear, duplicar com novos ids, reordenar entre irmãos, mover para destino compatível e excluir com desfazer; SHALL oferecer preservar filhos quando compatível.

#### Scenario: Mover sem ciclos
- **WHEN** o autor abre os destinos de um item
- **THEN** o próprio item, seus descendentes e destinos incompatíveis não estão disponíveis.

### Requirement: Persistência e exportação hierárquicas
O sistema SHALL preservar dados legados na migração e manter árvore e campos especializados no salvamento local, JSON, HTML, impressão e HTML Patreon.

#### Scenario: Reabrir e exportar
- **WHEN** um guia v1 é aberto, reorganizado, salvo e exportado
- **THEN** seus textos, listas, planos e mãos permanecem acessíveis e as saídas seguem a ordem e os níveis da árvore.
