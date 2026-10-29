## 1. Fundamentos e verificações técnicas

- [x] 1.1 Definir os tipos de documento, identificadores, campos Markdown e substituições de variantes conforme design e specs, distinguindo a versão editorial do esquema de dados.
- [x] 1.2 Comprovar o fluxo de resolução português/inglês, os campos de imagem/faces e as regras de uso vigentes da API do Scryfall, conservando SM-019 a SM-022.
- [x] 1.3 Escolher o mecanismo de exportação PDF após gerar e inspecionar um exemplo A4 com textos extensos, pilhas e mãos, conforme SM-067 e SM-077.
- [x] 1.4 Definir o esquema JSON versionado e as regras de validação/importação, preservando os dados descritos em SM-068 e SM-069.

## 2. Biblioteca por arquétipo

- [x] 2.1 Implementar o agrupamento e a seleção de guias por arquétipo, com identificação e contexto de cada versão (SM-005 a SM-007).
- [x] 2.2 Implementar o isolamento do conteúdo entre guias e preservar os existentes ao criar outro no mesmo arquétipo (SM-008 e SM-009).
- [x] 2.3 Verificar que editar uma versão não altera as listas, textos, matchups ou mãos das anteriores.

## 3. Persistência e salvamento automático

- [x] 3.1 Implementar o uso pessoal e o repositório de documentos no navegador, com gravação automática e recuperação (SM-001 e SM-002).
- [x] 3.2 Implementar os estados de salvamento e a última atualização confirmada, tratando gravações pendentes e falhas sem perda da edição em memória (SM-003).
- [x] 3.3 Disponibilizar o acesso às saídas HTML e PDF para compartilhamento (SM-004).
- [x] 3.4 Verificar recuperação após reabrir o aplicativo e a ordem correta de gravações quando há alterações rápidas.

## 4. Modelo editorial e seções

- [x] 4.1 Criar o modelo de informações do guia, apresentação, Sobre o deck, main deck, sideboard, escolhas/base de mana, maybeboard, matchups e encerramento (SM-016 e SM-078 a SM-086).
- [x] 4.2 Criar os campos de justificativa das trocas, estratégia, interações, avaliação e ajustes sugeridos nos planos (SM-087 a SM-090; SM-041).
- [x] 4.3 Implementar adicionar, renomear, excluir e reordenar seções com atualização de ordem no documento e nas saídas (SM-017).

## 5. Interpretação do Markdown

- [x] 5.1 Implementar referências textuais e imagens diretas de cartas, diferenciando links/imagens comuns e definições de referência Markdown (SM-073, SM-074 e SM-076).
- [x] 5.2 Implementar listas com quantidade inteira positiva e localização de linha, preservando as linhas originais e distinguindo os contextos deck, trocas e mãos (SM-025 e SM-075).
- [x] 5.3 Implementar a apresentação de referências e imagens no documento de impressão (SM-077).
- [x] 5.4 Verificar entradas incompletas, nomes nos dois idiomas e os conflitos entre a sintaxe de cartas e Markdown comum.

## 6. Catálogo de cartas

- [x] 6.1 Implementar o adaptador Scryfall com resolução bilíngue, identidade comum e dados de imagem/tipo/legalidade (SM-019 a SM-021).
- [x] 6.2 Preservar a associação da carta quando o texto de apresentação mudar de idioma (SM-022).
- [x] 6.3 Implementar cache, deduplicação e estados encontrado, não encontrado e pendente, conforme o design e a política verificada da API.
- [x] 6.4 Verificar que um erro de rede não é apresentado como nome inexistente nem como confirmação de legalidade.

## 7. Listas e deck visual

- [x] 7.1 Implementar formato Pauper e os campos separados de main deck e sideboard, ligando listas, blocos visuais e quantidades (SM-023, SM-024, SM-026 e SM-027).
- [x] 7.2 Implementar zonas separadas, agrupamento principal por tipo e uma imagem por identidade distinta em cada zona (SM-028, SM-029 e SM-032).
- [x] 7.3 Implementar pilhas parcialmente sobrepostas com nomes e quantidades visíveis (SM-030 e SM-031).
- [x] 7.4 Implementar imagem automática e abertura/fechamento da imagem completa no hover e toque (SM-033 e SM-034).

## 8. Matchups e variantes

