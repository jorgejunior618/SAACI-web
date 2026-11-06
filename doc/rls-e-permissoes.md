# RLS e permissões

> Alvo (Supabase): nada deste documento está implementado. Valem como regra desde já para quem
> escrever a primeira migration.

Autorização é decidida no banco. O front esconde botão por conveniência de UX, nunca como barreira
(RNF04).

## Quem chama

Toda policy precisa saber quem chamou. No SAACI existe um papel só, o aluno, e a identidade vem de
`auth.uid()`, que lê o `sub` do JWT já verificado na assinatura. Não há função de contexto própria,
nem claim customizada, nem consulta a `perfis` dentro de policy.

**Por que isso importa mais do que parece.** Uma policy sobre `perfis` que consultasse a própria
`perfis` entraria em recursão infinita (`infinite recursion detected in policy for relation
"perfis"`), o erro mais citado sobre RLS no Postgres. A saída clássica é marcar uma função como
`security definer` (roda com privilégio elevado, ignora RLS, quebra o ciclo). Aqui isso não é
necessário: lendo o dono direto de `auth.uid()`, não existe ciclo para quebrar.

Toda comparação usa a função dentro de um `(select ...)`, nunca solta:

```sql
using (aluno_id = (select auth.uid()))   -- ✅ calculado 1x, InitPlan
using (aluno_id = auth.uid())            -- ❌ reavaliado por linha
```

Sem sessão, `auth.uid()` devolve `null`. Em SQL, `coluna = null` nunca é verdadeiro: o estado
degradado do sistema é negar, por construção. Isso fecha, sem policy extra, o acesso direto pela API
do PostgREST por quem não tem sessão. O bloqueio do `src/proxy.ts` é fronteira de navegação, não de
segurança. A fronteira real é esta.

## Padrão por tipo de tabela

| Tipo de tabela                      | Policy                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| Do aluno (`atividades`)             | `aluno_id = (select auth.uid())` em todos os comandos, com `with check` na escrita |
| Cadastro (`cursos`, `regras_curso`) | `select` para `authenticated`; sem policy de escrita, só migration altera          |
| Arquivo (Storage)                   | pasta do dono: `(storage.foldername(name))[1] = (select auth.uid())::text`         |

### Referência cruzada

Uma chave estrangeira garante que a linha referenciada existe, não que ela é do mesmo aluno. Um
`atividade_id` de A pode apontar, por FK, para uma atividade de B se alguém souber o UUID. O
`with check` de escrita sempre confere isso explicitamente:

```sql
with check (
  aluno_id = (select auth.uid())
  and exists (
    select 1 from atividades a
    where a.id = atividade_id and a.aluno_id = (select auth.uid())
  )
)
```

Vale para toda FK que aponte para uma tabela com dono: o comprovante aponta para a atividade, e a
atividade aponta para um tipo que precisa ser de **uma matriz do curso do aluno**, não de qualquer
curso.

### Arquivos do Storage

O comprovante nunca fica em endereço público (RNF04). O bucket é privado, e a policy de `storage.objects`
só deixa o dono ler, gravar e apagar dentro da pasta com o próprio `uid`. A tela abre o arquivo por URL
assinada de vida curta. Policy de bucket é policy de tabela como qualquer outra: o buraco típico é um
`select` sem a condição de pasta, que deixaria qualquer aluno logado listar os arquivos de todos.

## Papéis

|                                            | Aluno                  | Quem opera o projeto (Studio) |
| ------------------------------------------ | ---------------------- | ----------------------------- |
| Registrar e remover atividade (RF13, RF17) | sim, as suas           | tudo, ignora RLS              |
| Ler regras e cursos                        | sim                    | sim                           |
| Alterar regras e cursos                    | não                    | por migration                 |
| Ler ou alterar dado de outro aluno         | **nunca**              | só pelo Studio, com motivo    |
| Apagar a própria conta (RF33)              | sim, via Route Handler | —                             |

Não há papel de coordenação no MVP. Se ele aparecer, é decisão nova a registrar, porque muda o alcance de todas
as tabelas de uma vez.

## Regras

- Toda tabela tem RLS habilitado. Tabela sem policy fica inacessível, não liberada.
- Policy por comando quando ler e gravar têm permissões diferentes; policy única só quando são
  idênticas.
- Tabela nova nasce com RLS e policy na mesma migration.
- Nenhuma chave de serviço (`service_role`) é usada em código que o usuário alcança. Travado por lint
  e por um teste de repositório (`tests/*.test.ts`).
- `UPDATE`/`DELETE` só alcança uma linha se ela também passar por uma policy de `select` aplicável
  ao papel. Sem select cobrindo, o comando não lança erro: afeta zero linhas em silêncio. Ao escrever
  policy de escrita, confira que existe leitura no mesmo escopo (`testes.md`).
- RPC roda como `security invoker` e continua sujeita às policies, com a única classe de exceção
  abaixo, nomeada e nunca ad-hoc.

## A exceção `security definer`

Nenhuma hoje. Se uma RPC precisar, ela entra em `arquitetura.md`, "Exceções nomeadas", **por nome**,
antes de ser escrita, e cumpre as três obrigações abaixo. Uma exceção que ninguém consegue enumerar
já virou regra.

