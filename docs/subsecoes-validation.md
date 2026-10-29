# Verificação — subseções do editor

Data: 28/10/2026. Change: `adicionar-subsecoes-editor`.

## Implementado

- Esquema v2 com nós recursivos, Markdown independente e tipos de conteúdo.
- Migração de seções e matchups v1, preservando ids e campos; backup original em `sidemaster.guides.v1.backup-before-hierarchy` antes da primeira escrita no novo formato.
- Sumário recolhível, breadcrumb, editor individual, adição contextual e gerenciamento.
- Renomear, duplicar com novos ids, mover para destinos compatíveis e reordenar entre irmãos.
- Excluir com opção de preservar filhos compatíveis, e desfazer alterações estruturais durante a sessão.
- Mãos gerais e de confronto com sete imagens individuais; variantes com personalização explícita por campo.
- Documento de leitura compartilhado por prévia, HTML, Patreon e impressão; exportação/importação JSON v2 com migração v1.
- Recuperação do guia e item selecionados após recarregar.

## Verificações executadas

- `node --test tests/hierarchy.test.mjs`: 7 testes passaram. Cobrem migração, round-trip JSON, herança vazia explícita, ciclos, destinos incompatíveis, cópia independente, exclusão/preservação, validação de mãos e backup local.
- Verificação sintática dos módulos novos/alterados.
- `openspec validate adicionar-subsecoes-editor --strict --json --no-interactive`: passou.
- Navegador real: quatro guias anteriores abriram com os textos e listas; criado um quinto guia chamado `Guia de demonstração — subseções`, no grupo `Demonstração`, versão `Subseções`.
- UI: criar mão geral, duplicar, renomear, mover a duplicata para UB Faeries, definir Draw/Pós-side, editar plano geral e personalizar apenas estratégia da variante Sneaky Snacker.
- UI: reordenar Sobre o deck e desfazer; recolher/expandir sem alterar a seleção; recarregar e recuperar a mão selecionada e o breadcrumb.
- Verificação DOM: 14 imagens carregadas nos dois exemplos, sete por faixa com coordenada vertical igual.
- Downloads reais HTML, HTML Patreon e JSON inspecionados. Ambos os HTML contêm mãos, confronto, plano e variante; HTML inclui 14 imagens. Fragmento Patreon sem scripts, estilos, classes ou atributos de dados. JSON contém cinco guias no esquema v2 e o conteúdo original do primeiro guia.
- Console do navegador: nenhum erro na inspeção final.
- Captura visual: `docs/subsecoes-editor.png`.

## Limites da verificação

- Impressão usa o mesmo HTML completo verificado; não foi gerado/inspecionado um novo PDF nesta mudança.
- Importação foi verificada por normalização e round-trip do arquivo, sem inserir cópias adicionais pela UI.
- Exclusão foi verificada no modelo usado pela UI, sem apagar dados do navegador durante a demonstração.
- Arrastar e soltar não foi implementado; reordenação e movimentação estão nos botões de gerenciamento.

## Correção posterior — imagens das mãos

- Campo de cartas aceita `2 [Myr Enforcer]`, `2 ![Myr Enforcer]` e nomes sem colchetes, mantendo as quantidades.
- A política de repetição foi posteriormente substituída pela regra de edição descrita abaixo. Falha de download da imagem conserva um marcador com o nome da carta.
- `node --test tests/*.test.mjs`: 11 testes passaram, incluindo recuperação de rede, throttling e erro no endpoint de fallback.
- Navegador integrado: sintaxe com `!` produziu 14 imagens carregadas nos dois exemplos; texto original do guia de demonstração foi restaurado. Botão de recarregar exercitado. O Firefox do usuário não está disponível para automação nesta sessão.

## Política de consultas após falha

- Falhas de rede/HTTP e nomes não encontrados permanecem no cache da sessão, assim como os resultados encontrados. Alterações em outros campos não repetem esses endpoints.
- Não há retry automático para 429/5xx nem botão de limpar o cache de consultas.
- Um nome normalizado diferente cria uma consulta diferente; espaços externos e diferenças de maiúsculas não provocam uma nova chamada.
- A hidratação da prévia espera 750 ms após a última alteração. Digitação consecutiva reinicia o intervalo; o salvamento e o texto da prévia continuam independentes dessa pausa.
- A resolução inicial mantém a busca alternativa de nomes após 404, cada endpoint usado uma única vez por nome na sessão.
- `node --test tests/*.test.mjs`: 13 testes passaram, incluindo falha em cache, ausência de retry, nomes não encontrados e uma única consulta após edições rápidas.
