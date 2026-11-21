-- Limite de leituras de comprovante por IA (RF41, ADR 0016). Cada chamada ao serviço de IA reserva uma
-- linha aqui antes de sair do servidor, e o Route Handler recusa quando o aluno já gastou a cota do
-- dia. A tabela guarda só quem leu e quando: nada do comprovante nem do que a IA devolveu (RNF26).

create table public.leituras_comprovante (
  id uuid primary key default gen_random_uuid(),
  -- O dono. O default evita que o navegador informe o dono; a RLS confere de qualquer forma.
  aluno_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Cobre a contagem da janela de 24 h, que a função abaixo faz a cada leitura.
create index leituras_comprovante_aluno_data_idx
  on public.leituras_comprovante (aluno_id, created_at desc);

alter table public.leituras_comprovante enable row level security;

create policy "aluno lê as próprias leituras"
  on public.leituras_comprovante
  for select
  to authenticated
  using (aluno_id = (select auth.uid()));

create policy "aluno registra leitura para si"
  on public.leituras_comprovante
  for insert
  to authenticated
  with check (aluno_id = (select auth.uid()));

-- Sem `update` nem `delete`: a leitura gasta não se devolve. A função abaixo é `security invoker` e
-- informa o dono, então o `insert` vale só para `aluno_id` (a RLS confere que é o próprio). A data
-- vem do default.
revoke all on public.leituras_comprovante from anon, authenticated;
grant select on public.leituras_comprovante to authenticated;
grant insert (aluno_id) on public.leituras_comprovante to authenticated;

-- Reserva uma leitura se o aluno ainda tem cota nas últimas 24 h. Devolve `false` quando a cota
-- acabou, sem gravar. O `pg_advisory_xact_lock` por aluno serializa duas chamadas simultâneas: sem
-- ele, as duas contariam antes de gravar e passariam do limite. `security invoker`: valem a RLS e os
-- privilégios de quem chama, então o aluno só conta e grava as próprias linhas.
create function public.reservar_leitura_comprovante(limite integer)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  aluno uuid := auth.uid();
  usadas integer;
begin
  if aluno is null then
    raise exception 'Entre na sua conta para ler o comprovante.' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(aluno::text, 0));

  select count(*)::integer into usadas
    from public.leituras_comprovante l
   where l.aluno_id = aluno
     and l.created_at > now() - interval '24 hours';

  if usadas >= limite then
    return false;
  end if;

  insert into public.leituras_comprovante (aluno_id) values (aluno);
  return true;
end;
$$;

-- Função em `public` vira RPC pública por padrão: só o aluno logado reserva.
revoke execute on function public.reservar_leitura_comprovante(integer) from public, anon;
grant execute on function public.reservar_leitura_comprovante(integer) to authenticated;