**O que a exceção custa.** Com o RLS desligado dentro da função, a checagem de dono vira código à
mão. As três obrigações, todas cobertas por teste:

| Obrigação                                       | O que acontece sem ela                                            |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| `aluno_id = auth.uid()` em toda consulta        | A função lê ou grava dado de outro aluno                          |
| Checagem de dono escrita à mão (`raise`)        | A policy não roda; sem o `raise`, qualquer um grava               |
| Retorno recortado ao que a tela do dono precisa | O `definer` devolve mais do que a policy de `select` deixaria ver |

A terceira é a menos óbvia e a mais perigosa: a ausência de policy de `select` **não** protege o
retorno de uma função `definer`. O recorte é código, e código é o que se esquece. Por isso os três
casos são vistos falhando antes de contarem como prontos (`testes.md`).

**A assinatura importa.** Função `definer` exposta nunca aceita de fora o dado que decide o alcance
dela. Ela lê `auth.uid()` em vez de receber o `aluno_id` por parâmetro: com o parâmetro, qualquer
autenticado agiria sobre a conta de outro.

## Cadastro e confirmação de e-mail

O SAACI tem **autocadastro** (RF01), ao contrário de sistemas de acesso fechado. Isso desloca o
risco: o buraco não é "alguém criou conta", é "alguém criou conta com e-mail que não é do IFCE".

- **Domínio institucional (RF02) é barrado no servidor**, por Auth Hook de antes da criação do
  usuário ou por gatilho em `auth.users`. Validar só na tela não conta, porque a chave `anon` é
  pública (vai no bundle do navegador) e o `/auth/v1/signup` aceita qualquer chamada direta:

  ```bash
  curl -X POST .../auth/v1/signup -H "apikey: <anon>" \
    -d '{"email":"qualquer@gmail.com","password":"..."}'   # precisa falhar
  ```

- **Confirmação de e-mail ligada** (`enable_confirmations = true` no `config.toml`, RF03 e RF04). Com
  ela, a conta só ativa depois do link, e o login de conta não confirmada falha com
  `email_not_confirmed`, que o service traduz e a tela leva à verificação (RF05, RF39).
- **Duas flags de nome parecido, e só uma é a certa para o login.** `[auth] enable_signup` abre ou
  fecha o `/auth/v1/signup` público: aqui fica **ligada**, e o domínio é barrado pelo hook. Já
  `[auth.email] enable_signup` desliga o **provider de e-mail inteiro**: em `false` derruba o login,
  e `signInWithPassword` passa a devolver `email_provider_disabled`.
- **Teste que trava as duas pontas.** A config é uma linha, invisível em code review, e o padrão
  volta ao de fábrica num projeto criado do zero. A suíte de integração tenta cadastrar um e-mail de
  fora do IFCE (precisa falhar) e um do IFCE (precisa criar). **Confira isso ao criar o projeto de
  produção.**
- **Link de confirmação e de redefinição** têm validade limitada e uso único (RNF03). A validade se
  configura no Auth e se confere ao criar o projeto.
- **Senha** é guardada com hash e salt pelo próprio Supabase Auth (RNF01). O SAACI nunca vê nem
  guarda senha.
- Em aberto: como corrigir o e-mail de uma conta não confirmada
  (RF40) quando ela não tem sessão.

## Apagar a conta: `service_role` e a fronteira do Route Handler

Apagar usuário é chamada à Admin API do Auth, que exige a chave `service_role`. E essa chave
**ignora RLS por completo**. É a razão de existir um Route Handler (`DELETE /api/conta`), e é a
fronteira mais perigosa do sistema.

A regra dentro do handler: **dois clientes, fronteira explícita.**

```ts
const db = await createClient() // cookies de quem chamou → RLS ativa
const admin = createAdminClient() // service_role → RLS ignorada
```

O `admin` faz só o que não tem versão por tabela: apagar o usuário de autenticação. Tudo que toca
dado do aluno (ler as atividades para listar os comprovantes, apagar os arquivos do Storage) passa
pelo cliente de quem chamou e continua sujeito à policy.

Cada tabela tocada pelo `admin` é uma tabela onde a autorização deixou de ser a policy e virou um
`if` escrito à mão. O `if` é o que se esquece. Além disso, **a chave não traz autorização junto**: o
handler começa lendo a sessão e exigindo a senha atual do aluno (RF33). Ter a chave prova que o
código roda no servidor, não que quem pediu podia pedir.

A fábrica do cliente admin vive em `src/@supabase/admin.ts`, atrás de `import 'server-only'`, que
quebra o **build** se um Client Component a alcançar. O teste de repositório guarda contra a chave se
espalhar para um segundo arquivo.

## Regras de tela

- O botão que o aluno não pode usar não aparece, por UX. Quem barra é a policy.
- A barra de ações de uma tela de detalhe nasce com **um guard só, no bloco inteiro**, nunca botão a
  botão. Esconder só o botão "destrutivo" e esquecer o outro é o defeito que se repete, porque
  remover _parece_ mais perigoso e ganha o guard sozinho.
- O prop nomeia a **capacidade**, não o papel: `canRemove`, não `isAluno`. Quando existir mais de um
  papel, a pergunta deixa de ser "é aluno?" e passa a ser "pode remover?".
- O que garante isso não é a convenção, é o teste. Convenção em documento é hábito; teste é
  armadilha.
