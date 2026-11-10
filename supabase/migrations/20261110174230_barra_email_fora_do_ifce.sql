-- RF02: só e-mail @aluno.ifce.edu.br entra no SAACI, e a regra é do servidor.
-- A chave `anon` é pública e `/auth/v1/signup` aceita chamada direta, então validar só na tela
-- não conta (doc/rls-e-permissoes.md, seção "Cadastro e confirmação de e-mail").
--
-- Dois pontos de entrada fecham a regra:
--   1. Auth Hook `before_user_created`: barra o cadastro e devolve 403 com mensagem em português.
--   2. Gatilho em `auth.users`: barra a troca de e-mail depois do cadastro, que o hook não vê.

-- Diz se o e-mail termina em @aluno.ifce.edu.br. É o único lugar que conhece o domínio.
-- A regex exige uma parte local sem `@` e sem espaço, e ancora o fim: `x@aluno.ifce.edu.br.evil.com`
-- e `a@b@aluno.ifce.edu.br` não passam. Maiúsculas valem, e nulo conta como fora do domínio.
create or replace function public.email_institucional(email text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(email ~* '^[^@[:space:]]+@aluno\.ifce\.edu\.br$', false);
$$;

-- Auth Hook `before_user_created`. Devolve `{}` para o cadastro seguir ou um erro 403 para barrar.
-- O formato do retorno é o do Supabase Auth: https://supabase.com/docs/guides/auth/auth-hooks
create or replace function public.barrar_email_externo(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
begin
  if public.email_institucional(event -> 'user' ->> 'email') then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message', 'Use seu e-mail @aluno.ifce.edu.br.'
    )
  );
end;
$$;

-- Gatilho da troca de e-mail. Barra `email` (troca direta) e `email_change` (troca pendente de
-- confirmação). `email_change` vem vazio quando não há troca pendente, e vazio não é barrado.
create or replace function public.barrar_troca_de_email_externo()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.email is distinct from old.email
     and not public.email_institucional(new.email) then
    raise exception 'Use seu e-mail @aluno.ifce.edu.br.';
  end if;

  if new.email_change is distinct from old.email_change
     and coalesce(new.email_change, '') <> ''
     and not public.email_institucional(new.email_change) then
    raise exception 'Use seu e-mail @aluno.ifce.edu.br.';
  end if;

  return new;
end;
$$;

create trigger barrar_troca_de_email_externo
  before update of email, email_change on auth.users
  for each row
  execute function public.barrar_troca_de_email_externo();

-- Função em `public` vira RPC pública por padrão. Só o Auth executa estas.
revoke execute on function public.email_institucional(text) from public, anon, authenticated;
revoke execute on function public.barrar_email_externo(jsonb) from public, anon, authenticated;
revoke execute on function public.barrar_troca_de_email_externo() from public, anon, authenticated;

grant execute on function public.email_institucional(text) to supabase_auth_admin;
grant execute on function public.barrar_email_externo(jsonb) to supabase_auth_admin;
grant execute on function public.barrar_troca_de_email_externo() to supabase_auth_admin;
