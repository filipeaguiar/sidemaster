## Context

O projeto contém o documento `docs/requisitos-v1.md`, o PPTX de referência e a configuração OpenSpec. A implementação da aplicação ainda será criada. A mudança formaliza o comportamento em 14 capacidades, com requisitos individuais e cenários, e mantém a fonte editorial preservada.

A rastreabilidade está em `rastreabilidade.md` e `traceability.json`. Decisões confirmadas, detalhamento proposto da sintaxe/modelo e recomendações técnicas mantêm suas classificações. Os critérios de aceite repetidos apontam para os mesmos contratos.

## Goals / Non-Goals

**Goals:**

- Sustentar edição e leitura de guias pessoais com Markdown, cartas visuais, dados locais e exportações.
- Preservar cada versão de metagame como um guia completo, identificado e independente no arquétipo.
- Manter a representação do documento utilizável no editor, nas verificações e nas exportações.
- Oferecer preparação de dados para tradução futura, mantendo a v1 utilizável sem LLM.
- Tornar verificável cada item do documento de origem, inclusive o detalhamento editorial proposto.

**Non-Goals:**

- Implementar a aplicação nesta entrega de especificações.
- Executar tradução por LLM na primeira versão.
- Cadastrar ou renderizar listas adversárias, conforme a decisão expressa do usuário.
- Transformar o versionamento editorial em histórico automático de revisões de um mesmo documento.
- Acrescentar contas, colaboração ou armazenamento remoto à primeira versão pessoal.

## Decisions

### 1. Documento estruturado com Markdown por campo

Proposta técnica: separar o documento persistido da interface e dos renderizadores, com entidades endereçáveis por identificadores estáveis:

- `Archetype`: identificação e nome do agrupamento dos guias do autor.
- `Guide`: identificação, arquétipo, rótulo de versão, data de referência, informações de autoria, seções e última atualização confirmada.
- `Section`: identificação, tipo, título, ordem e campos Markdown.
- `Matchup`: identificação, nome livre do arquétipo adversário, plano geral, variantes e exemplos de mãos.
- `Plan`: entradas/saídas Markdown, estratégia, justificativas, interações, avaliação qualitativa e ajustes sugeridos.
- `Variant`: identificação, nome e mapa explícito dos campos que substituem os do plano geral.
- `OpeningHand`: lista Markdown, Play/Draw, Pré-side/Pós-side, decisão e justificativa Markdown; sem contador de mulligans.

Cada campo de lista pertence a uma única origem do documento. A representação interpretada é derivada dessa origem. Preservar identificadores e Markdown permite navegação pelo painel, importação e integração futura por campo.

Alternativa considerada: persistir apenas um Markdown único ou o HTML renderizado. Isso exigiria reconstruir a separação de campos e a distinção entre herança e substituição a cada edição/importação.

### 2. Versões editoriais independentes

Cada versão possui um `guideId` e seu próprio conteúdo completo, associado ao mesmo `archetypeId`. Modificações em um guia não se propagam para outro. O rótulo editorial de versão é distinto de uma eventual versão do esquema JSON.

Alternativa considerada: uma coleção de revisões de um único guia. Ela não representa a definição do usuário de guias para coleções, banimentos e metagames diferentes.

### 3. Persistência local e salvamento confirmado

Proposta técnica: usar um repositório assíncrono de documentos no navegador, com gravação atômica por guia; IndexedDB é o candidato inicial. Enfileirar gravações na ordem correta e gravar o estado mais recente, impedindo que uma resposta atrasada sobrescreva uma edição posterior. O indicador de sucesso somente muda após confirmação da gravação. A última atualização representa o conteúdo efetivamente persistido.

A escolha do intervalo de consolidação do autosave é detalhe de implementação. Falhas de cota ou de armazenamento mantêm o conteúdo em memória e informam o estado, conforme guide-storage.

Alternativa considerada: somente uma string em armazenamento síncrono. A abstração de repositório evita acoplar o editor ao mecanismo escolhido e permite manter documentos estruturados.

### 4. D1 — Identidade estável da carta

Recomendação técnica proposta que corresponde à linha 168 da fonte: associar o texto digitado a uma identidade estável de carta, preservando o texto original. Manter a impressão/imagem selecionada separada da identidade usada nas contagens.

Modelo candidato: referência com identificação do campo e posição, nome digitado, nome canônico, alias/idioma, identificador de identidade e identificador opcional da impressão. Os tipos oficiais do Scryfall distinguem `oracle_id`, `id`, `lang`, `printed_name` e os campos de imagem. O adaptador trata os casos em que os identificadores estejam em faces ou algum campo não esteja disponível.

