-- Atividades do aluno e a referência ao comprovante (RF16, RF17, RF31, RF42, RNF24). O arquivo mora
-- no bucket `comprovantes` (ADR 0004); aqui fica só o caminho, o nome, o tamanho, o tipo e o hash.
-- As horas não são gravadas: saem do cálculo único, na leitura (RNF20, ADR 0003).

create table public.atividades (
  id uuid primary key default gen_random_uuid(),
  -- O dono do dado. O default evita que o navegador informe o dono; a RLS confere de qualquer forma.
  aluno_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- O curso vem do perfil, preenchido pelo gatilho abaixo. Com a FK composta, o item tem de existir
  -- na matriz do curso do aluno. A trava de RF10 impede o curso do perfil de mudar depois.
  curso_id uuid not null,
  item_numero integer not null,
  nome text not null check (length(btrim(nome)) > 0),
  -- Horas do certificado ou contagem (palestras, dias, projetos), conforme a regra do item.
  quantidade numeric not null check (quantidade > 0),
  -- O início decide se conta (RF38); o fim ordena a lista; o `created_at` decide quem ocupa o máximo
  -- do item (RF16). Nome fixo no `check` de datas: o service o reconhece pelo nome.
  data_inicio date not null,
  data_fim date not null,
  constraint atividades_datas_check check (data_fim >= data_inicio),
  -- `<aluno_id>/<arquivo>`, o mesmo nome do objeto no bucket. Um arquivo serve a uma atividade só.
  comprovante_caminho text not null unique,
  comprovante_nome text not null check (length(btrim(comprovante_nome)) > 0),
  -- Tamanho e tipo vêm do Storage pelo gatilho, não do navegador.
  comprovante_tamanho bigint not null check (comprovante_tamanho > 0),
  comprovante_tipo text not null check (
    comprovante_tipo in ('application/pdf', 'image/jpeg', 'image/png')
  ),
  -- RF42: comprovante repetido é avisado, não bloqueado. Por isso o hash não é `unique`.
  comprovante_hash text not null check (comprovante_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (curso_id, item_numero)
    references public.itens_curso (curso_id, numero)
    on delete restrict
);

-- Cobre a busca por dono, que a RLS faz em toda leitura, e a procura de comprovante repetido do
-- mesmo aluno (RF42). Um índice só em `aluno_id` seria prefixo deste.
create index atividades_aluno_hash_idx on public.atividades (aluno_id, comprovante_hash);
-- Cobre a FK composta: sem ele, mudar um item da matriz varreria a tabela.
create index atividades_curso_item_idx on public.atividades (curso_id, item_numero);

create trigger atualiza_updated_at
  before update on public.atividades
  for each row
  execute function public.atualiza_updated_at();

-- RNF24: não existe atividade sem comprovante. Antes de gravar, o gatilho confere que o arquivo já
-- está no bucket, na pasta do dono, e copia dele o tamanho e o tipo. Também fixa o curso pelo
-- perfil. `security invoker`: o aluno só enxerga os próprios objetos no Storage, então um caminho
-- da pasta de outro aluno não é encontrado.
create function public.prepara_atividade()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (storage.foldername(new.comprovante_caminho))[1] is distinct from new.aluno_id::text then
    raise exception 'O comprovante precisa estar na pasta do aluno.'
      using errcode = '42501';
  end if;

  select o.metadata ->> 'mimetype', (o.metadata ->> 'size')::bigint
    into new.comprovante_tipo, new.comprovante_tamanho
    from storage.objects o
   where o.bucket_id = 'comprovantes'
     and o.name = new.comprovante_caminho;

  -- SQLSTATE próprio (`SA024`, de RNF24): o service não depende do texto da mensagem.
  if not found then
    raise exception 'O comprovante não foi enviado. Envie o arquivo de novo.'
      using errcode = 'SA024';
  end if;

  select p.curso_id into new.curso_id
    from public.perfis p
   where p.aluno_id = new.aluno_id;

  return new;
end;
$$;

create trigger prepara_atividade
  before insert on public.atividades
  for each row
  execute function public.prepara_atividade();

alter table public.atividades enable row level security;

-- Do aluno: dono em todos os comandos (doc/rls-e-permissoes.md). `update` e `delete` dependem do
-- `select`, que existe.
create policy "aluno lê as próprias atividades"
  on public.atividades
  for select
  to authenticated
  using (aluno_id = (select auth.uid()));

create policy "aluno registra atividade para si"
  on public.atividades
  for insert
  to authenticated
  with check (aluno_id = (select auth.uid()));

create policy "aluno corrige as próprias atividades"
  on public.atividades
  for update
  to authenticated
  using (aluno_id = (select auth.uid()))
  with check (aluno_id = (select auth.uid()));

create policy "aluno remove as próprias atividades"
  on public.atividades
  for delete
  to authenticated
  using (aluno_id = (select auth.uid()));

-- Privilégio por coluna. No `insert`, dono, curso, tamanho e tipo ficam de fora: vêm do default e do
-- gatilho. No `update`, o comprovante não se troca (ADR 0001) e o dono, o curso e as datas de
-- controle também não.
revoke all on public.atividades from anon, authenticated;
grant select, delete on public.atividades to authenticated;
grant insert (
  nome, item_numero, quantidade, data_inicio, data_fim,
  comprovante_caminho, comprovante_nome, comprovante_hash
) on public.atividades to authenticated;
grant update (nome, item_numero, quantidade, data_inicio, data_fim)
  on public.atividades to authenticated;

-- RNF24: registra a atividade depois que o arquivo subiu, numa transação só, e devolve o `id`.
-- `security invoker`: valem a RLS e os privilégios de quem chama. Os parâmetros são lidos por
-- posição porque têm o nome das colunas.
create function public.registrar_atividade(
  nome text,
  item_numero integer,
  quantidade numeric,
  data_inicio date,
  data_fim date,
  comprovante_caminho text,
  comprovante_nome text,
  comprovante_hash text
)
returns uuid
language sql
set search_path = ''
as $$
  insert into public.atividades (
    nome, item_numero, quantidade, data_inicio, data_fim,
    comprovante_caminho, comprovante_nome, comprovante_hash
  )
  values ($1, $2, $3, $4, $5, $6, $7, $8)
  returning id;
$$;

-- RF10: o stub da migration `perfis` (ADR 0009) passa a olhar a tabela de verdade. Continua
-- `security invoker`: chamada por RPC com o id de outro aluno, a RLS esconde as linhas e a resposta
-- é `false`, sem vazar nada.
create or replace function public.aluno_tem_atividades(aluno uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (select 1 from public.atividades a where a.aluno_id = aluno);
$$;

-- Função em `public` vira RPC pública por padrão. O gatilho ninguém chama; o registro, só o aluno.
revoke execute on function public.prepara_atividade() from public, anon, authenticated;
revoke execute on function public.registrar_atividade(
  text, integer, numeric, date, date, text, text, text
) from public, anon;
grant execute on function public.registrar_atividade(
  text, integer, numeric, date, date, text, text, text
) to authenticated;
