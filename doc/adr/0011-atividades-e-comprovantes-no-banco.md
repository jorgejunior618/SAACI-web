# 0011. Atividades e comprovantes no Supabase, com o comprovante garantido pelo banco

- **Status:** Proposta
- **Data:** 19/11/2026

## Contexto

As atividades e os comprovantes saem do mock e vão para o Supabase (issue #20). A
`modelagem-dados.md` já fixava o desenho geral: o arquivo sobe primeiro, uma RPC grava a atividade, o
hash não é `unique` (RF42) e o arquivo que sobra é limpo por rotina agendada. Faltava decidir:

- Como a atividade aponta para o item da regra (`itens_curso` tem `unique (curso_id, numero)`).
- Onde garantir que não existe atividade sem comprovante (RNF24). Conferir só no service deixaria um
  `insert` direto pelo PostgREST gravar atividade sem arquivo.
- Como apagar o arquivo que sobra. O Storage recusa `delete` direto em `storage.objects`, e apagar a
  linha por SQL deixaria o arquivo no disco. `arquitetura.md` mandava agendamento para Route Handler
  com Cron, e a ADR 0006 deixou como pendência os arquivos de conta apagada.
- O que fazer com as regras que o contrato atual das telas não cumpre, já que a issue proíbe mexer
  em tela.

## Decisão

- **FK composta para o item.** `atividades` guarda `curso_id` e `item_numero`, com
  `foreign key (curso_id, item_numero) references itens_curso (curso_id, numero)`. O gatilho
  `prepara_atividade` copia o `curso_id` do perfil, e o navegador não o informa. A trava de RF10
  impede o curso do perfil de mudar depois.
- **RNF24 no banco.** O mesmo gatilho (`before insert`) recusa a atividade cujo arquivo não está no
  bucket (SQLSTATE `SA024`) ou está na pasta de outro aluno (`42501`). Ele também copia tamanho e
  tipo do `metadata` do Storage, e o navegador não os informa. A RPC `registrar_atividade` é
  `security invoker` e só faz o `insert`. Os privilégios são por coluna: no `insert`, o aluno não
  escolhe dono, curso, tamanho nem tipo; no `update`, não troca o comprovante.
- **Hash SHA-256 calculado no navegador**, em hexadecimal, com índice comum em
  `(aluno_id, comprovante_hash)`. O banco só confere o formato.
- **Registrar:** upload em `<aluno>/<uuid>.<ext>` com `upsert: false`, depois a RPC. Se a RPC falhar,
  o service apaga o arquivo na hora (melhor esforço) e repassa o erro.
- **Remover:** a linha sai primeiro e o arquivo depois. A ordem inversa deixaria uma atividade sem
  comprovante se a segunda parte falhasse.
- **Limpeza por Edge Function chamada pelo `pg_cron`.** A função SQL `comprovantes_orfaos` só lista
  os arquivos sem atividade mais velhos que a folga (1 hora, para não apagar um registro em
  andamento). Ela é `security invoker`, e só a `service_role` a executa. A Edge Function
  `limpa-comprovantes` (`supabase/functions/`) apaga pela API do Storage, com a chave secret do
  ambiente dela. O `pg_cron` a chama de hora em hora por `pg_net`. A URL e o segredo ficam no Vault,
  e o segredo também no ambiente da função; nenhum vai para o repositório. A mesma rotina apaga os
  arquivos de conta apagada (RF33), porque o cascade já tirou as atividades dela.
- **Exceções nomeadas**, porque o contrato das telas não muda nesta issue:
  - `removeActivity(id)` não leva `updated_at` no `WHERE`. A tela de detalhe só envia o id, e remover
    é a intenção de apagar a versão que estiver lá.
  - `removeActivity` não lança quando só a remoção do arquivo falha. A atividade já saiu, e lançar
    diria ao aluno que nada aconteceu. A rotina de limpeza apaga o arquivo.
  - `createActivity(input)` não recebe o cliente `db`. O upload de `File` só acontece no navegador, e
    a tela passa a função direto ao `mutationFn`, que mandaria o contexto da mutation no lugar do
    cliente.
- **Sem trava de data futura no banco.** A `modelagem-dados.md` previa o `check`, mas o formulário
  não barra data futura: o banco devolveria um erro que a tela não traduz. Ela entra junto com a
  regra na tela, numa issue própria.
- **A leitura fingida do comprovante** sai do mock de dados e vai para
  `activities.proof-reading.mock.ts`, que a #22 apaga.
- **Sem seed de atividades.** Um seed por SQL criaria atividade sem arquivo no bucket.

## Consequências

- RNF24 vale mesmo para quem escrever direto pelo PostgREST, e RF10 passa a agir de verdade.
- `supabase/functions/` é pasta nova, em Deno. Fica fora do `tsconfig.json` e do ESLint, e não há
  `deno check` no projeto: quem valida é o runtime local (`supabase functions serve`).
- O ambiente local precisa de `supabase/functions/.env` e de dois segredos no Vault para a rotina
  rodar. O `db:reset` apaga o Vault (README, seção "Limpeza dos comprovantes"). Em produção, o
  deploy da função e os segredos entram com a #40.
- `arquitetura.md` troca "Route Handler + Cron" por "Edge Function + `pg_cron`" para agendamento que
  apaga arquivo, e ganha as três exceções. `modelagem-dados.md`, `rls-e-permissoes.md`,
  `estrutura-pastas.md` e `camada-servicos.md` mudam neste commit.
- O teste de integração usa o `File`, o `Blob` e o `FormData` do Node. O `fetch` do Node não
  reconhece os do jsdom.
- As horas continuam no cálculo em TS até a #21, que leva a conta para o banco.

## Alternativas descartadas

- **Conferir o arquivo só no service.** Um `insert` direto criaria atividade sem comprovante.
- **FK para `itens_curso.id`.** Registrar e corrigir teriam de traduzir número em id, e corrigir
  viraria RPC.
- **Só `item_numero`, sem FK.** Uma correção poderia gravar item que não existe na matriz.
- **Limpeza só em SQL.** O Storage recusa o `delete` direto, e liberar com
  `storage.allow_delete_query` apagaria a linha e deixaria o arquivo no disco.
- **Route Handler + Cron da Vercel.** Depende da hospedagem do front e põe a chave secret no servidor
  do Next, para um trabalho que é só do Supabase.
- **`security definer` em `comprovantes_orfaos`.** Desnecessário: a `service_role` já enxerga tudo.
- **Mudar `removeActivity` e `createActivity` para o formato das outras funções.** Exigiria mudar a
  tela, que a issue proíbe.
