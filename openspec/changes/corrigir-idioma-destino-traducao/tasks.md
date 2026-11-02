## 1. Reprodução e regressões do destino

- [ ] 1.1 Registrar o cenário do relato com modelo/digest, idioma escolhido, origem e amostra/resposta, distinguindo prosa inglesa de rótulos fixos em inglês; identificar o ponto do fluxo em que ocorre o desvio.
- [ ] 1.2 Adicionar regressões determinísticas dos pedidos para `it`, `es`, `fr`, `de`, `en`, `pt-BR`, `ja`, `zh-Hans` e `es-MX`, incluindo nomes explícitos, códigos canônicos, códigos inválidos e código válido sem descrição disponível.
- [ ] 1.3 Cobrir troca de inglês para italiano com rascunho aberto, invalidação da amostra e resposta atrasada, sem apresentar nem reutilizar a tradução inglesa como italiana.

## 2. Contrato de idioma com o modelo

- [x] 2.1 Extrair resolvedor puro de idiomas com nomes dos atalhos, canonicalização BCP 47, resolução de destinos personalizados e alternativa explícita por código sem fallback para inglês.
- [x] 2.2 Extrair construtor puro de `system` e `prompt` que declare origem/destino, preencha nomes e códigos no template, preserve proteções e confira limites em bytes sem truncamento silencioso.
- [ ] 2.3 Integrar o construtor ao teste, à geração completa, à retomada e à repetição de blocos/partes; capturar a requisição na ponte IPC e confirmar que o transporte preserva o par de instruções.
- [ ] 2.4 Cobrir template avançado salvo que menciona inglês e garantir que a instrução de sistema autoritativa permaneça vinculada ao destino escolhido.

## 3. Estado e compatibilidade dos rascunhos

- [x] 3.1 Separar configuração em edição e registro aberto; ao divergir, projetar o destino novo sem resultados do rascunho anterior, preservando a abertura explícita de cada tradução salva.
- [x] 3.2 Incorporar idiomas canônicos, modelo/digest, template, versão da política e revisão da origem à assinatura do teste e às verificações de aceite de respostas, mantendo as proteções contra mudança concorrente da origem.
- [x] 3.3 Persistir a versão da política efetiva e usá-la na compatibilidade de reaproveitamento/retomada; tratar ausência como legado e impedir reutilização automática em execuções novas corrigidas.
- [x] 3.4 Disponibilizar escolha explícita de continuidade legada ou uso da política nova sem apagar texto/revisão/histórico nem alterar cópias independentes; conferir os limites de registros/tamanho antes de criar uma nova execução.
- [ ] 3.5 Verificar leitura legada e round-trip JSON dos perfis e idiomas; adaptar validação/migração somente se necessário, preservando checkpoints e identificadores.

## 4. Apresentação e evidência linguística

- [x] 4.1 Mostrar nome/código de destino na amostra e esclarecer o fallback de rótulos fixos sem afirmar que resposta estruturalmente válida comprova o idioma da prosa.
- [ ] 4.2 Exercitar o fluxo visual inglês → italiano com rascunho existente e alternância entre dois registros, verificando seleção, cabeçalhos, resultados, reabertura e impedimento de início com amostra antiga.
- [ ] 4.3 Executar amostras reais Ollama para `pt-BR → it`, `pt-BR → es` e `pt-BR → en`; registrar modelo/digest, configuração, payload, resposta e revisão da prosa em cada destino, distinguindo limitações do modelo de falhas do aplicativo.
- [ ] 4.4 Conferir um destino personalizado na requisição e, havendo modelo capaz, em geração real; registrar explicitamente combinações não exercitadas, sem promover mocks a evidência linguística.
- [ ] 4.5 Criar a cópia independente italiana e conferir prévia, idioma persistido e exportações HTML/PDF/JSON, preservando cartas/links e distinguindo rótulos fixos ingleses da prosa traduzida.

## 5. Validação e integração

- [ ] 5.1 Executar os testes pertinentes de prompt, estado, segmentação e persistência e a suíte existente; registrar os resultados e corrigir regressões do escopo.
- [ ] 5.2 Registrar evidência por cenário/ambiente e reconciliar os contratos sobrepostos de `traduzir-guias-ollama` e `corrigir-links-traducao-maos-iniciais`, sem marcar tarefas dessas changes como concluídas apenas por esta proposta.
- [x] 5.3 Executar `openspec validate corrigir-idioma-destino-traducao --strict --json --no-interactive` e conferir coerência dos artefatos antes de concluir a implementação.