Alternativa considerada: usar o nome ou a imagem como chave. Isso dificultaria associar nomes em dois idiomas e manter a mesma identidade quando o texto for traduzido.

### 5. D2 — Origem comum de listas, imagens e contagens

Recomendação técnica proposta que corresponde à linha 169 da fonte: interpretar cada lista Markdown uma vez em uma representação com quantidade, identidade, estado da resolução e localização no campo. Essa representação alimenta o deck visual, as contagens e a avaliação das trocas. A lista original permanece preservada.

No deck, agregar as cópias de uma identidade por zona; nas mãos, expandir as quantidades em imagens individuais. Maybeboard e referências de texto não são adicionados às zonas do deck base.

Alternativa considerada: manter números e imagens editáveis independentemente da lista. Isso criaria múltiplas origens para os mesmos dados.

### 6. Sintaxe contextual e Markdown comum

Proposta de implementação para card-markdown: resolver links/imagens Markdown com URL e definições explícitas de referências segundo Markdown comum; reconhecer referências de carta sem URL nos demais casos. Código inline, blocos de código e exemplos literais conservam seu conteúdo. Campos de lista aplicam o contrato de quantidade por linha e produzem problemas localizáveis para linhas incompletas.

O texto original é preservado na gravação e no JSON; o resultado renderizado é derivado. A extensão permite renderização por ambiente: referência com interação no HTML, texto legível no PDF e imagem direta para o modificador explícito.

Alternativa considerada: uma substituição global por expressão regular. Essa abordagem pode confundir código, links Markdown, imagens comuns e as novas referências.

### 7. Adaptador Scryfall e imagens automáticas

Usar um adaptador de catálogo para nomes, aliases bilíngues, identidade, tipo, imagens e legalidade. Distinguir encontrado, não encontrado e consulta pendente/falha. Deduplicar consultas repetidas e manter cache de resolução; filas e limites devem seguir a política oficial vigente, a confirmar no início da implementação.

A escolha de imagem é automática. O idioma usado para digitar não exige que a imagem tenha uma impressão em português. Uma imagem ausente mantém nome e quantidade legíveis. O mecanismo exato de resolução português/inglês precisa ser comprovado contra a API, conservando integralmente o requisito bilíngue.

Alternativa considerada: consultar uma carta a cada renderização ou usar somente pesquisa aproximada de nomes. O adaptador evita consultas redundantes e associações silenciosas a cartas diferentes.

### 8. Agrupamento determinístico e pilhas

Convenção proposta para o grupo principal: Terrenos, Criaturas, Instantes, Feitiços, Encantamentos, Planeswalkers, Batalhas, Artefatos e Outros, nessa prioridade quando houver múltiplos tipos. Assim, terrenos artefatos ficam em Terrenos e criaturas artefatos em Criaturas. Cada carta participa de um grupo por zona. A ordem de apresentação dos grupos pode seguir a composição visual definida na implementação, conservando estabilidade e os nomes dos grupos.

Pilhas mostram nome e quantidade de todas as cartas. A imagem ampliada é uma camada de leitura interativa; a composição estática continua identificável nas exportações.

Alternativa considerada: inserir a mesma carta em todos os seus tipos. Isso duplicaria visualmente entradas e dificultaria interpretar os totais.

### 9. Herança explícita e sem cópia automática dos planos

Resolver o plano efetivo campo a campo: se a variante possui uma substituição, usar esse valor; caso contrário, usar o campo geral. Uma substituição definida como string vazia representa remoção intencional de texto e é diferente da ausência de substituição. Restaurar o uso do plano geral remove a substituição.

As verificações e os renderizadores usam esse plano efetivo. Cada variante guarda apenas suas diferenças; alterações gerais se propagam aos campos herdados, dentro do mesmo guia.

Alternativa considerada: copiar todos os campos ao criar a variante. Isso impediria que atualizações gerais acompanhassem as partes compartilhadas.

### 10. D3 — Atualidade e estado das verificações

Recomendação técnica proposta que corresponde à linha 170 da fonte: guardar a data da consulta de legalidade e distinguir resultados completos, pendentes e indisponíveis. A data de referência editorial do guia e a última consulta de legalidade são informações distintas. A v1 verifica os dados consultados; não promete reconstrução de legalidade histórica na data editorial.

Verificações produzem registros com código, mensagem e localização: guia, seção, plano/variante, campo e linha quando aplicável. Divergências de entradas/saídas são informativas. Os problemas editoriais não impedem salvar nem exportar. Falha técnica de gravação ou geração de arquivo continua sendo informada como falha da operação.

