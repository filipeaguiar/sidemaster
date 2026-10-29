# Interface de traduções — revisão de 29/10/2026

## Alterações

- Configuração e rascunhos na lateral; teste e ação principal juntos no topo; revisão abaixo, com original e tradução lado a lado.
- Sequência visível Configurar → Testar um trecho → Traduzir o guia, com a razão de bloqueio escrita acima da ação.
- Rascunho com zero resultados usa Iniciar tradução. Execução parcial usa Continuar tradução. Prompt e limites ficam recolhidos nas configurações avançadas.
- A coluna de seções mostra somente título e ícone agregado, com recuo para subseções. O título do guia tem uma entrada própria. Campos e parágrafos são acessíveis por Anterior/Próximo.
- Consulta de metadados sem `verbose`, pois a resposta completa de `gemma4:latest` excedia o limite de 2 MiB ao expandir o tokenizer.
- Correções na aceitação/revisão manual e na montagem dos títulos das seções ao criar a cópia.

## Evidência coletada

`npm test`: 39 testes passaram. A suíte cobre preservação de conteúdo legado, armazenamento, renderer, referências, herança, montagem da cópia traduzida e correção manual de campos desconhecidos. Dois testes antigos de migração ainda esperavam esquema 2 e o nome anterior do backup; foram atualizados para o esquema atual sem alterar as asserções de preservação do conteúdo legado.

Conferência pelo navegador com o código real da interface servido localmente e uma ponte isolada, sem acessar os guias do perfil de produção. Persistência dessa conferência em localStorage dedicado; chamadas de Ollama reais encaminhadas pelo mesmo adaptador `electron/ollama-client.cjs` do produto. Isso valida a interface e o adaptador; não substitui smoke do executável Electron nem execução Windows.

Fluxos conferidos com serviço simulado: rascunho com zero resultados, teste que libera início, cancelamento de teste sem criar rascunho, início sem duplicar registro, pausa após um trecho confirmado, Continuar tradução, voltar ao editor durante geração, reabrir rascunho parcial, navegação, edição/revisão e criação da cópia. Não ocorreram erros JavaScript registrados na fixture. As gerações permaneceram sequenciais, com máximo observado de uma chamada ativa.

Fluxo real: Ollama 0.31.1, `gemma4:latest`, metadados 7.5B/Q4_K_M, pt-BR → en. A amostra veio do parágrafo de apresentação do guia de teste. O botão Iniciar tradução foi acionado pelo teclado e seis trechos foram concluídos. Uma referência `[Myr Enforcer]` apareceu legível na revisão, foi preservada em uma edição manual aceita e permaneceu na cópia criada. A cópia abriu no editor com títulos de seção traduzidos e dois parágrafos na subseção. Essa amostra não estabelece qualidade linguística geral do modelo.

Layout conferido em 1440 px e na largura mínima do desktop de 980 px. Em 980 px, a largura do documento permaneceu 980 px e a área principal apresentou `scrollWidth === clientWidth`, sem rolagem horizontal. Verificados foco após teste, início por Enter e controles Anterior/Próximo.

Imagens:

- [Início e amostra](translation-workspace-start.png)
- [Revisão com títulos e ícones](translation-workspace-review.png)

A validação estrita do OpenSpec passou. As verificações mais amplas de exports/PDF, falhas de disco/contexto e execução nativa Windows continuam nos itens abertos da change.

AppImage e Portable foram reconstruídos. O `app.asar` foi lido diretamente do SquashFS do AppImage e seus arquivos de interface/adaptador foram comparados byte a byte com os fontes atuais; a mesma comparação passou para o pacote Windows descompactado. AppImage SHA-256: `8d8fea60bb9293199c4ca54370df9eb2f33a73719ee3c56de7471a76b5e67266`. Portable SHA-256: `31aeeee6c7086120dfc47f7e58d6e74eaa687b6ba411726d90b772e121f74988`.
