-- RNF21: a regra de cada curso é dado, não código. Um curso novo custa uma migration (curso + itens).
-- Cadastro: leitura para qualquer aluno logado, escrita só por migration (doc/rls-e-permissoes.md).
-- Fonte dos valores: "Formulário para Solicitação de Atividades Complementares", Coordenação de
-- Engenharia de Computação, IFCE Fortaleza, matriz 6759 (regras-engenharia-computacao.html, repo de
-- produto). Quando o formulário diverge do PPC, vale o formulário.

create extension if not exists unaccent with schema extensions;

-- `unaccent` é `stable`, e coluna gerada exige `immutable`. Fixar o dicionário pelo nome torna a
-- chamada determinística, então a função pode ser declarada imutável.
create function public.sem_acento(texto text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select lower(extensions.unaccent('extensions.unaccent'::regdictionary, texto));
$$;

create table public.cursos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  -- Busca sem acento nem caixa. O service normaliza o termo do mesmo jeito.
  nome_busca text generated always as (public.sem_acento(nome)) stored,
  grau text not null,
  campus text not null,
  -- Carga total de atividades complementares do curso, em horas-aula.
  carga_total_horas numeric(6,1) not null check (carga_total_horas > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cursos_nome_busca_idx on public.cursos (nome_busca);

-- Tipos de regra: razao (horas do certificado viram horas computadas), fixo (valor por unidade),
-- pagina (horas por página) e fator (base vezes o fator Qualis). A conta usa `horas` e `a_cada`:
-- `horas` computadas para cada `a_cada` da `unidade`.
create table public.itens_curso (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references public.cursos (id) on delete cascade,
  numero integer not null check (numero >= 1),
  nome text not null,
  -- Texto que a tela exibe.
  regra text not null,
  tipo_regra text not null check (tipo_regra in ('razao', 'fixo', 'pagina', 'fator')),
  horas numeric(6,1) not null check (horas > 0),
  a_cada numeric(6,1) not null check (a_cada > 0),
  unidade text not null check (
    unidade in (
      'hora', 'periodo_letivo', 'disciplina', 'projeto', 'certificacao',
      'evento', 'dia_evento', 'palestra', 'pagina', 'publicacao'
    )
  ),
  -- Máximo que o item soma no total do aluno.
  maximo_horas numeric(6,1) not null check (maximo_horas > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (curso_id, numero)
);

-- O índice único acima já cobre a busca por curso (`curso_id` é a primeira coluna).

alter table public.cursos enable row level security;
alter table public.itens_curso enable row level security;

create policy "aluno logado lê os cursos"
  on public.cursos
  for select
  to authenticated
  using (true);

create policy "aluno logado lê os itens dos cursos"
  on public.itens_curso
  for select
  to authenticated
  using (true);

-- Sem policy de escrita, o RLS já nega. O revoke tira também o privilégio de tabela, para a negação
-- não depender de uma policy a menos. Quem escreve é a migration, que roda como dono do schema.
revoke all on public.cursos from anon, authenticated;
revoke all on public.itens_curso from anon, authenticated;
grant select on public.cursos to authenticated;
grant select on public.itens_curso to authenticated;

-- Curso-piloto (RF15). Telecomunicações entra com a migration própria quando o formulário chegar.
insert into public.cursos (id, nome, grau, campus, carga_total_horas)
values (
  '3b1f6d2e-5a47-4c80-9e1b-7d0c2a4f8e11',
  'Engenharia de Computação',
  'Bacharelado',
  'Fortaleza',
  120
);

insert into public.itens_curso
  (curso_id, numero, nome, regra, tipo_regra, horas, a_cada, unidade, maximo_horas)
select '3b1f6d2e-5a47-4c80-9e1b-7d0c2a4f8e11', v.*
from (values
  (1, 'Programa de iniciação científica ou tecnológica', '40h a cada período letivo, até 80h', 'fixo', 40, 1, 'periodo_letivo', 80),
  (2, 'Programa de iniciação à docência', '40h a cada período letivo, até 80h', 'fixo', 40, 1, 'periodo_letivo', 80),
  (3, 'Programa de monitoria', '40h por disciplina como monitor, até 80h', 'fixo', 40, 1, 'disciplina', 80),
  (4, 'Projeto de pesquisa ou extensão', '30h por projeto a cada período letivo, até 60h', 'fixo', 30, 1, 'projeto', 60),
  (5, 'Atividades artístico-culturais ou esportivas', '1h a cada 2h de atividade, até 60h', 'razao', 1, 2, 'hora', 60),
  (6, 'Curso de línguas', '1h a cada 4h de curso, até 60h', 'razao', 1, 4, 'hora', 60),
  (7, 'Curso na área de engenharia de computação', '1h a cada 4h de curso, até 60h', 'razao', 1, 4, 'hora', 60),
  (8, 'Curso fora da área de engenharia de computação', '1h a cada 6h de curso, até 40h', 'razao', 1, 6, 'hora', 40),
  (9, 'Ministrar curso na área de engenharia de computação', '2h a cada 1h de curso, até 60h', 'razao', 2, 1, 'hora', 60),
  (10, 'Certificação técnica', '30h por certificação, até 60h', 'fixo', 30, 1, 'certificacao', 60),
  (11, 'Organização de eventos técnicos ou científicos na área do curso', '20h por evento, até 40h', 'fixo', 20, 1, 'evento', 40),
  (12, 'Participação em eventos técnicos ou científicos na área do curso', '4h por dia de evento, até 40h', 'fixo', 4, 1, 'dia_evento', 40),
  (13, 'Ouvinte em palestras da área do curso', '2h por palestra, até 30h', 'fixo', 2, 1, 'palestra', 30),
  (14, 'Palestrante em palestras da área do curso', '8h por palestra, até 30h', 'fixo', 8, 1, 'palestra', 30),
  (15, 'Projeto social extracurricular', '15h por projeto, até 30h', 'fixo', 15, 1, 'projeto', 30),
  (16, 'Produção técnica com relatório', '3h a cada 10 páginas, até 30h', 'pagina', 3, 10, 'pagina', 30),
  (17, 'Pôster em evento nacional', '4h vezes o fator Qualis, até 30h', 'fator', 4, 1, 'publicacao', 30),
  (18, 'Pôster em evento internacional', '5h vezes o fator Qualis, até 40h', 'fator', 5, 1, 'publicacao', 40),
  (19, 'Resumo publicado em evento nacional', '5h vezes o fator Qualis, até 40h', 'fator', 5, 1, 'publicacao', 40),
  (20, 'Resumo publicado em evento internacional', '6h vezes o fator Qualis, até 40h', 'fator', 6, 1, 'publicacao', 40),
  (21, 'Artigo em evento nacional', '6h vezes o fator Qualis, até 80h', 'fator', 6, 1, 'publicacao', 80),
  (22, 'Artigo em evento internacional', '7h vezes o fator Qualis, até 80h', 'fator', 7, 1, 'publicacao', 80),
  (23, 'Artigo em periódico nacional', '7h vezes o fator Qualis, até 80h', 'fator', 7, 1, 'publicacao', 80),
  (24, 'Artigo em periódico internacional', '8h vezes o fator Qualis, até 80h', 'fator', 8, 1, 'publicacao', 80)
) as v (numero, nome, regra, tipo_regra, horas, a_cada, unidade, maximo_horas);
