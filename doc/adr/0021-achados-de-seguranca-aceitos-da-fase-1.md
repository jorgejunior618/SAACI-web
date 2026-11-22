# 0021. Achados de segurança da fase 1 do teste em produção: um fechado, três aceitos

- **Status:** Aceita
- **Data:** 22/11/2026

## Contexto

A fase 1 do teste em produção (projeto `yabqyuuilkmikdvulpxw`, verificada em 22/11/2026) devolveu
quatro avisos do Advisor do Supabase, todos de risco baixo e nenhum bloqueando a fase 2:

1. `public.sem_acento` executável por `anon` e `authenticated`. A migration `regras_dos_cursos` criou a
   função sem `revoke execute`, e função em `public` vira RPC pública por padrão.
2. `public.rls_auto_enable` (`security definer`) executável por `anon` e `authenticated`. A função é da
   plataforma, criada pelo event trigger `ensure_rls`, e não está em nenhuma migration do repositório.
   Chamada como `anon` em `/rest/v1/rpc/rls_auto_enable`, responde HTTP 400 (`0A000`, "cannot display a
   value of type event_trigger"): não devolve dado, e as tabelas do projeto já têm RLS ligado.
3. Extensão `pg_net` instalada em `public` (`limpa_comprovantes` usa `create extension if not exists
pg_net` sem `with schema`).
4. Proteção contra senha vazada desligada e poucas opções de MFA, na configuração do Auth.

## Decisão

- **`sem_acento` deixa de ser executável pela API.** A migration `fecha_sem_acento` revoga `execute` de
  `public`, `anon` e `authenticated`. A coluna gerada `cursos.nome_busca` continua preenchida, porque
  `cursos` só recebe escrita por migration, com o dono da função. O service normaliza o termo de busca
  em JS (`rules.api.ts`) e não chama a RPC. O pgTAP cobre os dois lados.
- **`rls_auto_enable` é aceito, sem mexer.** É função da plataforma, que pode recriá-la com os grants
  originais, e não há teste que prove que o `ensure_rls` continua funcionando sem o `execute`. Entra na
  lista de `security definer` conhecidos de `arquitetura.md`, marcada como da plataforma.
- **`pg_net` em `public` é aceito.** As funções da extensão ficam no schema `net`, e o aviso só diz onde
  a extensão foi registrada. A extensão normalmente não é relocável: mudar exigiria `drop extension` e
  recriar, perdendo a fila de requisições pendentes e obrigando a testar de novo o job de
  `limpar-comprovantes-orfaos`.
- **Senha vazada e MFA ficam como estão.** Configuração do Auth, não migration. A opção de senha
  vazada pode depender do plano contratado, o que não foi verificado.

## Consequências

- O Advisor deixa de listar `sem_acento`. Continuam listados `rls_auto_enable` e `pg_net`, e este
  registro é o motivo.
- Função nova em `public` segue a regra de sempre: `revoke execute` de quem não deve chamar, na mesma
  migration em que ela nasce.
- Quem operar o Supabase deve reavaliar `rls_auto_enable` e `pg_net` se o Advisor subir o nível do
  aviso ou se a plataforma passar a oferecer um caminho seguro de realocação.
- A migration só vai para produção pelo fluxo normal: PR para `dev`, CI verde, PR de produção.

## Alternativas descartadas

- **Revogar `execute` de `rls_auto_enable`.** Tira o aviso, mas pode quebrar o `ensure_rls` e a
  plataforma pode desfazer a mudança sem aviso. Sem teste que prove o contrário, o ganho não paga o
  risco.
- **Recriar `pg_net` em `extensions`.** Corrige o aviso, mas derruba a fila de requisições e exige
  reteste do agendamento da limpeza de comprovantes, por um risco que hoje é só de organização.
- **Manter `sem_acento` aberta.** Não tem uso pela API e não custa nada fechar.
