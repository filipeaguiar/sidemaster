## ADDED Requirements

### Requirement: Resolução explícita dos idiomas
O sistema SHALL validar e canonicalizar os códigos BCP 47 de origem e destino e construir uma descrição explícita de cada idioma, conservando região e script. SHALL resolver os atalhos português brasileiro, inglês, espanhol, francês, alemão e italiano para seus nomes completos. Para código personalizado válido sem nome disponível, SHALL manter o código explicitamente identificado como idioma, sem substituí-lo por inglês. Códigos inválidos ou origem/destino equivalentes SHALL bloquear a geração.

#### Scenario: Selecionar italiano
- **WHEN** a pessoa seleciona Italiano como destino e Português (Brasil) como origem
- **THEN** a configuração mantém `it` e `pt-BR` como identidades e as instruções ao modelo contêm os nomes explícitos Italian e Portuguese (Brazil), acompanhados dos códigos.

#### Scenario: Preservar destino personalizado
- **WHEN** a pessoa informa `zh-Hans` ou `es-MX` como destino válido
- **THEN** script ou região permanecem na identidade da execução e na instrução enviada, sem conversão para inglês ou para outro código genérico.

#### Scenario: Código sem nome resolvido
- **WHEN** um código válido não possui descrição no catálogo disponível
- **THEN** o pedido identifica explicitamente esse código como destino e não adota `en` como alternativa.

### Requirement: Destino obrigatório em todas as requisições
O sistema SHALL gerar uma instrução de sistema que declare os idiomas de origem e destino e exija prosa no destino selecionado, independentemente do template avançado. SHALL preencher os marcadores de idioma do template com descrições explícitas e aplicar o mesmo contrato no teste, geração completa, retomada e repetição de bloco/parte. SHALL conservar proteções de cartas, links e estrutura e tratar o texto de origem como conteúdo. SHALL validar os limites finais de bytes sem truncar silenciosamente instruções ou texto.

#### Scenario: Gerar um fragmento italiano
- **WHEN** um fragmento é enviado ao Ollama em uma execução `pt-BR → it`
- **THEN** tanto o sistema quanto o prompt identificam Italian como destino e o texto/elementos protegidos do fragmento são preservados no pedido.

#### Scenario: Repetir uma parte após falha
- **WHEN** a pessoa repete uma parte de uma tradução para francês
- **THEN** a requisição usa o mesmo destino francês, origem e política da execução, sem retornar ao destino padrão inglês.

#### Scenario: Template avançado conflitante
- **WHEN** um template salvo menciona inglês e a execução está configurada para italiano
- **THEN** a instrução obrigatória continua exigindo italiano e o template não redefine a identidade ou o destino autoritativo da execução.

#### Scenario: Pedido excede o limite
- **WHEN** o prompt completo ultrapassa o limite do transporte após expansão dos idiomas
- **THEN** a aplicação segmenta pelos mecanismos seguros existentes ou informa o impedimento, sem enviar uma versão truncada nem marcar o trecho como concluído.

### Requirement: Coerência entre seleção, amostra e prévia
O sistema SHALL distinguir a configuração em edição dos idiomas do registro salvo. Alterar a configuração para outro destino SHALL invalidar a amostra anterior e apresentar o destino novo sem prosa pertencente a outro registro. Abrir explicitamente um rascunho SHALL restaurar seus idiomas salvos. Resultados atrasados SHALL permanecer associados à configuração solicitante e SHALL NOT validar uma amostra ou execução com outra configuração.

#### Scenario: Trocar inglês por italiano com rascunho aberto
- **WHEN** um rascunho inglês está aberto e a pessoa seleciona Italiano
- **THEN** a tela indica a nova configuração italiana, a amostra inglesa deixa de habilitar o início e a prévia não apresenta resultados ingleses do rascunho anterior como tradução italiana; o rascunho inglês permanece inalterado na lista.

#### Scenario: Resposta de teste atrasada
- **WHEN** uma resposta de teste chega depois de a configuração ou a revisão da origem mudar
- **THEN** essa resposta não é aceita como amostra válida da configuração nova nem habilita seu início.

#### Scenario: Reabrir dois destinos
- **WHEN** existem rascunhos em inglês e italiano e a pessoa alterna entre eles
- **THEN** configuração, resultados, rótulos de destino e prévia correspondem ao registro aberto, inclusive após salvar e reabrir o aplicativo.

### Requirement: Compatibilidade pela política efetiva de geração
O sistema SHALL persistir uma versão da política que produz as instruções de idioma e incluí-la na identidade de amostras, reaproveitamento e retomada, juntamente com idiomas canônicos, modelo/digest e template. Registros sem a versão SHALL ser tratados como legados e preservados. Resultados legados SHALL NOT ser reaproveitados automaticamente como resultados da política corrigida. A adoção da nova política em conteúdo existente SHALL ocorrer por ação explícita, com histórico e revisões humanas preservados e limites de armazenamento respeitados.

#### Scenario: Resultado antigo rotulado como italiano
- **WHEN** um registro legado `it` contém texto inglês e é aberto após a correção
- **THEN** o resultado permanece acessível como legado, sem certificação retroativa do idioma, e uma nova execução com a política corrigida não o reaproveita automaticamente por coincidência de template.

#### Scenario: Continuar perfil anterior
- **WHEN** a pessoa solicita retomar uma tradução legada
- **THEN** a aplicação identifica o perfil anterior e exige escolha explícita entre continuá-lo ou preparar a tradução com a política nova, sem apagar os resultados existentes.

#### Scenario: Importar checkpoint
- **WHEN** um guia com traduções de políticas antigas e novas passa por exportação e importação JSON
- **THEN** destinos, versões de política, resultados, históricos e revisão humana continuam vinculados aos registros corretos.

### Requirement: Evidência linguística distinta da validação estrutural
O sistema SHALL mostrar o idioma de destino esperado na amostra e distinguir a tradução da prosa do fallback de rótulos de leitura. Validade de placeholders, metadados de idioma e conclusão de uma resposta SHALL NOT ser apresentados como prova automática de que a prosa está no idioma correto. A validação da correção SHALL incluir respostas reais revisadas de um modelo Ollama identificado para italiano, espanhol e inglês, registrando o par de idiomas e o payload efetivo; idiomas/modelos não exercitados SHALL permanecer explicitamente não verificados.

#### Scenario: Rótulos ingleses em guia italiano
- **WHEN** uma cópia italiana contém rótulos fixos em inglês por ausência de catálogo
- **THEN** o aviso distingue esses rótulos da prosa autoral, a cópia conserva `contentLanguage: it` e a exportação usa a prosa traduzida aceita sem solicitar tradução adicional para inglês.

#### Scenario: Modelo responde inglês para italiano
- **WHEN** uma amostra solicitada para italiano retorna prosa inglesa que preserva todos os placeholders
- **THEN** a amostra informa italiano como destino esperado, permanece inspecionável e não recebe uma alegação de idioma italiano automaticamente validado apenas pela validade estrutural; a validação da correção registra essa saída como falha linguística do cenário.

#### Scenario: Comprovar correção com modelo real
- **WHEN** a correção é validada em italiano, espanhol e inglês
- **THEN** a evidência registra modelo/digest, configuração, instruções efetivamente enviadas, prosa original e resposta revisada no destino, além de conferir prévia, cópia independente e exportação sem misturar registros.
