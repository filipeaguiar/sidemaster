# Traduções locais com Ollama

A área **Traduções** do SideMaster Desktop usa uma instância local do Ollama em `localhost:11434`. O aplicativo não inicia o Ollama nem baixa modelos. Instale e inicie o Ollama por fora do SideMaster e baixe um modelo com capacidade de geração de texto e adequado à tradução. A lista do catálogo apresenta os modelos já instalados; os metadados disponíveis podem variar conforme a versão do Ollama.

## Fluxo

1. Abra **Traduções** no guia que será usado como origem.
2. Escolha os idiomas e o modelo na coluna esquerda. Um modelo local já instalado é selecionado automaticamente; você pode trocar. Para outro idioma, use um código BCP 47, por exemplo `ja` ou `zh-Hant`. O prompt e os limites ficam em **Configurações avançadas**.
3. Use **Testar trecho**, no topo da área principal, e confira a amostra retirada do próprio guia. O botão **Iniciar tradução** fica ao lado e é liberado após um teste válido. Se houver um impedimento, a frase acima dos botões explica o próximo passo.
4. Clique em **Iniciar tradução**. Um rascunho que ainda não começou também usa esse nome. Uma execução parcialmente concluída usa **Continuar tradução**. A criação do rascunho ocorre ao iniciar; testar não cria um rascunho. O aplicativo envia um trecho por vez e salva cada resultado antes de enviar o próximo.
5. **Guia completo** mostra o original à esquerda e a tradução à direita. Os resultados aparecem conforme cada bloco ou parte interna é confirmado; espaços pendentes indicam **Aguardando tradução**, **Traduzindo…** ou erro, sem apresentar prosa original como tradução. A configuração recolhe ao iniciar para ampliar a leitura; use **Mostrar configuração** para reabri-la. **Rolar juntos** sincroniza os painéis e pode ser desmarcado.
6. A coluna de navegação mostra uma linha por seção/subseção, com apenas o título e um ícone de estado: círculo para pendente, seta giratória para execução, círculo parcial para tradução parcial, exclamação para erro, um visto para tradução concluída e dois vistos para revisão completa. Passe o ponteiro sobre o ícone/título para ver o estado por extenso. Clique na seção para localizá-la nos dois documentos. **Ir ao trecho atual** localiza o bloco em execução ou com erro. Abra **Revisar trecho** ou acione o lápis/indicador do bloco traduzido para editar; use **Anterior**/**Próximo** para navegar entre seus campos e parágrafos. Correções aceitas reaparecem no guia completo. Referências protegidas aparecem com o nome da carta, preservando os marcadores internamente. Campos desconhecidos ou blocos indivisíveis exigem tradução manual.
7. Quando todas as unidades tiverem resultados válidos, crie uma cópia independente. A cópia mantém o arquétipo, recebe novos IDs e guarda idioma e procedência. A criação não exige que todas as unidades estejam marcadas como revisadas; a interface informa quando resta revisão humana.

## Retomada e armazenamento

A revisão mostra um bloco completo, mas o aplicativo pode traduzi-lo em várias partes. Em uma lista, cada pergunta é enviada separadamente; números, quebras de linha e recuos ficam no aplicativo. Em tabelas, cada célula de prosa é enviada separadamente; separadores, alinhamento e quantidades são preservados. Blocos de código são copiados. Parágrafos longos também podem usar várias chamadas sem se dividir visualmente.

O painel **Partes internas**, na aba **Revisar trecho**, mostra o progresso dentro do bloco. Se uma parte falhar, abra esse painel e use **Traduzir somente esta parte**. **Continuar tradução** processa as partes pendentes/com erro e conserva as confirmadas. Na edição detalhada, partes pendentes aparecem no idioma original para auxiliar a correção. Na leitura **Guia completo**, elas usam indicadores de pendência. A cópia final só é liberada após a conclusão de todo o conteúdo. Você pode editar o bloco completo e aceitar uma correção manual, preservando as referências protegidas.

O esquema de dados atual é 4. Rascunhos antigos podem ser abertos e retomados: o plano interno é criado para as pendências, sem apagar os resultados confirmados. A migração utiliza as cópias de recuperação do armazenamento existente; binários anteriores ao esquema 4 não devem gravar o guia atualizado.

Cada guia pode conter até cinco registros de tradução e cada registro até 10.000 blocos/partes internas. O tamanho total serializado do guia continua limitado a 12 MiB. O pré-voo recusa um rascunho que exceda o limite. Apague rascunhos pela interface para liberar espaço. As alterações manuais são salvas automaticamente; partes aceitas são confirmadas antes da próxima chamada ao modelo.

Pausar ou fechar o editor cancela a chamada ativa e preserva as unidades já confirmadas. Ao reabrir, uma execução que estava ativa aparece como interrompida e aguarda retomada explícita. Erros podem ser repetidos por unidade. Alterações no original são detectadas pelo snapshot; o rascunho continua ligado à versão original e não incorpora mudanças automaticamente.

**Voltar ao guia** pausa uma execução ativa antes de sair da tela. **Nova tradução** prepara outra configuração sem apagar rascunhos salvos. A exclusão está dentro de **Opções do rascunho** e exige confirmação.

No desktop, guias e checkpoints ficam nos arquivos de dados do aplicativo, em `guides/` sob o diretório de usuário do SideMaster. Exportar o JSON do guia inclui os registros de tradução; importar não inicia uma geração. Uma cópia criada é um guia separado e continua disponível se o guia de origem for removido.

## Limites

O fluxo verifica metadados locais, geração textual e preservação estrutural. Isso não garante qualidade linguística. Revise cada tradução antes de publicar. Rótulos de leitura conhecidos são apresentados em inglês quando o idioma é inglês; outros idiomas usam fallback de rótulos ingleses, enquanto o conteúdo traduzido permanece como escrito.
