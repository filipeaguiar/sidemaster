## ADDED Requirements

### Requirement: SM-052 — Legalidade atual no Pauper

O sistema SHALL verificar a legalidade das identidades do main deck e do sideboard no Pauper pelos dados de catálogo consultados. A raridade ou edição da imagem escolhida SHALL NOT substituir a legalidade da identidade da carta.

Origem: `docs/requisitos-v1.md`, linhas 93. Classificação: confirmado.

#### Scenario: SM-052.1 — Identificar uma carta banida
- **WHEN** os dados consultados indicam que uma carta da lista está banida no Pauper
- **THEN** o painel informa o problema e sua localização na lista.

#### Scenario: SM-052.2 — Imagem de edição incomum
- **WHEN** a imagem escolhida corresponde a uma edição incomum, mas a carta tem legalidade Pauper reconhecida
- **THEN** a edição da imagem não torna a carta irregular.

#### Scenario: SM-052.3 — Consulta incompleta
- **WHEN** a legalidade de alguma referência ainda não pôde ser obtida
- **THEN** o resultado distingue a pendência e não declara a lista integralmente validada.

### Requirement: SM-053 — Contagens do formato

O sistema SHALL contar main deck e sideboard separadamente e verificar o mínimo de 60 cartas no main deck, o máximo de 15 no sideboard e o limite usual de quatro cópias combinadas por identidade segundo as regras do Pauper, respeitando terrenos básicos e exceções de regras da carta.

Origem: `docs/requisitos-v1.md`, linhas 94. Classificação: confirmado.

#### Scenario: SM-053.1 — Deck com mais de sessenta cartas
- **WHEN** o main deck tem 61 cartas e o sideboard tem 14, com cópias permitidas
- **THEN** a verificação de tamanho não aponta erro por diferir de 60 e 15.

#### Scenario: SM-053.2 — Limites de zona excedidos
- **WHEN** o main deck tem 59 cartas ou o sideboard tem 16
- **THEN** o painel indica a zona e a contagem irregular.

#### Scenario: SM-053.3 — Limite de cópias combinado
- **WHEN** uma carta sem exceção tem quatro cópias no main deck e uma no sideboard
- **THEN** o painel informa cinco cópias combinadas para essa identidade.

#### Scenario: SM-053.4 — Terrenos básicos
- **WHEN** a lista possui mais de quatro cópias de um terreno básico
- **THEN** a regra de limite comum de cópias não é aplicada ao terreno básico.

### Requirement: SM-054 — Estado das referências de cartas

O sistema SHALL informar referências reconhecidas, não reconhecidas ou ainda pendentes nos campos do guia, indicando a origem do problema sem remover o texto informado.

Origem: `docs/requisitos-v1.md`, linhas 95. Classificação: confirmado.

#### Scenario: SM-054.1 — Apontar uma referência desconhecida
- **WHEN** uma justificativa contém uma referência que o catálogo confirmou como inexistente
- **THEN** o problema aponta para o campo e preserva o texto.

#### Scenario: SM-054.2 — Erro de rede
- **WHEN** a resolução falha por indisponibilidade de rede
- **THEN** o estado é pendente ou indisponível, distinto de nome inexistente.

### Requirement: SM-055 — Coerência do plano com a lista base

O sistema SHALL verificar cada plano de sideboard em relação ao main deck e sideboard do próprio guia, calculando a lista resultante a partir das entradas e saídas efetivas do plano.

Origem: `docs/requisitos-v1.md`, linhas 96. Classificação: confirmado.

#### Scenario: SM-055.1 — Aplicar trocas válidas
- **WHEN** um plano troca duas cartas disponíveis do sideboard por duas disponíveis no main deck
- **THEN** as zonas resultantes refletem as trocas e a validação permanece associada a esse plano.

#### Scenario: SM-055.2 — Reavaliar após editar a lista base
- **WHEN** a pessoa remove do sideboard uma carta usada em um plano
- **THEN** o plano passa a exibir a inconsistência correspondente.

### Requirement: SM-056 — Disponibilidade de cartas nas trocas

O sistema SHALL comparar as quantidades que entram com o sideboard base e as quantidades que saem com o main deck base, usando identidade comum entre idiomas e apontando insuficiências por carta.

Origem: `docs/requisitos-v1.md`, linhas 97. Classificação: confirmado.

#### Scenario: SM-056.1 — Retirar mais cópias do que existem
- **WHEN** um plano retira três cópias de uma carta com apenas duas no main deck
- **THEN** o painel indica que a retirada excede a disponibilidade em uma cópia.

#### Scenario: SM-056.2 — Entrar com carta ausente
- **WHEN** um plano inclui uma carta que não consta no sideboard base
- **THEN** o painel informa a ausência dessa carta no sideboard.

### Requirement: SM-057 — Diferença entre entradas e saídas

O sistema SHALL comparar a soma das entradas e das saídas de cada plano e informar a diferença quando os valores divergirem, preservando o caráter informativo da verificação.

Origem: `docs/requisitos-v1.md`, linhas 98. Classificação: confirmado.

#### Scenario: SM-057.1 — Troca com totais diferentes
- **WHEN** um plano contém cinco entradas e quatro saídas
- **THEN** o painel mostra os dois totais e a diferença de uma carta, sem bloquear edição ou exportação.

### Requirement: SM-058 — Contagem das mãos

O sistema SHALL verificar a soma das cartas de cada exemplo de mão e apontar valores diferentes de sete no respectivo exemplo.

Origem: `docs/requisitos-v1.md`, linhas 99. Classificação: confirmado.

#### Scenario: SM-058.1 — Exemplo com oito cartas
- **WHEN** uma mão soma oito cópias
- **THEN** o problema informa o total oito e a expectativa sete e identifica o exemplo.

#### Scenario: SM-058.2 — Corrigir uma mão
- **WHEN** uma mão irregular é editada e passa a somar sete
- **THEN** o problema de contagem desse exemplo é removido.
