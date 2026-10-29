## 1. Persistência do catálogo

- [x] 1.1 Criar um repositório IndexedDB versionado para resultados positivos e estados de falha, com fallback seguro para memória se o banco não estiver disponível.
- [x] 1.2 Normalizar a chave pelo nome consultado, preservando aliases em português e inglês ligados à mesma identidade Oracle.

## 2. Resolução e atualização de cartas

- [x] 2.1 Integrar `findCard` com leitura cache-first e gravação de respostas positivas, `notfound` e `error`, preservando o texto editável e a distinção dos estados.
- [x] 2.2 Reutilizar resultados positivos por 24 horas; depois, manter identidade e imagem enquanto atualiza e sinalizar legalidade pendente até resposta atual bem-sucedida.
- [x] 2.3 Preservar a fila com intervalo mínimo de 110 ms e impedir retry automático de `429`, falhas de rede e `5xx` para o mesmo nome.

## 3. Prévia e compatibilidade

- [x] 3.1 Manter imagens como URLs remotas, permitir que o navegador use seu cache HTTP e garantir que a ação de recarga visual não ignore entradas locais nem repita falhas.
- [x] 3.2 Exercitar no navegador reload com cache positivo, entrada positiva expirada, falha persistida, edição do nome e indisponibilidade do IndexedDB; confirmar que edição e exportação continuam acessíveis.
- [x] 3.3 Baixar e armazenar Blobs das imagens (normal e art_crop) no IndexedDB ao acionar a recarga de imagens para as cartas do guia ainda não baixadas, exibindo-as via Object URL.
