-- Progresso do aluno calculado no banco (RF14, RF16, RF38, RNF20, issue #21, ADR 0015).
-- `calcula_horas` é a conta única, pura: recebe tudo por parâmetro e não lê tabela. `progresso_do_aluno`
-- junta perfil, regras e atividades do aluno logado e chama a conta. O arquivo `tests/hours-cases.json`
-- roda contra `calcula_horas` e contra `src/utils/compute-hours.ts`, e os dois lados têm de bater.

-- Entrada (jsonb):
--   semestre_inicio  date em texto, ou nulo (nada conta)
--   meta_horas       carga total do curso
--   itens            [{ numero, nome, horas, a_cada, maximo_horas }]
--   atividades       [{ id, item_numero, quantidade, data_inicio, registrado_em }]
-- Saída (jsonb):
--   atividades       [{ id, horas_atividade, horas_contadas, situacao, motivo }], na ordem recebida
--   progresso        { total_horas, meta_horas, faltam_horas, soma_itens, itens: [...] }
--
-- A conta é em décimos inteiros e em `numeric`, sem ponto flutuante: 0,94 × 5 dá 4,7 sem epsilon.
-- O máximo do item é dividido pela ordem de registro (`registrado_em`, depois o `id`), e a atividade
-- anterior ao ingresso não ocupa o máximo.
create function public.calcula_horas(entrada jsonb)
returns jsonb
language plpgsql
immutable
parallel safe
set search_path = ''
as $$
declare
  v_ingresso date := nullif(entrada ->> 'semestre_inicio', '')::date;
  v_meta numeric := (entrada ->> 'meta_horas')::numeric;
  v_item_sem_regra integer;
  v_resultado jsonb;
begin
  select min((a ->> 'item_numero')::integer)
    into v_item_sem_regra
    from jsonb_array_elements(entrada -> 'atividades') as a
   where not exists (
     select 1
       from jsonb_array_elements(entrada -> 'itens') as i
      where (i ->> 'numero')::integer = (a ->> 'item_numero')::integer
   );

  if v_item_sem_regra is not null then
    raise exception 'Atividade no item %, que não existe nas regras do curso.', v_item_sem_regra;
  end if;

  with itens as (
    select (i ->> 'numero')::integer as numero,
           i ->> 'nome' as nome,
           (i ->> 'horas')::numeric as horas,
           (i ->> 'a_cada')::numeric as a_cada,
           round((i ->> 'maximo_horas')::numeric * 10)::integer as maximo
      from jsonb_array_elements(entrada -> 'itens') as i
  ),
  brutas as (
    select a.ordem,
           a.atividade ->> 'id' as id,
           i.numero,
           (a.atividade ->> 'registrado_em')::timestamptz as registrado_em,
           i.maximo,
           floor(
             (a.atividade ->> 'quantidade')::numeric * i.horas * 10 / i.a_cada
           )::integer as bruto,
           coalesce((a.atividade ->> 'data_inicio')::date >= v_ingresso, false) as elegivel
      from jsonb_array_elements(entrada -> 'atividades') with ordinality as a (atividade, ordem)
      join itens i on i.numero = (a.atividade ->> 'item_numero')::integer
  ),
  acumuladas as (
    select b.*,
           coalesce(
             sum(b.bruto) filter (where b.elegivel) over (
               partition by b.numero
               order by b.registrado_em, b.id collate "C"
               rows between unbounded preceding and 1 preceding
             ),
             0
           ) as antes
      from brutas b
  ),
  calculadas as (
    select c.*,
           case
             when c.elegivel then greatest(0, least(c.bruto, c.maximo - c.antes))
             else 0
           end as contado
      from acumuladas c
  ),
  por_item as (
    select c.numero,
           sum(c.contado) as contado,
           sum(case when c.elegivel then c.bruto - c.contado else 0 end) as excedente
      from calculadas c
     group by c.numero
  )
  select jsonb_build_object(
    'atividades', (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', c.id,
            'horas_atividade', c.bruto / 10.0,
            'horas_contadas', c.contado / 10.0,
            'situacao', case
              when not c.elegivel then 'nao_conta'
              when c.contado = c.bruto then 'conta'
              when c.contado > 0 then 'parcial'
              else 'nao_conta'
            end,
            'motivo', case
              when not c.elegivel then 'antes_do_ingresso'
              when c.contado = c.bruto then null
              else 'item_cheio'
            end
          )
          order by c.ordem
        ),
        '[]'::jsonb
      )
      from calculadas c
    ),
    'progresso', (
      select jsonb_build_object(
        'total_horas', least(t.soma / 10, v_meta),
        'meta_horas', v_meta,
        'faltam_horas', v_meta - least(t.soma / 10, v_meta),
        'soma_itens', t.soma / 10.0,
        'itens', (
          select coalesce(
            jsonb_agg(
              jsonb_build_object(
                'numero', i.numero,
                'nome', i.nome,
                'horas_contadas', p.contado / 10.0,
                'maximo_horas', i.maximo / 10.0,
                'horas_excedentes', p.excedente / 10.0
              )
              order by i.numero
            ),
            '[]'::jsonb
          )
          from por_item p
          join itens i on i.numero = p.numero
          where p.contado > 0 or p.excedente > 0
        )
      )
      from (select coalesce(sum(contado), 0)::integer as soma from por_item) as t
    )
  )
  into v_resultado;

  return v_resultado;
end;
$$;

-- O progresso do aluno logado, ou nulo quando o perfil ainda não tem curso (o service lança o erro).
-- `security invoker`: a RLS de `perfis` e de `atividades` vale, então o aluno só calcula sobre o que é
-- dele. O dono vem de `auth.uid()`, nunca de parâmetro.
create function public.progresso_do_aluno()
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  v_curso uuid;
  v_ingresso date;
  v_entrada jsonb;
begin
  select p.curso_id, p.semestre_inicio
    into v_curso, v_ingresso
    from public.perfis p
   where p.aluno_id = (select auth.uid());

  if v_curso is null then
    return null;
  end if;

  select jsonb_build_object(
    'semestre_inicio', v_ingresso,
    'meta_horas', c.carga_total_horas,
    'itens', (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'numero', i.numero,
            'nome', i.nome,
            'horas', i.horas,
            'a_cada', i.a_cada,
            'maximo_horas', i.maximo_horas
          )
          order by i.numero
        ),
        '[]'::jsonb
      )
      from public.itens_curso i
      where i.curso_id = c.id
    ),
    'atividades', (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', a.id,
            'item_numero', a.item_numero,
            'quantidade', a.quantidade,
            'data_inicio', a.data_inicio,
            'registrado_em', a.created_at
          )
        ),
        '[]'::jsonb
      )
      from public.atividades a
    )
  )
    into v_entrada
    from public.cursos c
   where c.id = v_curso;

  if v_entrada is null then
    raise exception 'O curso % do perfil não existe nas regras.', v_curso;
  end if;

  return public.calcula_horas(v_entrada) -> 'progresso';
end;
$$;

-- Função em `public` vira RPC pública por padrão. `calcula_horas` não lê tabela nem `auth.uid()`: só
-- transforma o que recebe, então não vaza dado, e fica chamável pelo aluno para o teste de paridade.
revoke execute on function public.calcula_horas(jsonb) from public, anon;
revoke execute on function public.progresso_do_aluno() from public, anon;
grant execute on function public.calcula_horas(jsonb) to authenticated;
grant execute on function public.progresso_do_aluno() to authenticated;
