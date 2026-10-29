## ADDED Requirements

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
