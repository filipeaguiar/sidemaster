# Validação das especificações

## Resultado

- Fonte preservada: `docs/requisitos-v1.md`.
- SHA-256 da fonte: `4615eac93c09378f2b54806f2d23469be4c4fdb27c0ac20772ee5fb57a4033e5`.
- Itens rastreados da fonte: 127/127.
- Capacidades com arquivo de spec: 14.
- Requisitos individuais com cláusula normativa: 90.
- Cenários de aceitação WHEN/THEN: 118.
- Requisitos sem cenário ou sem referência nas tarefas: zero.
- Tarefas de implementação planejadas, ainda abertas: 57.
- Validação estrita do OpenSpec: aprovada, sem issues.

## Classificação da origem

- Requisitos provenientes das decisões confirmadas: 72.
- Detalhamentos propostos de sintaxe: 5.
- Detalhamentos propostos do modelo: 13.
- As três recomendações técnicas permanecem identificadas como D1, D2 e D3 no design, sem serem atribuídas a decisões confirmadas do usuário.
- Os critérios de aceite repetidos estão ligados aos contratos correspondentes na matriz.

## Conferências realizadas

1. Leitura do documento de origem e dos contratos gerados, conferindo os comportamentos centrais: guias independentes por arquétipo, prévia integral, nomes bilíngues, pilhas, mãos de sete cartas, herança das variantes e validações informativas.
2. Comparação de todos os bullets, itens numerados, linhas de sintaxe e enunciados complementares da fonte com a matriz de rastreabilidade.
3. Inspeção dos arquivos reais de spec: títulos, IDs únicos, cláusulas SHALL, cenários e correspondência com a fonte.
4. Comparação das capacidades declaradas na proposta com as 14 pastas de specs.
5. Conferência de referências a todos os requisitos nas tarefas futuras e da existência dos artefatos de planejamento.
6. Execução de `openspec validate especificar-sidemaster-v1 --strict --json --no-interactive` sobre a mudança.

## Evidências

- [Matriz por item de origem](rastreabilidade.md).
- [Resultado estruturado de cobertura](coverage-audit.json).
- [Saída da validação OpenSpec](openspec-validation.json).
- [Rastreabilidade com textos de requisitos e cenários](traceability.json).

Esta verificação prova a cobertura e a consistência dos artefatos de especificação. Os cenários descrevem aceitação da implementação futura; o aplicativo e suas integrações ainda não foram implementados por esta entrega.
