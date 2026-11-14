-- RF33: o aluno apaga a própria conta. O usuário sai de `auth.users` e, quando as tabelas do SAACI
-- existirem (perfil, atividades), as chaves estrangeiras para `auth.users` com `on delete cascade`
-- levam o perfil e as atividades junto. Hoje `auth.users` é a única tabela com dado do aluno.
--
-- O navegador não apaga usuário do Auth (isso exige a chave secret), então a função roda como o dono
-- (`security definer`) e só enxerga a linha de quem chama: `auth.uid()` vem do token da requisição.
--
-- TODO [PRAZO DO RNF05]: os arquivos do bucket `comprovantes` não saem por SQL. Uma rotina agendada
-- (Edge Function com a chave secret + pg_cron) apaga as pastas cujo dono não existe mais. Vira
-- issue própria, junto da integração de atividades e comprovantes.

-- Apaga a conta de quem chama e devolve quantas contas apagou (0 sem sessão, 1 com sessão).
-- `search_path` vazio impede que um objeto homônimo em outro schema desvie a função.
create or replace function public.apagar_minha_conta()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  apagadas integer;
begin
  with removidas as (
    delete from auth.users
    where id = (select auth.uid())
    returning 1
  )
  select count(*) into apagadas from removidas;

  return apagadas;
end;
$$;

-- Função em `public` vira RPC pública por padrão. Só o aluno logado a executa; o visitante não.
revoke execute on function public.apagar_minha_conta() from public, anon;
grant execute on function public.apagar_minha_conta() to authenticated;
