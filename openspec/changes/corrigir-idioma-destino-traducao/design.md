## Context

Relato: ao selecionar italiano ou outro idioma, a tradução continua em inglês. A investigação foi feita no checkout após a publicação da versão 1.0.1, sem alterar o runtime.

### Evidências e limites do diagnóstico

| Ponto inspecionado | Resultado confirmado | Implicação |
| --- | --- | --- |
| `index.html`, controles `translation-source` e `translation-target`; `translation-ui.js:26` | Italiano tem valor `it`; `target()` lê a seleção ou o código personalizado | Não foi encontrada substituição incondicional do destino por `en` no seletor |
| `translation-ui.js:343-350`, `preparePrompt()` e `callModel()` | O prompt recebe códigos crus; o sistema não especifica origem/destino | O destino depende de o modelo interpretar abreviações em uma instrução genérica |
| Inspeção executável isolada de `preparePrompt()` | Para italiano a primeira frase é literalmente `Translate the source text faithfully from pt-BR into it.`; os demais destinos usam `es`, `fr`, `de`, `ja`, `zh-Hans` | `it` é ambíguo em uma frase inglesa. Isso fundamenta a correção do contrato enviado, mas não prova sozinho a causa da resposta observada |
| `electron/ollama-client.cjs:77-85` | O transporte encaminha `model`, `prompt` e `system` para `/api/generate` e não recebe um parâmetro separado de idioma | Repetir o idioma somente no seletor ou nos metadados não corrige a requisição ao modelo |
| `translation-ui.js:35-41`, `previewContext()` | Se existe rascunho selecionado, a prévia usa seus idiomas mesmo após mudar a configuração | Selecionar italiano com um rascunho inglês aberto pode manter o documento inglês visível |
| `translation-ui.js:98-99, 529-538` | Retomada/reuso já compara o destino, porém o perfil salvo usa `version: 1` e o reuso compara o texto do template | Não foi observado reuso direto de `en` em `it`; falta uma versão da política efetiva para distinguir a correção do sistema |
| `reading.js:43-58` e `translation-language-note` em `index.html` | Rótulos de leitura usam inglês para qualquer idioma não português; há aviso específico | Esse inglês é comportamento previsto, distinto do idioma da prosa autoral |
| `validateTranslation()` e testes existentes | Validam estrutura, referências, resposta vazia e comentários; os testes de tradução não comprovam prosa italiana gerada por modelo real | Validade estrutural não equivale a confirmação linguística |

Não foi executada inferência com o modelo do usuário. O nome/versão do modelo e uma amostra original/resposta ainda devem ser registrados na validação da implementação. O relato de prosa em inglês é tratado como defeito a corrigir, sem atribuí-lo apenas aos rótulos da interface.

## Goals / Non-Goals

**Goals:**

- Tornar o destino inequívoco em todas as requisições, inclusive teste e repetição de partes.
- Manter os idiomas e resultados coerentes entre configuração, amostra, rascunho, prévia e guia independente.
- Impedir que caches e resultados de políticas anteriores sejam tratados silenciosamente como gerados pela correção.
- Comprovar a correção com captura de payload e revisão de saídas reais para destinos diferentes do inglês.

**Non-Goals:**

- Garantir qualidade linguística para qualquer modelo instalado ou declarar detecção automática infalível de idioma.
- Adicionar modelos, serviços em nuvem, tradução completa dos rótulos do app ou nova API remota.
- Alterar automaticamente traduções revisadas, apagar rascunhos antigos ou modificar cópias independentes.

## Decisions

### 1. Resolver código e nome explícito, sem fallback de destino para inglês

Extrair um resolvedor puro de idiomas, com canonicalização BCP 47 e nomes explícitos em inglês para as instruções do modelo. Os atalhos terão nomes determinísticos, como `Italian (it)` e `Portuguese (Brazil) (pt-BR)`. Para idiomas personalizados, usar `Intl.getCanonicalLocales` e `Intl.DisplayNames` quando disponíveis, com tabela dos atalhos e código canônico explícito como alternativa se não houver nome resolvido. Preservar script/região, como `zh-Hans` e `es-MX`. Código inválido impede geração; código válido não reconhecido jamais vira `English (en)`.

Alternativas: continuar somente com códigos mantém a ambiguidade observada; depender de uma tabela de todos os idiomas restringe o campo personalizado; traduzir os nomes pela própria LLM adiciona uma requisição desnecessária e outro ponto de falha.

### 2. Construir um contrato completo por requisição

Um construtor puro receberá configuração imutável e fragmento, retornando `prompt`, `system` e identidade da política. Teste, execução, retomada e repetição usarão o mesmo construtor. O sistema deverá afirmar origem e destino, por exemplo `Source language: Portuguese (Brazil) (pt-BR). Target language: Italian (it). Write the translation in Italian (it).` A instrução também conservará as proteções existentes, proibição de comentários e tratamento do original como conteúdo.

