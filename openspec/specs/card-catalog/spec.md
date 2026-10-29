## Purpose

Catálogo integrado ao Scryfall para reconhecer cartas e seus dados.

## Requirements

### Requirement: SM-019 — Dados e imagens do Scryfall

O sistema SHALL consultar a API do Scryfall para resolver cartas e obter os dados necessários à visualização e à verificação de legalidade. A ausência de resposta SHALL ser distinguida de uma resposta de carta inexistente.

Origem: `docs/requisitos-v1.md`, linhas 45. Classificação: confirmado.

#### Scenario: SM-019.1 — Resolver uma carta
- **WHEN** o Scryfall retorna uma carta para a referência informada
- **THEN** o aplicativo associa a carta aos dados de identidade, imagem, tipo e legalidade necessários ao guia.

#### Scenario: SM-019.2 — Serviço indisponível
- **WHEN** a consulta ao catálogo não pode ser concluída
- **THEN** a referência permanece no texto e aparece como pendente ou indisponível, sem ser afirmada como reconhecida ou inexistente.

### Requirement: SM-020 — Entrada de nomes em inglês e português

O sistema SHALL aceitar nomes de cartas em inglês e português tanto nas referências textuais quanto nas listas, resolvendo-os pelos dados do catálogo.

Origem: `docs/requisitos-v1.md`, linhas 46. Classificação: confirmado.

#### Scenario: SM-020.1 — Resolver os dois idiomas
- **WHEN** duas referências usam nomes inglês e português catalogados da mesma carta
- **THEN** ambas são reconhecidas e recebem imagem e dados da carta.

#### Scenario: SM-020.2 — Nome não reconhecido
- **WHEN** o catálogo confirma que o nome informado não corresponde a uma carta
- **THEN** o nome original é preservado e o campo recebe um problema de referência.

### Requirement: SM-021 — Identidade comum entre idiomas

O sistema SHALL tratar nomes em inglês e português que correspondem à mesma carta como uma identidade única para contagens, validação e associação de referências.

Origem: `docs/requisitos-v1.md`, linhas 47. Classificação: confirmado.

#### Scenario: SM-021.1 — Contar nomes equivalentes
- **WHEN** uma lista contém duas cópias pelo nome inglês e duas pelo nome português da mesma carta
- **THEN** a representação normalizada considera quatro cópias de uma identidade, mantendo os textos digitados.

### Requirement: SM-022 — Identidade preservada na tradução

O sistema SHALL manter a identidade de uma carta associada à referência mesmo quando a apresentação textual do campo mudar de idioma, conforme translation-readiness.

Origem: `docs/requisitos-v1.md`, linhas 48. Classificação: confirmado.

#### Scenario: SM-022.1 — Conservar a associação
- **WHEN** o texto de apresentação de uma referência bilíngue é alterado em uma transformação de idioma
- **THEN** a referência continua associada à mesma identidade de carta, quantidade e imagem resolvida.

### Requirement: SM-023 — Cache persistente de cartas reconhecidas

O sistema SHALL persistir em IndexedDB, por origem, os dados de catálogo necessários à identidade, imagem e legalidade de uma carta reconhecida, indexados pelo nome consultado normalizado. Uma entrada positiva com até 24 horas SHALL ser reutilizada após reload sem uma nova consulta à API. Uma entrada mais antiga MAY continuar fornecendo nome e imagem, mas SHALL indicar legalidade pendente até ser atualizada com sucesso.

#### Scenario: Reutilizar carta reconhecida após reload
- **WHEN** uma carta foi reconhecida há menos de 24 horas e a página é recarregada
- **THEN** o editor obtém identidade e URL da imagem do IndexedDB sem consultar o endpoint de dados do Scryfall.

#### Scenario: Usar dados antigos enquanto atualiza
- **WHEN** a entrada reconhecida tem mais de 24 horas e a rede está disponível
- **THEN** o editor mantém nome e imagem da entrada local, inicia uma atualização limitada pela fila de consultas e só apresenta a legalidade como atual após a resposta bem-sucedida.