- [x] 8.1 Implementar matchups pelo nome do arquétipo adversário, plano geral e variantes opcionais com nomes livres (SM-035 a SM-037).
- [x] 8.2 Implementar resolução de campos herdados e substituídos, distinguindo ausência de substituição de texto vazio (SM-038 e SM-039).
- [x] 8.3 Implementar entradas/saídas no plano e avaliar os campos efetivos de cada variante (SM-040).
- [x] 8.4 Implementar a escala qualitativa de sete opções e a justificativa Markdown (SM-041 e SM-042).
- [x] 8.5 Verificar atualização dos campos herdados e preservação das estratégias específicas após editar o plano geral.

## 9. Mãos iniciais

- [x] 9.1 Implementar exemplos por matchup com um cenário Play/Draw e Pré-side/Pós-side por exemplo (SM-043 a SM-045).
- [x] 9.2 Implementar a lista de sete cartas, expandindo cópias individualmente na faixa visual e aceitando rascunhos incompletos com aviso (SM-046, SM-050 e SM-051).
- [x] 9.3 Implementar decisão Manter/Mulligar/Situacional e justificativa Markdown, incluindo observações de mulligan no texto (SM-047 a SM-049).

## 10. Verificações do guia

- [x] 10.1 Implementar legalidade Pauper pelos dados da identidade e contagens de formato, incluindo exceções de regras, conforme SM-052 e SM-053.
- [x] 10.2 Implementar o estado e a localização das referências reconhecidas, não reconhecidas e pendentes (SM-054).
- [x] 10.3 Implementar a avaliação das trocas em relação à lista base, disponibilidade e diferença de totais (SM-055 a SM-057).
- [x] 10.4 Implementar contagem e remoção do problema de mãos com quantidade diferente de sete (SM-058).
- [x] 10.5 Registrar data e completude da consulta de legalidade conforme a recomendação D3, distinguindo-as da data editorial do guia.

## 11. Editor e prévia

- [x] 11.1 Implementar duas colunas, sumário hierárquico recolhível e uma seleção editável por vez (SM-010 a SM-012).
- [x] 11.2 Implementar campos Markdown separados, preservando o conteúdo ao trocar a seleção (SM-015).
- [x] 11.3 Implementar prévia integral e navegação até o trecho selecionado no sumário (SM-013 e SM-014).
- [x] 11.4 Integrar o acesso ao painel do guia dentro do editor (SM-018).

## 12. Painel informativo

- [x] 12.1 Implementar resumo compacto acima das colunas, com detalhes expansíveis e navegação para o campo do problema (SM-059 a SM-061).
- [x] 12.2 Manter edição, salvamento e exportações disponíveis com problemas editoriais (SM-062 a SM-064).
- [x] 12.3 Verificar rascunhos com deck incompleto, mão de seis cartas e referência não resolvida, distinguindo validação informativa de falha técnica da operação.

## 13. Leitura e exportações

- [x] 13.1 Implementar o documento web contínuo com todas as seções e planos efetivos (SM-065).
- [x] 13.2 Implementar HTML com conteúdo, estilos e interações incorporados, imagens remotas e nomes/quantidades legíveis quando as imagens não carregarem (SM-066).
- [x] 13.3 Implementar PDF A4 com paginação automática e conteúdo completo conforme o mecanismo verificado, preservando pilhas, mãos, referências e imagens explícitas (SM-067 e SM-077).
- [x] 13.4 Implementar exportação/importação JSON completa com validação estrutural e tratamento de colisões sem sobrescrita silenciosa, preservando herança, substituições e o contexto de arquétipo/versão (SM-068 e SM-069).
- [x] 13.5 Verificar o ciclo exportar/importar em outro navegador e comparar os dados e campos Markdown recuperados.

## 14. Preparação para tradução futura

- [x] 14.1 Manter os fluxos da primeira versão utilizáveis sem LLM, com campos individualmente identificáveis para integração posterior (SM-070 e SM-071).
- [x] 14.2 Definir e verificar o contrato de preservação de referências, quantidades e formatação em uma futura transformação de idioma (SM-072).

## 15. Aceitação da implementação futura

- [x] 15.1 Conferir os cenários das 14 capacidades e os critérios de aceite ligados em `rastreabilidade.md` contra os comportamentos implementados.
- [x] 15.2 Inspecionar o editor, a prévia e o HTML exportado com um guia de várias seções, matchups, variantes e mãos, incluindo hover e toque.
- [x] 15.3 Inspecionar o arquivo PDF final de um guia extenso para confirmar A4, quebras automáticas, sete cartas nas mãos e legibilidade dos nomes e quantidades.
- [x] 15.4 Confirmar salvamento, reabertura, isolamento entre guias e portabilidade JSON, registrando as evidências da implementação antes de concluir as tarefas.
