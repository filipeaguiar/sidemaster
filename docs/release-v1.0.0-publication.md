# Publicação do SideMaster Desktop 1.0.0

Data: 2026-10-29.

Repositório: https://github.com/filipeaguiar/sidemaster
Release: https://github.com/filipeaguiar/sidemaster/releases/tag/v1.0.0

A visibilidade foi alterada de privada para pública após autorização expressa do usuário para disponibilizar código e histórico. Antes da alteração, foram examinados oito commits e 60 blobs históricos por padrões de credenciais, sem correspondências nos padrões usados. Essa checagem é limitada a padrões, não uma certificação de ausência de dados sensíveis.

Os arquivos foram enviados primeiro a um rascunho pelo gh. A release foi publicada como versão estável/latest com os seguintes anexos:

| Arquivo | Bytes | SHA-256 |
| --- | ---: | --- |
| SideMaster-1.0.0-Portable.exe | 110355931 | e09f1ae13997feaadd988642d2394c0ab0f27320aadb0f28c0c189af75933a8a |
| SideMaster-1.0.0-x86_64.AppImage | 125491778 | 395e1f4ba13c955b3c1c33592fbf474b4d002741284b5388dcba0853880a50d2 |
| SideMaster-1.0.0-SHA256SUMS.txt | 195 | fe2c47189c953a966d06e32851fc0337c4f5f641ff7266f1bd228e6f2aae38c8 |

Os digests informados pela API GitHub corresponderam aos arquivos locais. Downloads públicos dos dois executáveis retornaram HTTP 200 em chamadas HEAD com redirects; o manifesto foi baixado sem autenticação e comparado byte a byte com o original.

Na publicação inicial, o repositório remoto ainda continha a edição Nuxt. Em seguida, o usuário autorizou substituí-la pela edição desktop local. A sincronização atualiza a árvore de `main`, preserva os commits anteriores e alinha a tag `v1.0.0` à edição desktop para que os arquivos automáticos de código-fonte correspondam à aplicação distribuída. Os arquivos pessoais e materiais de referência permanecem fora do Git. Não há criação de PR.
