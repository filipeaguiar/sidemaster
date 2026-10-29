# Blocos visuais e partes internas — 29/10/2026

## Comportamento implementado

O bloco completo permanece na revisão. O plano interno mantém numeração, marcadores, recuos, quebras de linha e separadores fora das chamadas ao modelo; itens/células de prosa são enviados individualmente. Código cercado, inclusive com linhas vazias e cerca final ausente, é copiado. Parágrafos longos usam partes limitadas e remontagem por intervalos. Referências inline continuam sendo verificadas.

Cada parte tem estado e resultado persistidos antes da próxima chamada. O painel Partes internas identifica falhas e permite repetição isolada. Retomar conserva as partes aceitas. Conteúdo parcial é mostrado no bloco com as partes pendentes ainda no idioma original e não libera a cópia. Uma correção humana aceita encerra o plano automático daquele bloco.

O esquema 4 valida versões, intervalos e estados das partes. Rascunhos dos esquemas anteriores conservam fonte, IDs e traduções confirmadas; blocos pendentes/com erro recebem o plano ao retomar. A versão do esquema não participa da comparação editorial. A gravação atômica mantém o backup anterior válido.

## Verificações

`npm test`: 51 testes passaram. As novas regressões exercitam o caso das três perguntas, modelo sem acesso à numeração/quebras, falha na segunda parte, checkpoint JSON, repetição isolada, retomada, pausa, erro de disco, listas aninhadas, CRLF, RTL, tabelas, código, parágrafo longo, migração do esquema 3 e rejeição de planos inválidos/futuros. Respostas que acrescentam marcadores, novas linhas ou colunas dentro de uma parte são recusadas.

Conferência da interface em fixture isolada que serve o código real do produto, com armazenamento dedicado e serviço simulado: um rascunho legado tinha quatro blocos aceitos e a lista com erro. A retomada confirmou a primeira pergunta e encontrou uma falha simulada na segunda. O painel mostrou 1/3 concluídas e identificou somente a segunda parte como erro. Repetir essa parte produziu 2/3. Após recarregar a página, as duas partes continuaram salvas; Continuar tradução enviou apenas a terceira. A cópia abriu no editor com a lista remontada. A coluna de navegação continuou mostrando somente títulos e ícones.

![Bloco único e painel de partes](translation-block-segments.png)

## Ollama real

Foi usada uma cópia em memória do bloco que falhou em Sobre o deck / Mãos Iniciais e Mulligan, sem gravar resultados na biblioteca do usuário. Ollama 0.31.1 e `gemma4:latest`, pt-BR → en, três chamadas sequenciais pelo adaptador do produto. Todas receberam somente a pergunta, sem numeração nem quebras estruturais. O bloco final passou na validação e conservou exatamente `1. `, `2. `, `3.` (sem espaço, como na origem) e as duas quebras de linha.

Esse teste comprova a preservação estrutural desse bloco. A segunda pergunta ainda apresentou interpretação literal do termo de jogo “comprar terreno”, portanto revisão de terminologia continua necessária; não foi estabelecida qualidade linguística geral do modelo.

## Medição do guia completo

Inventário do guia de referência com limite de 1.200 caracteres: 824 blocos de revisão e 796 partes de prosa; maior parte com 1.200 caracteres. O arquivo existente tinha 1.566.947 bytes; a projeção com um registro adicional e seus planos tinha 3.523.056 bytes, abaixo do teto de 12.582.912 bytes. A medição não inclui todas as saídas futuras de tradução; pré-voo e limite real a cada checkpoint continuam ativos. Nenhum limite foi aumentado.

A execução desta conferência de interface não substitui smoke nativo Electron, export/PDF completo nem execução Windows. Esses itens mais amplos continuam identificados na change.

## Pacotes

AppImage e Portable reconstruídos. O `app.asar` lido diretamente do SquashFS do AppImage e o `app.asar` do diretório Windows foram comparados byte a byte com os fontes atuais, incluindo o novo `translation-segments.js`, interface, modelo 4 e validação do armazenamento. SHA-256 AppImage: `f9c0623f92f1d1468acf542f91cc95dc97482077916049bf45b1b454d1ba4c09`. SHA-256 Portable: `20b34e227b5cf44e6184661e83a30dab679f0251d40a03bd3d38e9a8f95c8ebb`.
