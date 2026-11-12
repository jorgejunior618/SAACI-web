# RLS e permissões

> Alvo (Supabase): só a seção Storage está implementada (ADR 0004). O resto vale como regra para quem
> escrever a próxima migration.

Autorização é decidida no banco. O front esconde botão por conveniência de UX, nunca como barreira
(RNF04). O SAACI tem um papel só, o aluno, dono do que registra. Não há papel de coordenação no MVP;
se aparecer, muda o alcance de todas as tabelas de uma vez e pede uma ADR.

## Quem chama

A identidade vem de `auth.uid()`, que lê o `sub` do JWT já verificado. Não há função de contexto
própria nem consulta ao perfil dentro de policy. Uma policy que consultasse a própria tabela entraria
em recursão infinita (`infinite recursion detected in policy`), o erro mais citado sobre RLS; lendo o
dono direto de `auth.uid()`, não há ciclo para quebrar.

Toda comparação usa a função dentro de um `(select ...)`, nunca solta:

```sql
using (aluno_id = (select auth.uid()))   -- ✅ calculado 1x (InitPlan)
using (aluno_id = auth.uid())            -- ❌ reavaliado por linha
```

Sem sessão, `auth.uid()` devolve `null`, e `coluna = null` nunca é verdadeiro em SQL: o estado
degradado é negar, por construção. O bloqueio do `src/proxy.ts` é fronteira de navegação, não de
segurança. A fronteira real é esta.

## Padrão por tipo de tabela

| Tipo de tabela             | Policy                                                                         |
| -------------------------- | ------------------------------------------------------------------------------ |
| Do aluno (atividades)      | dono = `(select auth.uid())` em todos os comandos, com `with check` na escrita |
| Cadastro (cursos e regras) | `select` para `authenticated`; sem policy de escrita, só migration altera      |
| Arquivo (Storage)          | pasta do dono: `(storage.foldername(name))[1] = (select auth.uid())::text`     |

**Referência cruzada.** Uma chave estrangeira garante que a linha existe, não que é do mesmo aluno:
quem souber o UUID de uma atividade alheia a referenciaria. O `with check` confere o dono da linha
referenciada:

```sql
with check (
  aluno_id = (select auth.uid())
  and exists (select 1 from atividades a where a.id = atividade_id and a.aluno_id = (select auth.uid()))
)
```

**Storage.** O bucket é privado e a tela abre o arquivo por URL assinada de vida curta (RNF04). O
buraco típico é um `select` sem a condição de pasta, que deixaria qualquer aluno logado listar os
arquivos de todos.

O bucket `comprovantes` nasce em migration, com o limite de tamanho e os tipos de arquivo no próprio
bucket (ADR 0004). Há policy de `select`, `insert` e `delete` na pasta do dono e **nenhuma de
`update`**: o comprovante não se troca, e sem `update` o `upsert` também é recusado. Nunca se pede
URL pública (`getPublicUrl`). O `delete` direto em `storage.objects` é barrado pelo Storage, que só
libera com `storage.allow_delete_query = 'true'`, como a API faz; o teste liga esse ajuste.

## Regras

- Toda tabela tem RLS habilitado. Tabela sem policy fica inacessível, não liberada.
- Policy por comando quando ler e gravar diferem; única só quando são idênticas.
- Tabela nova nasce com RLS e policy na mesma migration.
- `UPDATE`/`DELETE` só alcança uma linha se ela também passar por uma policy de `select`. Sem ela, o
  comando afeta zero linhas **em silêncio**. Ao escrever policy de escrita, confira a leitura.
- RPC é `security invoker`, então o RLS de quem chamou continua valendo. `security definer` só nas
  registradas em `arquitetura.md` (a limpeza de contas não confirmadas e `apagar_minha_conta`). Outra
  RPC que precisar entra lá por nome, lê `auth.uid()` em vez de receber o dono por parâmetro e
  devolve o mínimo (a ausência de policy de `select` não protege o retorno).
- Nenhuma chave `service_role` em código que o navegador alcança. Travado por lint e por um teste de
  repositório (`tests/*.test.ts`).

## Cadastro e confirmação de e-mail

O SAACI tem **autocadastro** (RF01). O risco não é "alguém criou conta", é "alguém criou conta com
e-mail que não é do IFCE".

- **Domínio institucional (RF02) é barrado no servidor**, por Auth Hook de antes da criação do
  usuário (`before_user_created`, 403 no cadastro) e por gatilho em `auth.users` (barra a troca de
  e-mail depois do cadastro, que o hook não vê). Validar só na tela não conta: a chave `anon` é
  pública e o `/auth/v1/signup` aceita chamada direta (ADR 0003).

  ```bash
  curl -X POST .../auth/v1/signup -H "apikey: <anon>" \
    -d '{"email":"qualquer@gmail.com","password":"..."}'   # precisa falhar
  ```

- **Confirmação de e-mail ligada** (`enable_confirmations = true`, RF03 e RF04). O login de conta não
  confirmada falha com `email_not_confirmed`, que o service traduz e a tela leva à verificação
  (RF05, RF39).
- **Duas flags de nome parecido.** `[auth] enable_signup` abre o signup público: fica **ligada**, com o
  domínio barrado pelo hook. `[auth.email] enable_signup` desliga o provider de e-mail inteiro: em
  `false` derruba o login (`email_provider_disabled`).
- **A config é uma linha invisível em code review** e volta ao padrão num projeto criado do zero. Um
  teste de integração tenta cadastrar um e-mail de fora do IFCE (precisa falhar) e um do IFCE
  (precisa criar). Confira isso ao criar o projeto de produção.
- Links de confirmação e de redefinição valem 1 hora e têm uso único (RNF03), configurados no Auth
  (`otp_expiry`, um valor só para os dois). A senha é guardada com hash e salt pelo Supabase (RNF01); o SAACI nunca a vê.
- Em aberto: corrigir o e-mail de uma conta não confirmada (RF40) quando ela não tem sessão.

## Apagar a conta

Apagar o usuário do Auth exige o dono do schema ou a chave `service_role`, que **ignora RLS por
completo**. O SAACI usa o primeiro caminho (ADR 0006): a RPC `apagar_minha_conta` é `security definer`,
lê `auth.uid()`, não recebe o dono por parâmetro e devolve só quantas contas apagou. Só `authenticated`
a executa.

O service `deleteAccount` pede a senha de novo e a confere com `signInWithPassword` antes de chamar a
RPC (RF33). Essa confirmação é UX contra clique acidental e aparelho emprestado: o servidor não a
exige, porque quem tem sessão válida já é o dono do dado (RNF04). Perfil e atividades saem em cascata,
e os arquivos do Storage por rotina agendada (`modelagem-dados.md`).

Não há Route Handler `DELETE /api/conta` nem cliente admin, e a `service_role` segue fora do projeto.
Se um dia apagar a conta precisar dela, o cliente admin fica atrás de `import 'server-only'` e nasce
com uma ADR nova.
