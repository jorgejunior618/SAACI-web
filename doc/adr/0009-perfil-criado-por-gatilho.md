# 0009. Perfil criado por gatilho em `auth.users`, com a trava de curso no banco

- **Status:** Proposta
- **Data:** 17/11/2026

## Contexto

O perfil do aluno (nome, matrícula, semestre de início e curso) sai do mock e vai para o Supabase
(issue #18). Três pontos pedem decisão:

- O cadastro só envia e-mail e senha, e `modelagem-dados.md` diz que a linha nasce com curso e
  semestre nulos. Alguém precisa criá-la.
- A troca de curso com atividades lançadas é recusada no banco (RF10), mas a tabela de atividades só
  nasce na #20.
- `arquitetura.md` manda registrar por nome todo `security definer` e exige `updated_at` no `WHERE`
  de toda escrita em tabela editável.

## Decisão

- **`public.cria_perfil_do_aluno()` é a terceira função `security definer` registrada**, ao lado de
  `apagar_contas_nao_confirmadas` (ADR 0003) e `apagar_minha_conta` (ADR 0006). É um gatilho
  `after insert on auth.users` que insere a linha vazia de `new.id`. Não recebe nem devolve dado do
  aluno, usa `search_path` vazio e ninguém a executa por RPC. A mesma migration cria o perfil das
  contas que já existiam.
- **Com sessão, a linha sempre existe.** O service trata a linha ausente como erro, não como "perfil
  vazio".
- **O aluno só lê e atualiza.** Não há policy de `insert` nem de `delete`: quem cria é o gatilho e
  quem apaga é o `on delete cascade` de `auth.users` (RF33). O `grant update` é por coluna (`nome`,
  `matricula`, `semestre_inicio`, `curso_id`), então o aluno não troca o dono da linha.
- **A trava de RF10 é um gatilho `before update of curso_id`.** Ele chama
  `public.aluno_tem_atividades(uuid)` e lança o SQLSTATE `SA010`, que o service traduz para
  `CourseLockedError`. Até a #20 essa função é um stub que devolve `false`, marcado com `TODO`. A #20
  a substitui por `create or replace`, sem mexer no gatilho. O teste pgTAP troca o stub por `true`
  dentro da transação e prova a trava.
- **Exceção nomeada: o update do perfil não leva `updated_at` no `WHERE`.** O aluno é o único
  escritor da própria linha e o patch é por campo, então dois aparelhos gravando campos diferentes
  não se sobrescrevem. A regra de `arquitetura.md` continua valendo para as atividades (ADR 0001).
- **`public.atualiza_updated_at()` é genérica** e serve às próximas tabelas do aluno.

## Consequências

- Contas novas e antigas têm perfil. Esquecer o gatilho numa tabela futura do aluno deixa a linha
  ausente, então toda tabela criada por gatilho precisa de backfill na mesma migration.
- Até a #20, a trava de RF10 existe mas não age. Como também não há atividade no banco, o
  comportamento observável é o correto.
- `updateProfile` faz duas idas à rede (usuário da sessão e `update`), porque o Supabase exige um
  filtro no `update`.
- Quem escrever a #20 precisa trocar o corpo de `aluno_tem_atividades` e retirar o `TODO`.
- `arquitetura.md`, `rls-e-permissoes.md` e `modelagem-dados.md` mudam neste commit.

## Alternativas descartadas

- **Upsert pelo service, sem gatilho.** A leitura devolveria "perfil vazio" sem linha, escondendo
  bug de sessão, e a regra de criação ficaria no front. Teria dispensado o `security definer`.
- **Esperar a #20 para entregar a trava.** Descumpre o "pronto quando" da issue e deixa o RF10
  apenas na tela por mais um ciclo.
- **Criar um esqueleto de atividades agora.** Invade o escopo e o desenho da #20.
- **`updated_at` no `WHERE` do perfil.** Mudaria o contrato de `updateProfile` e as telas, que a
  issue proíbe tocar, para proteger um conflito que um único escritor não produz.
