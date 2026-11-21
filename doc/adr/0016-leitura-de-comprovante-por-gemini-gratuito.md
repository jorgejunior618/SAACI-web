# 0016. O comprovante é lido pelo Gemini Flash, na camada gratuita, atrás de um Route Handler com limite diário por aluno

- **Status:** Aceita
- **Data:** 21/11/2026

## Contexto

`readProof` devolve hoje uma leitura fingida (`suggestFromFile`, só olha o nome do arquivo). O RF41
pede um serviço de IA de verdade, e `doc/arquitetura.md` manda chamá-lo por um Route Handler, para a
chave nunca chegar ao navegador. `doc/tecnologia.md` marcava a escolha como pendente, a decidir com o
produto e a LGPD (RNF26).

O critério da decisão é o menor custo. O comprovante pode trazer dado pessoal (nome, CPF), e a camada
gratuita do Gemini permite ao Google usar o conteúdo enviado para melhorar os produtos dele. A decisão
de aceitar isso foi do dev, a ser confirmada pelo time antes do merge, como pede a issue #22.

## Decisão

- **Provedor:** Gemini, na camada gratuita, em desenvolvimento e em produção. Custo zero. O modelo
  padrão é o `gemini-3.1-flash-lite`, que a página de preços do Google lista com camada gratuita e que
  leu certo os dois comprovantes de teste (cerca de 1.200 tokens por leitura). `GEMINI_MODEL` troca
  o modelo sem mexer no código. Quem decide se é grátis é o projeto da chave, sem faturamento ativo.
- **Chamada:** `fetch` direto da API do Google, a partir de um Route Handler (`app/api/` é só para
  segredo). Sem SDK novo. A chave (`GEMINI_API_KEY`) fica no servidor.
- **O que sai do servidor:** só o arquivo do comprovante. Nome, e-mail e identificador do aluno não
  entram no pedido. O sistema não grava o arquivo nem a resposta da IA: a leitura só sugere, e o
  registro continua passando pelo formulário.
- **Limite por aluno:** 10 leituras nas últimas 24 h e 3 no último minuto, contadas em
  `leituras_comprovante` pela função `reservar_leitura_comprovante` (RLS, sem `update` nem `delete`).
  O limite do minuto existe porque a cota gratuita do Google vale para o projeto todo: sem ele, um
  aluno gastaria as 10 leituras de uma vez e esgotaria a cota de todos. A leitura é reservada antes da
  chamada, então a que falha também conta, e isso protege a cota global.
- **Origem da requisição:** o Route Handler só aceita POST cujo `Origin` é o do próprio site. Route
  Handler não tem a checagem de origem que o Server Action tem.
- **Arquivo conferido antes de gastar cota.** Além do tipo e do tamanho (10 MB), os primeiros bytes
  precisam ser os do tipo declarado (PDF, PNG ou JPEG), porque o tipo vem do navegador. Arquivo que não
  é o que diz ser é recusado antes da reserva e da chamada ao Google. PDF com mais de 4 páginas,
  corrompido ou criptografado também é recusado, depois da reserva: abrir o PDF custa CPU, e quem chega
  aí já tem sessão e cota. Comprovante tem 1 ou 2 páginas, e página a mais é custo sem ganho.
- **Resposta com teto.** A chamada pede `maxOutputTokens` de 512 (o JSON ocupa cerca de 80), e nome
  sugerido com mais de 200 caracteres vira `null`. O item e a quantidade vêm na unidade de cada item
  do curso, que o pedido leva ao lado do nome.
- **Falha, limite ou cota do Google esgotada** viram `UnreadableProofError`. A tela deixa preencher à
  mão, e nenhuma tela muda.
- **Tempo:** a chamada ao Google tem timeout de cerca de 18 s, dentro dos 20 s da tela.
- **Aprovação:** o time aprovou em 21/11/2026 o envio do comprovante ao Google na camada gratuita
  (RNF26). O aviso de privacidade cita o Google e diz que ele pode usar o conteúdo enviado.

## Consequências

- Custo de IA zero, nenhuma dependência nova no `package.json` e uma tabela nova com RLS.
- **Risco de privacidade:** o Google pode usar o comprovante para melhorar produtos. Se o time
  recusar, o caminho é a camada paga ou outro provedor. Só muda o `fetch` e a chave, porque o
  contrato com o service (`ProofSuggestion`) não depende do provedor.
- **Cota global:** a camada gratuita tem limite de requisições por minuto e por dia, que vale para o
  projeto todo e não para o aluno. Com muitos alunos, ela acaba antes do limite individual. A
  leitura falha e o aluno preenche à mão. Os valores da cota não foram conferidos para o modelo em uso.
- **O limite de páginas é proteção de custo, não de segurança.** Ele barra o arquivo grande enviado por
  engano. Um PDF montado para enganar o contador de páginas passa, e o teto de 10 MB e o limite por
  aluno continuam sendo a defesa. Injeção de prompt no documento só consegue sugerir um valor que o aluno
  já poderia digitar: as horas saem do cálculo único, e o aluno confere na tela.
- **PDF criptografado vai para o preenchimento manual**, mesmo que o Gemini conseguisse lê-lo. Abrir
  com `ignoreEncryption` não foi adotado porque a contagem de páginas de um PDF assim não foi
  verificada. Se isso aparecer na prática, reavalie com um arquivo real.
- **O teto de 512 tokens depende do modelo.** Com o `flash-lite` o raciocínio é 0. Um modelo que
  raciocina por padrão gasta parte do teto, e a resposta pode vir cortada. Ao trocar `GEMINI_MODEL`,
  confira que a leitura continua voltando.
- A tabela cresce uma linha por leitura. Cada linha é apagada com a conta do aluno (`on delete cascade`).
  Limpar as antigas fica para quando o volume pedir.
- O erro de limite não diz "limite do dia": a mensagem é a de leitura que falhou. Uma mensagem própria
  exigiria mexer na tela, fora do escopo da #22.
- A tabela `leituras_comprovante` não tem `updated_at`, exceção à convenção de auditoria: a linha
  nunca muda. `doc/modelagem-dados.md`, `doc/estrutura-pastas.md` e `doc/camada-servicos.md` registram
  a tabela, a pasta `app/api/` e o arquivo `<dom>.<tema>.server.ts`.
- Quem contribui: `GEMINI_API_KEY` entra no `.env.example` e nunca no navegador (sem `NEXT_PUBLIC_`).

## Alternativas descartadas

- **Claude Haiku 5.5, API paga.** Custa cerca de US$0,00025 por leitura, é mais barato por leitura que
  o Gemini pago e traz menos risco para o RNF26. Ficou de fora porque o critério foi custo zero.
- **Gemini Flash, camada paga.** Evita o uso do conteúdo pelo Google na maioria das versões, mas custa
  e a página de preços diverge para o modelo mais novo. É o primeiro passo se o time recusar a gratuita.
- **OCR local (Tesseract).** Sem custo e sem dado saindo do servidor, mas extrai item, nome e datas com
  qualidade pior, e o prazo de 20 s pode estourar em PDF grande.
- **Contador em memória no servidor.** Zera a cada instância em ambiente serverless e não limita nada.
