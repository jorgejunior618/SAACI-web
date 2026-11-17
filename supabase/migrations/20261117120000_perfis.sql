-- Perfil do aluno: nome, matrícula, semestre de início e curso (RF09, RF10, RF11).
-- O e-mail fica em `auth.users` e não é copiado para cá: duas cópias divergem (RF40).
-- A linha nasce por gatilho no cadastro, com tudo nulo, e o aluno só a atualiza. Quem apaga é o
-- `on delete cascade` de `auth.users` (RF33). Decisões na ADR 0009.

-- Mantém `updated_at` sem depender de quem escreve. Genérica: as tabelas do aluno que vierem
-- (atividades, na #20) reaproveitam esta função.
create function public.atualiza_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.perfis (
  -- O dono do dado. É a chave primária, então já tem índice, e é a coluna que a RLS compara.
  aluno_id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  matricula text,
  -- Sempre dia 1 de janeiro (`.1`) ou de julho (`.2`). `date` e não dois inteiros, para o filtro de
  -- intervalo do cálculo de horas (RF38) ser uma comparação simples.
  semestre_inicio date check (
    semestre_inicio is null
    or (
      extract(day from semestre_inicio) = 1
      and extract(month from semestre_inicio) in (1, 7)
    )
  ),
  -- Nulo até o aluno passar por Seu curso (RF09). Curso com perfil apontando para ele não se apaga.
  curso_id uuid references public.cursos (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A chave primária cobre a busca por dono. Este índice cobre o `on delete restrict` do curso.
create index perfis_curso_id_idx on public.perfis (curso_id);

create trigger atualiza_updated_at
  before update on public.perfis
  for each row
  execute function public.atualiza_updated_at();

-- Cria a linha vazia quando a conta nasce. `security definer` porque quem dispara é o Auth, sem a
-- sessão do aluno, e o aluno não tem policy de insert. `search_path` vazio impede que um objeto
-- homônimo em outro schema desvie a função. Não recebe nem devolve dado do aluno.
create function public.cria_perfil_do_aluno()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (aluno_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger cria_perfil_do_aluno
  after insert on auth.users
  for each row
  execute function public.cria_perfil_do_aluno();

-- Contas que já existiam antes desta migration também precisam de perfil.
insert into public.perfis (aluno_id)
select id from auth.users
on conflict do nothing;

-- RF10: diz se o aluno tem atividade registrada.
-- TODO [#20]: a tabela de atividades ainda não existe, então a função devolve `false` e a trava
-- abaixo fica inerte. A #20 troca o corpo por `create or replace`, sem mexer no gatilho, e decide
-- se a função continua chamável por RPC (hoje `authenticated` a executa, ADR 0009). Enquanto
-- não há atividade no banco, `false` é também a resposta certa.
-- `security invoker`: depois da #20 a RLS de quem chama vale, e o aluno só enxerga as próprias.
create function public.aluno_tem_atividades(aluno uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select false;
$$;

-- RF10: trocar o curso com atividade registrada é recusado no banco, porque as atividades ficariam
-- apontando para itens de uma matriz que o aluno não tem mais. A primeira escolha (curso antes
-- nulo) passa sempre. SQLSTATE próprio (`SA010`) para o service reconhecer o erro sem depender do
-- texto da mensagem.
create function public.trava_troca_de_curso()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.curso_id is not null
     and new.curso_id is distinct from old.curso_id
     and public.aluno_tem_atividades(old.aluno_id) then
    raise exception 'Com atividades registradas, o curso fica travado.'
      using errcode = 'SA010';
  end if;

  return new;
end;
$$;

create trigger trava_troca_de_curso
  before update of curso_id on public.perfis
  for each row
  execute function public.trava_troca_de_curso();

alter table public.perfis enable row level security;

-- Do aluno: dono em todos os comandos que existem. Não há policy de insert (o gatilho cria) nem de
-- delete (o cascade apaga). O `update` exige o `select`, senão afetaria zero linhas em silêncio.
create policy "aluno lê o próprio perfil"
  on public.perfis
  for select
  to authenticated
  using (aluno_id = (select auth.uid()));

create policy "aluno atualiza o próprio perfil"
  on public.perfis
  for update
  to authenticated
  using (aluno_id = (select auth.uid()))
  with check (aluno_id = (select auth.uid()));

-- Sem policy a negação já existe. O revoke tira também o privilégio de tabela, e o grant por coluna
-- impede o aluno de trocar `aluno_id`, `created_at` ou `updated_at`.
revoke all on public.perfis from anon, authenticated;
grant select on public.perfis to authenticated;
grant update (nome, matricula, semestre_inicio, curso_id) on public.perfis to authenticated;

-- Função em `public` vira RPC pública por padrão. Estas são só de gatilho: ninguém as chama.
revoke execute on function public.atualiza_updated_at() from public, anon, authenticated;
revoke execute on function public.cria_perfil_do_aluno() from public, anon, authenticated;
revoke execute on function public.aluno_tem_atividades(uuid) from public, anon;
revoke execute on function public.trava_troca_de_curso() from public, anon, authenticated;
grant execute on function public.aluno_tem_atividades(uuid) to authenticated;
