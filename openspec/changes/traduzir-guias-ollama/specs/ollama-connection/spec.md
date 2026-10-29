## ADDED Requirements

### Requirement: Descoberta do Ollama local
O sistema SHALL verificar automaticamente a API Ollama em `http://localhost:11434` ao abrir a área Traduções e SHALL oferecer verificação manual. SHALL utilizar `127.0.0.1:11434` como fallback de resolução local, limitar a descoberta a três segundos por tentativa e distinguir verificando, disponível, indisponível, timeout e resposta incompatível, sem bloquear o editor.

#### Scenario: Serviço disponível
- **WHEN** a área Traduções é aberta e o Ollama responde a `GET /api/tags` com catálogo válido
- **THEN** o serviço é indicado como disponível e os modelos são apresentados sem configuração de endereço.

#### Scenario: Serviço ausente ou incompatível
- **WHEN** a conexão é recusada, excede o prazo ou retorna uma resposta que não corresponde à API
- **THEN** a interface identifica o problema, oferece verificar novamente e conserva acesso à edição e aos rascunhos existentes.

### Requirement: Catálogo e seleção de modelo
O sistema SHALL listar nomes/tags e tamanhos dos modelos disponíveis no serviço, exibindo parâmetros e quantização quando informados. SHALL permitir seleção explícita, inclusive de modelos especializados em tradução, distinguir catálogo vazio de falha de serviço e revalidar a seleção antes de iniciar/retomar. SHALL impedir uso de modelos remotos, incompatíveis com geração textual ou cujo caráter local não possa ser verificado; não SHALL inferir qualidade de tradução pelo nome do modelo.

#### Scenario: Nenhum modelo instalado
- **WHEN** o serviço responde com lista vazia
- **THEN** a interface informa que é necessário instalar um modelo externamente e mantém o início da tradução indisponível, sem baixar modelos.

#### Scenario: Modelo removido ou remoto
- **WHEN** o modelo selecionado deixa de existir ou é identificado como execução remota
- **THEN** o lote não inicia nem retoma, informa o motivo e mantém os resultados salvos.

### Requirement: Transporte restrito e execução opcional
O sistema SHALL executar chamadas Ollama no processo principal do Electron por IPC específico, validando remetente e parâmetros e aceitando somente loopback na porta 11434. SHALL rejeitar redirects, destinos externos e requisições de remetentes não autorizados, sem relaxar o isolamento ou a política de rede do renderer. Não SHALL instalar, iniciar ou modificar o serviço Ollama. No navegador sem preload, SHALL explicar a disponibilidade da integração no aplicativo desktop.

#### Scenario: Solicitação fora do contrato
- **WHEN** o IPC recebe um endereço externo, redirect ou solicitação de origem não autorizada
- **THEN** a operação é rejeitada sem transmitir conteúdo do guia.

#### Scenario: Usar o aplicativo sem tradução
- **WHEN** o Ollama está ausente ou o editor é usado no navegador
- **THEN** criação, edição, persistência e exportação de guias continuam disponíveis.

### Requirement: Geração e teste por trecho
O sistema SHALL oferecer teste de uma unidade curta com o modelo e idiomas selecionados e um perfil de prompt versionado. SHALL permitir perfil avançado com texto e idiomas parametrizados, conservar o template padrão do modelo por padrão e validar resposta textual completa e proteções. O teste SHALL mostrar a resposta sem classificá-la como tradução linguisticamente certificada.

#### Scenario: Testar modelo especializado
- **WHEN** a pessoa seleciona um modelo instalado e executa Testar trecho com um perfil compatível
- **THEN** a aplicação envia somente aquela unidade, apresenta original e resultado e informa qualquer erro de geração ou preservação antes do lote completo.
