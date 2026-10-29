## Context

`src/cards.js` mantém duas estruturas em memória: uma promessa por nome consultado e os resultados resolvidos. Isso evita chamadas duplicadas durante a sessão, mas ambos se perdem ao recarregar a página. A fila atual espaça consultas em 110 ms. A prévia e o catálogo usam URLs remotas de imagem; o editor já possui uma ação de recarga que deve continuar sem reconsultar nomes com falha.

## Goals / Non-Goals

**Goals:**

- Reutilizar resultados bem-sucedidos do Scryfall em sessões futuras do mesmo navegador e origem.
- Manter imagem e dados de identidade disponíveis durante indisponibilidade de rede, sem declarar atualizada uma legalidade vencida.
- Persistir falhas por nome normalizado para que refresh e re-render não repitam uma consulta que falhou.
- Manter o tráfego abaixo da recomendação do Scryfall.

**Non-Goals:**

- Tornar o editor ou os guias totalmente offline.
- Copiar bytes de imagem em `localStorage`.
- Baixar o catálogo inteiro em massa ou criar um servidor/proxy para Scryfall.

## Decisions

### IndexedDB para o catálogo persistente

Criar um pequeno repositório IndexedDB separado do armazenamento de guias. Cada registro usa o nome informado, normalizado por espaços externos e caixa, como chave e guarda estado, dados úteis da carta, URLs de imagem e horário da última resposta bem-sucedida. A chave mantém textos em inglês e português como aliases independentes; ambas as entradas podem apontar para a mesma identidade Oracle.

IndexedDB é assíncrono e aceita objetos estruturados. `localStorage` permanece para os guias pequenos e não recebe strings base64 das imagens.

### Frescor dos dados e imagens

Uma resposta positiva é considerada atual por 24 horas. Dentro desse período, reloads usam o registro local e não chamam a API. Depois, o registro antigo continua disponível para renderizar o nome e a imagem enquanto uma única atualização é consultada. Até chegar uma resposta atual, a referência permanece identificada, mas a legalidade é apresentada como pendente/desatualizada. Uma falha nessa atualização é memorizada para o nome atual e não gera outra tentativa até o nome ser alterado.

Ao acionar o botão de recarga de imagens, o editor identifica as cartas do guia ativo que ainda não têm seus arquivos de imagem salvos no IndexedDB, faz fetch dos Blobs correspondentes (imagem `normal` e arte `art_crop`) e persiste-os em uma store dedicada do IndexedDB (`images`). A exibição passa a usar Object URLs gerados a partir desses Blobs locais, mantendo fallback transparente para as URLs remotas enquanto o download não for realizado. `localStorage` continua estritamente livre de imagens ou dados base64.

### Falhas negativas persistentes

Guardar `notfound` e `error` pelo nome normalizado. `notfound` significa que uma resposta válida do catálogo não encontrou a carta; `error` significa indisponibilidade ou resposta HTTP que impediu a consulta. Ambos sobrevivem a refresh e não são repetidos para o mesmo texto. Editar o nome cria outra chave e inicia uma nova consulta. A busca alternativa após 404 continua limitada ao comportamento atual e também não se repete para a mesma chave.

### Limite de chamadas

Manter a fila serializada atual com intervalo mínimo de 110 ms entre chamadas, inclusive chamadas alternativas. Não fazer retry automático de `429`, falhas de rede ou `5xx`; persistir o estado de falha para a chave atual. O cache positivo reduz a quantidade de chamadas após a primeira resolução.

### Compatibilidade e degradação

Versionar o banco e os registros. Se IndexedDB estiver indisponível ou exceder quota, manter o editor funcional com o cache em memória atual; não bloquear edição, renderização ou exportação. O botão de recarga da prévia continua reusando o cache e não limpa nem ignora entradas de erro.

## Risks / Trade-offs

- **Legalidade pode mudar dentro do intervalo de 24 horas** → Exibir dados antigos como pendentes, sem declarar a legalidade vencida como atual.
- **O navegador pode remover dados locais por quota ou limpeza de dados do site** → Tratar falta de cache como miss normal e consultar Scryfall com a fila existente.
- **Uma indisponibilidade transitória fica memorizada para o mesmo nome** → Preservar a regra solicitada de não repetir falha; uma edição do nome inicia outra consulta.
- **O cache HTTP de imagens pode expirar ou ser limpo pelo navegador** → As imagens permanecem remotas e podem ser baixadas novamente sem uma nova consulta ao endpoint de dados quando o registro positivo ainda estiver fresco.

## Migration Plan

Criar o banco IndexedDB sob demanda, sem transformar nem modificar os registros de guias já salvos. Na primeira resolução, preencher o cache progressivamente. Em falha ao abrir ou escrever no banco, usar o cache em memória e continuar o fluxo existente. Para reverter, remover o repositório persistente; os guias não dependem dele e permanecem intactos.

## Open Questions

- Nenhuma para esta proposta. O prazo inicial de frescor é de 24 horas e pode ser ajustado conforme uso e frequência de mudanças de legalidade.
