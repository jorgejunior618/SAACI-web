# 0003. Auth só para aluno do IFCE, com e-mail confirmado e conta não confirmada apagada em 7 dias

- **Status:** Proposta
- **Data:** 10/11/2026

## Contexto

O Auth do Supabase vem aberto: aceita qualquer e-mail, não exige confirmação e manda e-mail em
inglês. O SAACI é do IFCE (RF02), a confirmação é obrigatória (RF03, RF04), o link tem validade
limitada e uso único (RNF03) e conta não confirmada não pode ficar para sempre (RNF27).

A chave `anon` é pública e `/auth/v1/signup` aceita chamada direta, então validar o domínio só na
tela não conta. `doc/arquitetura.md` também manda registrar por nome todo `security definer` e põe
agendamento em Route Handler, o que pede decisão para a limpeza do RNF27.

## Decisão

- **Domínio (RF02) no servidor, em dois pontos.** O Auth Hook `before_user_created` barra o
  cadastro com 403 e a mensagem "Use seu e-mail @aluno.ifce.edu.br.". Um gatilho
  `BEFORE UPDATE OF email, email_change` em `auth.users` barra a troca de e-mail depois do cadastro,
  que o hook não vê. Os dois chamam `public.email_institucional`, o único lugar que conhece o domínio.
- **Confirmação ligada** (`enable_confirmations = true`). Conta não confirmada não entra
  (`email_not_confirmed`).
- **Link vale 1 hora e só funciona uma vez** (`otp_expiry = 3600`). O Supabase tem um valor só para o
  link de confirmação e o de nova senha. Quem perder o prazo pede outro link (RF05) sem se cadastrar
  de novo.
- **Endereços de retorno:** `/confirme-email` e `/nova-senha`. O e-mail leva `token_hash` e `type`,
  e a rota troca o token por sessão.
- **E-mails em português** em `supabase/templates/`, para confirmação e nova senha.
- **RNF27 em 7 dias.** `public.apagar_contas_nao_confirmadas(prazo)` apaga de `auth.users` quem não
  confirmou o e-mail, agendada por `pg_cron` todo dia às 03:00 UTC.
- **Duas exceções, registradas em `arquitetura.md`:** a função da limpeza é `security definer`
  (apagar em `auth.users` exige o dono do schema, e `anon` e `authenticated` não executam), e o
  agendamento roda no banco, sem Route Handler.

## Consequências

- A regra é testada com pgTAP em `supabase/tests/database/` (`pnpm test:db`), e vimos cada teste
  falhar com a regra sabotada.
- Cadastrar de novo o mesmo e-mail antes de confirmar manda um link novo, invalida o anterior e
  mantém a senha do primeiro cadastro. A tela de conta não confirmada deve oferecer "reenviar e-mail".
- A troca de e-mail para fora do IFCE chega à API como HTTP 500 com `code: P0001` e a mesma
  mensagem. O service traduz esse código, e a tela também valida o domínio para avisar antes.
- `supabase/config.toml` vale só no banco local. Em produção, as migrations sobem por
  `supabase db push` e a configuração por `supabase config push` (passo a passo no README).
- Produção precisa de SMTP próprio: o padrão do Supabase só serve para teste e trava o cadastro
  quando a confirmação é obrigatória.
- O texto dos e-mails diz "1 hora". Mudar `otp_expiry` exige mudar os templates.
- Quem criar função em `public` revoga `execute` de `anon` e `authenticated`, senão ela vira RPC
  pública.

## Alternativas descartadas

- **Só o Auth Hook.** Deixa a brecha de criar a conta com e-mail do IFCE e trocar depois para um
  Gmail.
- **Só o gatilho em `auth.users`.** Cobre os dois casos, mas no cadastro o Auth devolve 500 genérico
  ("Database error saving new user"), ruim de traduzir na tela.
- **Link de 24 horas.** Janela maior se o e-mail vazar, sem ganho que justifique.
- **Limpeza por Route Handler com `service_role` e Cron.** Traz a fronteira mais perigosa do
  sistema (RLS ignorada) para uma tarefa que só mexe no banco, e exige um segredo e um endpoint a
  proteger.
- **Prazo e validade diferentes para confirmação e nova senha.** O Supabase não separa o `otp_expiry`.
