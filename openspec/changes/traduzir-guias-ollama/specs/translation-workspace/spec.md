## ADDED Requirements

### Requirement: Área dedicada por guia e idioma
O sistema SHALL oferecer acesso Traduções no guia e apresentar registros por idioma/data, configuração de origem/destino, serviço, modelo, teste curto e criação de execução. SHALL oferecer inglês, espanhol, francês, alemão, italiano e português brasileiro como atalhos e aceitar código BCP 47 personalizado, informando que suporte linguístico depende do modelo selecionado.

#### Scenario: Gerenciar dois idiomas
- **WHEN** um guia possui rascunhos para inglês e espanhol
- **THEN** ambos aparecem separados com seus estados e podem ser abertos sem misturar textos ou configurações.

### Requirement: Progresso e comandos de execução
O sistema SHALL mostrar estado da execução, quantidade concluída/total, seção/campo atual, unidades com erro e estado real de gravação. SHALL disponibilizar início, pausa, retomada, cancelamento, repetição de erros e exclusão deliberada com confirmação de rascunhos salvos. Cancelar SHALL conservar o rascunho; excluir SHALL ser uma ação distinta.

O sistema SHALL organizar o início em Configurar, Testar trecho e Iniciar tradução, com teste e ação principal próximos e explicação visível do requisito que impede iniciar. Um rascunho sem resultados SHALL apresentar Iniciar tradução; uma execução parcial SHALL apresentar Continuar tradução. Testar uma amostra SHALL usar conteúdo do próprio guia e SHALL NOT criar um rascunho. Prompt e limites SHALL ficar em Configurações avançadas.

#### Scenario: Iniciar um rascunho ainda sem resultados
- **WHEN** a pessoa abre um rascunho com zero trechos concluídos
- **THEN** a tela mostra Testar trecho e Iniciar tradução, explica que o teste deve ser concluído e libera o início após um teste válido, sem criar outro rascunho ao iniciar.

#### Scenario: Acompanhar tradução longa
- **WHEN** uma tradução processa várias subseções
- **THEN** a pessoa identifica o item atual, o progresso persistido e pode pausar sem perder as unidades anteriores.

### Requirement: Revisão lado a lado
O sistema SHALL apresentar árvore/caminho das unidades, original imutável e tradução editável lado a lado, com navegação/filtros para pendentes, erros e unidades não revisadas. SHALL permitir salvar ajustes e marcar revisão humana independentemente do estado de geração, além de disponibilizar prévia integral da tradução.

A coluna de navegação SHALL mostrar uma linha por seção ou subseção, somente com título e ícone de estado agregado, preservando recuo hierárquico. O estado SHALL ser acessível por nome e tooltip. Os campos e parágrafos SHALL ser navegáveis na área de revisão por Anterior/Próximo; excertos, IDs e nomes técnicos de campos SHALL NOT ocupar a coluna de seções.

A revisão SHALL manter o bloco completo como uma peça visual, com painel recolhível de partes internas e indicação de concluídas/total. Uma falha SHALL identificar a parte específica e permitir repetir somente essa parte sem substituir as confirmadas. Resultados parciais SHALL distinguir prosa traduzida de conteúdo ainda original e não liberar a cópia final. Aceitar uma correção manual SHALL exigir validação do bloco completo e impedir retomadas de sobrescrevê-la.

A visualização principal SHALL mostrar o guia completo de origem à esquerda e sua tradução progressiva à direita, desde antes do início. Cada resultado aceito SHALL aparecer na posição editorial correspondente, incluindo partes internas confirmadas. Conteúdo pendente, em execução, com erro ou editado sem confirmação SHALL usar indicadores explícitos no destino, sem apresentar prosa original como tradução aceita. A configuração SHALL poder ser recolhida para ampliar a leitura, os painéis SHALL oferecer rolagem sincronizada opcional e a navegação por seção SHALL localizar ambos. Uma aba Revisar trecho e ações no destino SHALL abrir a edição detalhada sem substituir o modo de leitura integral. Essa projeção parcial SHALL NOT liberar exportação ou criação da cópia incompleta.

#### Scenario: Ler enquanto a tradução avança
- **WHEN** a tradução possui alguns blocos confirmados e outros pendentes
- **THEN** o guia completo original permanece à esquerda, os resultados aceitos aparecem à direita conforme são salvos e os espaços restantes indicam sua pendência; a pessoa pode pausar, reabrir e continuar a leitura com os resultados preservados.

#### Scenario: Abrir a revisão a partir da leitura
- **WHEN** a pessoa aciona a revisão de um bloco no painel traduzido
- **THEN** a aba Revisar trecho abre esse bloco para edição e uma correção aceita reaparece no guia completo.

#### Scenario: Vários parágrafos na mesma subseção
- **WHEN** uma subseção contém título e vários parágrafos para traduzir
- **THEN** a coluna mostra somente seu título e um ícone de estado, e os parágrafos são acessíveis por Anterior/Próximo na revisão.

#### Scenario: Corrigir tradução já gerada
- **WHEN** a pessoa edita um parágrafo e o marca como revisado
- **THEN** a correção é persistida e retomadas não a substituem; retraduzir requer ação específica e mantém a versão anterior recuperável.

#### Scenario: Revisar com Ollama desligado
- **WHEN** o serviço fica indisponível após parte da tradução ser salva
- **THEN** os resultados continuam acessíveis para edição, revisão e prévia, com a geração indisponível até reconexão.

### Requirement: Estado de atualização e conclusão explícita
O sistema SHALL indicar Original alterado quando o snapshot divergir, diferenciar geração concluída de revisão humana concluída e oferecer Criar guia traduzido apenas conforme a completude estrutural. SHALL identificar o idioma na biblioteca/cópia resultante e informar fallback de rótulos de leitura para idiomas sem catálogo.

#### Scenario: Cópia completa com revisão pendente
- **WHEN** todas as unidades estão traduzidas mas algumas não foram revisadas por uma pessoa
- **THEN** a criação da cópia é permitida com indicação explícita das revisões pendentes, sem alegar qualidade linguística validada.
