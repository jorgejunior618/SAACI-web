-- Limite de rajada nas leituras de comprovante por IA (RF41, ADR 0016). O teto diário sozinho deixava
-- um aluno gastar as leituras todas em um segundo, e a cota gratuita do Google vale para o projeto
-- inteiro (por minuto). A função passa a recusar também quem passou do limite do último minuto.
-- Troca a assinatura, então a função antiga sai.

drop function public.reservar_leitura_comprovante(integer);

-- Reserva uma leitura se o aluno está dentro dos dois limites: `limite_dia` nas últimas 24 h e
-- `limite_minuto` no último minuto. Devolve `false` quando um deles acabou, sem gravar. O
-- `pg_advisory_xact_lock` por aluno serializa duas chamadas simultâneas. `security invoker`: valem a
-- RLS e os privilégios de quem chama, então o aluno só conta e grava as próprias linhas.
create function public.reservar_leitura_comprovante(limite_dia integer, limite_minuto integer)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  aluno uuid := auth.uid();
  no_dia integer;
  no_minuto integer;
begin
  if aluno is null then
    raise exception 'Entre na sua conta para ler o comprovante.' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(aluno::text, 0));

  select
    count(*)::integer,
    (count(*) filter (where l.created_at > now() - interval '1 minute'))::integer
    into no_dia, no_minuto
    from public.leituras_comprovante l
   where l.aluno_id = aluno
     and l.created_at > now() - interval '24 hours';

  if no_dia >= limite_dia or no_minuto >= limite_minuto then
    return false;
  end if;

  insert into public.leituras_comprovante (aluno_id) values (aluno);
  return true;
end;
$$;

-- Função em `public` vira RPC pública por padrão: só o aluno logado reserva.
revoke execute on function public.reservar_leitura_comprovante(integer, integer) from public, anon;
grant execute on function public.reservar_leitura_comprovante(integer, integer) to authenticated;
