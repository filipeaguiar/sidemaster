# Leitura integral e tradução progressiva

Data: 2026-10-29. Escopo: comparação do guia completo na área Traduções.

## Implementação

- O documento original é o snapshot da execução, renderizado integralmente à esquerda; antes de iniciar, é o guia atual.
- A projeção à direita mostra resultados aceitos na posição editorial correspondente e indicadores para pendência, execução, erro e edição não confirmada. Partes internas aceitas podem aparecer antes de terminar seu bloco.
- A projeção não grava dados nem chama a montagem de uma cópia incompleta. Exportação/criação final conserva a validação estrita existente.
- Prefixos distintos evitam colisões entre IDs dos documentos. Herança e overrides vazios seguem o renderer de leitura.
- A configuração recolhe durante a execução. Os painéis ocupam a altura restante, com rolagem sincronizada opcional por seção e acesso à aba Revisar trecho a partir do destino.

## Verificações

`npm test`: 57 testes aprovados. Os seis casos novos verificam original integral antes de iniciar, ausência de prosa pendente no destino, aceitação estrutural, partes internas parciais, rascunhos legados, direção RTL, imutabilidade do snapshot e herança/overrides vazios.

Interface exercitada no navegador com os arquivos atuais e uma ponte desktop simulada em servidor local, armazenamento isolado por cenário e respostas de tradução conhecidas. Nenhum guia do perfil real foi modificado. Isso valida a interface; não substitui smoke nativo nem certifica qualidade linguística do modelo.

- Sem rascunho: guia completo original e destino com pendências visíveis; amostra não cria registro.
- Execução: resultados surgiram em ordem no destino a cada confirmação; configuração recolhida e original preservado.
- Pausa em 3/6 blocos, recarga e reabertura: mesmos resultados aceitos, sem geração automática. Retomada começa no primeiro bloco pendente; execução concluída em 6/6. O serviço simulado registrou no máximo uma geração simultânea e nenhum erro da interface.
- Revisão: indicador do título pendente abre seu campo na aba Revisar trecho. Correção aceita de um parágrafo reaparece no guia completo.
- Rolagem conjunta: no cenário completo, PageDown no original moveu os dois documentos até seus finais (133/123 px). Com Rolar juntos desmarcado, só o original avançou (82/0 px).
- Larguras 980×800 e 1440×900: sem overflow horizontal da página, dois painéis legíveis. A configuração pode ser reaberta pelo botão do topo.
- Captura: `translation-guide-progressive.png`, com original e destino 3/6 blocos, espaços pendentes e estado Pausada.

Uma leitura somente em memória do rascunho real com 824 blocos levou em média 14 ms para produzir a projeção HTML (cinco chamadas em Node nesta máquina), sem marcadores internos expostos. Essa medição não inclui layout/hidratação de imagens no navegador.

`openspec validate traduzir-guias-ollama --strict --json --no-interactive`: aprovado, sem issues. Os checks mais amplos já pendentes da change continuam separados desta alteração.

## Pacotes

`npm run dist:appimage-portable`: concluído. Os arquivos `translation-preview.js`, `translation-ui.js`, `reading.js`, `styles.css`, `index.html` e o ícone PNG foram comparados byte a byte com os fontes a partir do `app.asar` extraído do SquashFS do AppImage e do arquivo `app-64.7z` embutido no Portable.

| Artefato | Bytes | SHA-256 |
| --- | ---: | --- |
| SideMaster-1.0.0-x86_64.AppImage | 125491748 | 3d0c4e965312ff5f968e4cfabb55f8ab416e305e5a7943da82e95d496dea89f2 |
| SideMaster-1.0.0-Portable.exe | 110354512 | 9a89c2d402d8f57a111df448c2ea8ca7272ac61635e02467d1cbacb05f9b428b |