O template avançado continua editável, mas seus marcadores de idioma serão preenchidos com descrições explícitas. O contrato de sistema será gerado independentemente do template e terá o destino selecionado como autoridade; um template que mencione inglês não poderá redefinir a configuração da execução. Validar o tamanho final em bytes e tratar excesso com erro ou segmentação existente, sem cortar o texto ou a instrução com `.slice(0, 16000)`.

Alternativa rejeitada: trocar apenas `it` por `Italian` no template padrão não cobre perfis salvos, templates personalizados nem o sistema genérico. Uma chamada adicional de autodetecção não é necessária para tornar o pedido correto e não comprovaria a resposta em fragmentos curtos.

### 3. Separar configuração em edição e rascunho selecionado

Ao divergir origem/destino/modelo/template do rascunho aberto, a tela representará uma nova configuração, com a prévia de destino pendente e sem resultados do registro anterior. O rascunho anterior continuará acessível na lista, identificado pelo idioma salvo. Abrir explicitamente esse registro restaura a configuração dele. A seleção nova não reescreve seu `targetLanguage`.

A assinatura da amostra e o aceite de respostas deverão incluir idiomas canônicos, modelo/digest, template, versão da política e revisão da origem. Mudanças invalidam a amostra; resultados atrasados permanecem vinculados à configuração que os solicitou e não liberam o início de outra. Preservar as proteções de mudança de origem da change `corrigir-links-traducao-maos-iniciais`.

### 4. Versionar a política efetiva, preservando o legado

Adicionar versão da política no perfil persistido e incluí-la na compatibilidade de reuso, retomada e amostra. Registros sem essa versão são legados; não inferir conformidade pela coincidência do texto do template. Eles continuam disponíveis para revisão e exportação conforme os contratos atuais. Para usar a correção em conteúdo já gerado, oferecer nova execução ou retradução explícita com histórico preservado, respeitando limites de armazenamento; nunca trocar o destino de um registro já existente.

Retomar um legado deverá exigir escolha explícita entre continuar com o perfil anterior identificado e preparar uma execução com a política nova; resultados antigos não serão reutilizados automaticamente nesta última. Não modificar cópias independentes nem descartar revisão humana. Verificar importação/exportação JSON e o validador do modelo antes de decidir se o campo aditivo exige migração de esquema; não aumentar a versão do esquema preventivamente.

### 5. Validar o pedido e avaliar a saída como evidências diferentes

Regressões determinísticas devem capturar o payload entregue à ponte IPC e verificar os nomes/códigos corretos no sistema e no prompt para atalhos e idiomas personalizados. Uma resposta inglesa estruturalmente válida de um mock não prova tradução italiana; a amostra deverá mostrar o destino esperado e permitir inspeção antes do início, sem texto afirmando detecção/validação linguística automática.

Validar com Ollama real ao menos `pt-BR → it`, `pt-BR → es` e `pt-BR → en`, em prosa de várias frases e com cartas/links. Registrar modelo, digest/versão, parâmetros relevantes, par de idiomas, payload efetivo e resposta, usando conteúdo de teste sem guias pessoais. Conferir se a prosa está no destino e reportar limitações do modelo. Destinos sem modelo capaz ficam explicitamente não verificados; mocks e `lang="it"` não substituem essa evidência.

Manter o fallback de rótulos de leitura existente; seu aviso deverá explicar que títulos fixos podem estar em inglês enquanto a prosa é pedida no destino. Não traduzir nomes de cartas como evidência de idioma.

## Risks / Trade-offs

- Um modelo pode ignorar instruções explícitas → comprovar saídas reais e manter revisão humana; não anunciar detecção universal nem trocar silenciosamente o destino.
- Templates antigos podem pedir inglês ou exemplos conflitantes → sistema independente com destino explícito e versão efetiva na assinatura.
- Perfis legados podem conter resultados ingleses rotulados como italiano → não apagar nem validar retroativamente; oferecer execução nova sem reuso automático desses resultados.
- Canonicalização altera apenas a grafia de códigos → comparar forma canônica sem fundir idiomas, regiões ou scripts diferentes e preservar a leitura de registros antigos.
- Rótulos ingleses podem continuar confundindo a avaliação → tornar o aviso visível e validar especificamente a prosa autoral na prévia, cópia e exportação.

## Migration Plan

1. Registrar o payload atual e regressões que representem o relato, o rascunho inglês aberto e o template salvo.
2. Implementar resolvedor/construtor, integrá-los a todos os caminhos e corrigir identidade de configuração/prévia.
3. Evoluir a compatibilidade de perfis sem apagar conteúdo; verificar leitura legada, checkpoints e round-trip JSON.
4. Validar Ollama real e o fluxo de cópia/exportação. Registrar resultados e plataformas não verificadas antes de concluir tarefas.
5. Em rollback, conservar os dados e os perfis originais; não promover resultados da nova política a perfis antigos por simples mudança de número.

## Open Questions

- Qual modelo/digest foi usado no relato e o desvio acontece na amostra, na execução ou em ambas? Coletar na reprodução; a ausência dessa informação não impede especificar e implementar o contrato explícito.