#### Scenario: Atualização expirada sem rede
- **WHEN** a entrada reconhecida tem mais de 24 horas e a atualização não pode ser concluída
- **THEN** nome e imagem continuam disponíveis, o estado permanece pendente/desatualizado e a falha não é apresentada como carta inexistente.

#### Scenario: Cache local indisponível
- **WHEN** IndexedDB não está disponível ou não permite gravar
- **THEN** o editor continua funcional com o cache em memória e o fluxo de consulta existente.

### Requirement: SM-024 — Memorizar falha pelo nome consultado

O sistema SHALL persistir os estados `notfound` e `error` pelo nome normalizado consultado. Reloads, re-renderizações e a ação de recarga de imagens SHALL reutilizar esse estado sem repetir a requisição para o mesmo nome. Um nome alterado SHALL iniciar uma nova resolução; erro de consulta SHALL permanecer distinto de nome não encontrado.

#### Scenario: Não repetir uma falha após reload
- **WHEN** a consulta de um nome falha e a página é recarregada sem que o texto do nome seja alterado
- **THEN** o estado de falha persistido é reutilizado e nenhuma nova requisição é feita para essa chave.

#### Scenario: Alterar o nome depois de uma falha
- **WHEN** a pessoa edita o nome anteriormente não encontrado ou indisponível
- **THEN** o sistema consulta o novo nome e atualiza seu registro independente no cache.

#### Scenario: Distinguir carta inexistente de indisponibilidade
- **WHEN** o cache contém uma resposta válida sem correspondência ou uma falha de rede/HTTP
- **THEN** o primeiro estado é apresentado como `notfound` e o segundo como `error`, sem confundir um com o outro.

### Requirement: SM-025 — Imagens locais em IndexedDB sem base64 em localStorage

O sistema SHALL manter as referências de imagem do catálogo associadas às URLs do Scryfall e SHALL NOT armazenar strings base64 em `localStorage`. Ao acionar a recarga de imagens, o sistema SHALL identificar as cartas do guia ativo cujas imagens (principal `normal` e arte `art_crop`) ainda não foram salvas no IndexedDB e disparar o download dessas imagens, persistindo os Blobs no IndexedDB e servindo-os localmente via Object URL. Entradas de catálogo válidas e falhas já persistidas SHALL NOT disparar novas consultas de metadados à API do Scryfall.

#### Scenario: Recarregar a prévia e baixar imagens pendentes
- **WHEN** a pessoa aciona a recarga de imagens para cartas do guia ativo
- **THEN** o sistema dispara o fetch das imagens ainda não salvas no IndexedDB, armazena os Blobs localmente e renderiza via Object URL sem repetir consultas de metadados para cartas já resolvidas ou com falha.

#### Scenario: Usar imagem local persistida em IndexedDB
- **WHEN** uma carta possui imagem salva no IndexedDB
- **THEN** a prévia utiliza o Object URL do Blob local sem depender de nova requisição remota de imagem.

#### Scenario: Manter falha sem retry pela recarga visual
- **WHEN** a carta tem uma falha persistida e a pessoa aciona a recarga de imagens
- **THEN** a prévia continua mostrando a falha sem nova consulta à API.

### Requirement: SM-026 — Ritmo de consultas ao catálogo

O sistema SHALL espaçar chamadas distintas à API de dados do Scryfall em pelo menos 110 ms e SHALL NOT repetir automaticamente chamadas que retornem `429`, erro de rede ou erro `5xx`. Uma falha SHALL ser memorizada para o nome normalizado atual conforme SM-024.

#### Scenario: Consultas distintas em fila
- **WHEN** múltiplos nomes sem cache aguardam resolução
- **THEN** as chamadas são serializadas com pelo menos 110 ms entre o início de cada chamada.

#### Scenario: Limite ou indisponibilidade do serviço
- **WHEN** uma chamada retorna `429`, `5xx` ou falha por rede
- **THEN** o sistema armazena `error`, não faz retry automático e mantém o texto original editável.
