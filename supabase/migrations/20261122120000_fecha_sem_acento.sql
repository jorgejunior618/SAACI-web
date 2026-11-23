-- Função em `public` vira RPC pública por padrão, e `sem_acento` não tem motivo para ser chamada pela
-- API. A coluna gerada `cursos.nome_busca` é escrita só por migration, com o dono da função
-- (`postgres`), então ninguém da API precisa de `execute`. O service normaliza o termo de busca em JS.
revoke execute on function public.sem_acento(text) from public, anon, authenticated;