Alternativa considerada: declarar o guia válido enquanto consultas ainda estão pendentes. Isso confundiria ausência de resultado com confirmação de legalidade.

### 11. Um documento de leitura com renderizadores por saída

Derivar um modelo de leitura do guia completo, na ordem das seções e com planos efetivos. A prévia mantém todo esse documento. A seleção no sumário muda os campos da esquerda e posiciona a prévia por identificação estável da seção. Uma atualização de texto conserva a posição de leitura enquanto atualiza o conteúdo.

- HTML: arquivo com conteúdo, estilos e comportamento de leitura incorporados; imagens de cartas permanecem remotas. O leitor abre esse arquivo independentemente do editor.
- PDF: adaptador que produz páginas A4, com imagens incorporadas e paginação automática. Antes de escolher o mecanismo de geração, validar um exemplar extenso com pilhas, mãos e textos que atravessem páginas. Uma falha em imagem deve preservar sua identificação textual; a geração precisa informar falhas técnicas reais.
- JSON: envelope com versão de esquema, dados completos do guia e contexto do arquétipo. Conservar identificadores e a distinção entre campos herdados e substituídos. A importação valida a estrutura antes de gravar; colisões são tratadas sem sobrescrever silenciosamente guias existentes. O formato não depende de uma consulta ao Scryfall para recuperar os textos.

Alternativa considerada: converter a prévia atualmente visível em saída. Isso poderia omitir conteúdo do restante do guia ou confundir elementos do editor com o documento de leitura.

### 12. Preparação para tradução

Identificadores de campo, Markdown original e referências estruturadas são a base para tradução por parte do guia. O contrato futuro de transformação precisa preservar cartas, quantidades e formatação. O mecanismo LLM, fornecedores, credenciais e interface de execução serão especificados na etapa posterior, sem tarefas de implementação dessa integração na v1.

## Risks / Trade-offs

- [Resolução bilíngue depende da API] → Executar uma verificação técnica de nomes em português e inglês, incluindo ambiguidades; manter o requisito e distinguir pendência de nome não reconhecido.
- [Arquivo local pode ter muitas seções] → Renderizar com imagens carregadas sob demanda e cache, mantendo o conteúdo integral endereçável pela navegação.
- [Sobreposição e paginação podem reduzir a leitura no PDF] → Verificar o PDF final com nomes, quantidades e sete cartas visíveis, em páginas A4, antes de fechar a escolha do renderizador.
- [JSON e dados do navegador evoluem] → Separar versão do esquema de versão editorial e validar/migrar a estrutura antes de substituir dados.
- [Falha de gravação ou importação] → Conservar os documentos existentes e informar o estado real; validar a recuperação com conteúdo estruturado completo.

## Migration Plan

1. Implementar o esquema local e o importador JSON versionado em uma biblioteca inicialmente vazia.
2. Criar os primeiros guias a partir do modelo proposto e persistir o conteúdo na forma estruturada.
3. Manter migrações de esquema como operações explícitas do repositório; verificar leitura e escrita do conteúdo anterior antes de confirmar a migração.
4. Permitir cópia editável JSON antes de migrações futuras. Em falha de migração/importação, preservar os registros existentes.

## Open Questions

- Confirmar, em verificação técnica, o fluxo atual do Scryfall para aliases portugueses e imagens/faces. Isso é uma dependência de implementação, não uma autorização para aceitar apenas inglês.
- Escolher o mecanismo de PDF após comprovar A4, paginação, pilhas e mãos no arquivo resultante.
- Fixar detalhes internos de cache e intervalo do autosave conforme o comportamento especificado; as specs não exigem um framework específico.

## Fontes técnicas consultadas

- [Regras oficiais do Pauper](https://magic.wizards.com/en/formats/pauper): consultadas nesta elaboração; base para as verificações de tamanho e cópias em guide-validation.
- [Tipos oficiais do Scryfall](https://github.com/scryfall/api-types/blob/main/src/objects/Card/CardFields.ts): campos de identidade, idioma, impressão e imagem consultados nesta elaboração.
- [Documentação da API do Scryfall](https://scryfall.com/docs/api), [resolução por nome](https://scryfall.com/docs/api/cards/named) e [sintaxe de busca](https://scryfall.com/docs/syntax): o acesso pelo navegador de pesquisa retornou HTTP 403. Endpoints bilíngues e política vigente de requisições precisam ser confirmados na implementação; a documentação bloqueada não foi tratada como conteúdo lido.
