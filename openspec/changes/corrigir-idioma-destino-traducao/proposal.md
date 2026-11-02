## Why

Foi relatado que selecionar italiano ou outro destino continua produzindo prosa em inglês. A inspeção encontrou instruções de idioma pouco explícitas para o modelo e divergência possível entre a configuração selecionada e a prévia de um rascunho anterior; o aplicativo precisa aplicar e apresentar o destino de forma consistente.

## What Changes

- Resolver os idiomas de origem e destino por código BCP 47 e nome explícito, incluindo variantes e destinos personalizados, sem substituir destinos desconhecidos por inglês.
- Incluir o par de idiomas em uma instrução de sistema obrigatória e no prompt de cada fragmento, usando o mesmo construtor no teste, na execução, na retomada e na repetição de partes.
- Garantir que seleção, amostra, prévia, rascunho salvo e cópia final correspondam à mesma configuração; trocar o destino invalida a amostra e impede que resultados anteriores sejam apresentados como pertencentes ao novo idioma.
- Versionar a política de geração e impedir reaproveitamento automático de resultados de perfis antigos como se já tivessem sido produzidos pela política corrigida. Preservar resultados, revisões e cópias existentes.
- Distinguir o fallback de rótulos de leitura em inglês da tradução da prosa e mostrar o destino explicitamente no teste, sem alegar que validação estrutural comprova o idioma da resposta.
- Registrar evidência com respostas reais do Ollama para italiano e outros destinos, além de regressões determinísticas do conteúdo enviado e do isolamento entre idiomas.

## Capabilities

### New Capabilities

- `translation-language-targeting`: aplicação do idioma de destino em todas as requisições, coerência de estado por idioma e compatibilidade entre versões de perfis de geração.

### Modified Capabilities

Nenhuma spec principal será modificada. Os contratos de `guide-translation` e `translation-workspace` ainda estão na change ativa `traduzir-guias-ollama`; esta capacidade complementa esses contratos e deverá ser reconciliada com eles na integração. Também deve conservar a reconciliação de origem de `corrigir-links-traducao-maos-iniciais`.

## Impact

- Áreas: `src/translation-ui.js`, construtor de requisições extraído para módulo testável, configuração em `index.html`, compatibilidade/reaproveitamento de registros e testes de tradução. Inspecionar o transporte em `electron/ollama-client.cjs` sem alterar o contrato local do Ollama desnecessariamente.
- Não requer serviço externo, tradução em nuvem, instalação automática de modelos, detecção universal de idioma nem um catálogo completo de rótulos para todos os idiomas.
- Esta change propõe a correção; não altera o runtime, o número de versão, os builds ou a Release durante a investigação.
