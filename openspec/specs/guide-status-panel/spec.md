## Purpose

Painel informativo para mostrar o estado e as validações do guia.

## Requirements

### Requirement: SM-059 — Resumo acima das colunas

O sistema SHALL mostrar um resumo compacto das informações e verificações acima das duas colunas do editor.

Origem: `docs/requisitos-v1.md`, linhas 103. Classificação: confirmado.

#### Scenario: SM-059.1 — Consultar o resumo
- **WHEN** a pessoa abre o editor com listas preenchidas e problemas conhecidos
- **THEN** o resumo aparece acima das colunas e permite perceber os totais e a existência de problemas.

### Requirement: SM-060 — Detalhes expansíveis

O sistema SHALL permitir expandir e recolher os detalhes do painel sem trocar a seção em edição nem descartar alterações.

Origem: `docs/requisitos-v1.md`, linhas 104. Classificação: confirmado.

#### Scenario: SM-060.1 — Expandir os resultados
- **WHEN** a pessoa expande o resumo
- **THEN** os detalhes das informações e verificações ficam disponíveis.

#### Scenario: SM-060.2 — Recolher os resultados
- **WHEN** a pessoa recolhe os detalhes
- **THEN** o resumo permanece visível e a edição é preservada.

### Requirement: SM-061 — Problemas associados a campos

O sistema SHALL identificar cada problema com sua mensagem e localização no guia, oferecendo acesso ao campo correspondente mesmo quando ele estiver em outra seção.

Origem: `docs/requisitos-v1.md`, linhas 105. Classificação: confirmado.

#### Scenario: SM-061.1 — Ir para uma linha irregular
- **WHEN** a pessoa seleciona no painel um problema em uma linha do sideboard
- **THEN** o editor abre a seção e localiza o campo ou a linha para correção.

### Requirement: SM-062 — Salvamento disponível com problemas

O sistema SHALL manter o salvamento automático disponível quando houver problemas de conteúdo ou validação no guia.

Origem: `docs/requisitos-v1.md`, linhas 106. Classificação: confirmado.

#### Scenario: SM-062.1 — Salvar um rascunho incompleto
- **WHEN** uma mão contém seis cartas e o main deck ainda está incompleto
- **THEN** a edição pode ser gravada e recuperada com os respectivos problemas de conteúdo.

### Requirement: SM-063 — Exportações disponíveis com problemas

O sistema SHALL manter HTML e PDF disponíveis quando existirem problemas de conteúdo, incluindo cartas não reconhecidas, sem bloquear a exportação pela validação editorial.

Origem: `docs/requisitos-v1.md`, linhas 107. Classificação: confirmado.

#### Scenario: SM-063.1 — Exportar com referência desconhecida
- **WHEN** a pessoa exporta um guia com referência não resolvida
- **THEN** a exportação pode ser concluída mantendo o nome legível no documento.

### Requirement: SM-064 — Validação informativa

O sistema SHALL usar as validações para informar e orientar correções, preservando os fluxos de edição, salvamento e exportação.

Origem: `docs/requisitos-v1.md`, linhas 108. Classificação: confirmado.

#### Scenario: SM-064.1 — Continuar o trabalho
- **WHEN** o painel informa inconsistências em um plano de sideboard
- **THEN** a pessoa consegue trocar de seção, continuar escrevendo, salvar e solicitar exportação.
