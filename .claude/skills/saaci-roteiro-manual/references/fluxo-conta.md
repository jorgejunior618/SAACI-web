# Roteiro: conta e login (Acesso)

Fluxo: criar conta, confirmar o e-mail, entrar, recuperar a senha, apagar a conta. Rotas: `/entrar`,
`/criar-conta`, `/confirme-email`, `/recuperar-senha`, `/nova-senha`, `/seu-curso`, `/excluir-conta`.
Os testes de integração (`pnpm test:rls`) já cobrem a regra; este roteiro confere a **tela**.

Convenção: `E` é o e-mail novo da rodada, `S1` uma senha válida e `S2` outra senha válida. Valem os
dados de teste do README. Todos os passos usam `http://localhost:3000`.

| #   | Passo                                      | Esperado                                                                              |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------------- |
| 1   | `/entrar` com e-mail que não existe e `S1` | Erro "A senha não confere" no campo da senha, e a mesma mensagem para qualquer e-mail |
| 2   | `/criar-conta` com `E` e senha `abc`       | Regras da senha visíveis e botão "Criar conta" desabilitado                           |
| 3   | Mesma tela com `E` e `S1`, enviar          | Tela "Confirme seu e-mail" com o reenvio em contagem regressiva                       |
| 4   | Ler o link no Mailpit e abri-lo            | "Confirmando seu e-mail" e depois `/seu-curso`, com Sair e Excluir conta              |
| 5   | Sair e abrir o mesmo link de novo          | "Este link não vale mais", com "Pedir um novo link"                                   |
| 6   | `/recuperar-senha` com `E`                 | Mensagem neutra: "Se este e-mail tiver conta..."                                      |
| 7   | Abrir o link de nova senha                 | "Para `E`" e regras da senha                                                          |
| 8   | Salvar `S2`                                | Sessão aberta e `/seu-curso`                                                          |
| 9   | `/excluir-conta` com senha errada          | Erro no campo e a conta continua                                                      |
| 10  | Mesma tela com `S2`                        | Volta a `/entrar`, e `auth.users` não tem mais `E`                                    |

Opcionais, quando o risco justificar:

- e-mail já cadastrado em `/criar-conta` (tela "e-mail já cadastrado");
- entrar com conta criada e **não confirmada** (leva a "Confirme seu e-mail");
- link de nova senha vencido ou reusado (`ExpiredLink`).

Conferência no banco (passo 10):
`docker exec supabase_db_saaci-web psql -U postgres -tAc "select count(*) from auth.users where email = '<E>'"`
deve devolver `0`.

## O que este roteiro já achou

- O `site_url` do Auth local era `127.0.0.1`, e o `next dev` bloqueia essa origem: o link do e-mail
  ficava em "Confirmando seu e-mail" sem erro no console. Corrigido para `localhost`.
- Um `next dev` iniciado antes da troca do env continuava com o Supabase remoto carregado.
