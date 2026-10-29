## Context

O esquema v1 contém sections planas e matchups separados, com mãos apenas em confrontos. O editor usa uma seleção de seção e renderiza todos os matchups ao mesmo tempo.

## Goals / Non-Goals

Goals: árvore editorial persistida, seleção por item, criação contextual e exportação completa. Non-goals: colaboração, tradução automática e drag and drop.

## Decisions

- Esquema v2 com nós recursivos em sections, cada um com id, type, title, fields e children. Tipos especializados preservam os campos de plano, variante e mão.
- Migrar matchups legados para nós de confronto, plano geral, variantes e mãos. Guardar cópia local do payload v1 antes da primeira escrita v2. Rejeitar versões futuras desconhecidas.
- Sumário dentro da coluna esquerda, com expansão independente da seleção. Editor mostra um nó e breadcrumb; prévia mantém tudo e âncoras por id.
- Grupos hands aceitam mãos; matchups aceitam confrontos; confronto mantém um plano e grupos de variantes/mãos; seções editoriais aceitam subseções e grupos de mãos.
- Mover oferece apenas destinos compatíveis fora da própria árvore. Reordenar atua entre irmãos. Duplicação gera novos ids. Exclusão oferece manter filhos quando isso respeita os tipos; desfazer restaura o guia anterior.
- Variantes mantêm herança explícita dos campos do plano geral. Mãos gerais são pré-side; mãos de confronto permitem pré/pós-side. Todas conservam sete cartas, decisão e justificativa.
- Prévia e exportações usam o mesmo documento de leitura; títulos seguem a profundidade, limitados a H6. Exportação Patreon conserva a hierarquia sem scripts nem estilos.

## Risks / Trade-offs

Migração e exportação são as áreas de maior risco: verificar legado, round-trip JSON, dados após recarga e presença de todos os nós no HTML. Botões de mover são o mecanismo inicial de reordenação.

## Migration Plan

Normalizar v1 em memória, manter backup local original, persistir v2 na mesma chave. Importador usa a mesma normalização e não sobrescreve colisões.
