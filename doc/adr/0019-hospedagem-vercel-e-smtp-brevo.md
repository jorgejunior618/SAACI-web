# 0019. O SAACI hospeda na Vercel (plano Hobby) e envia e-mail do Auth pela Brevo

- **Status:** Aceita
- **Data:** 21/11/2026

## Contexto

O front e o Supabase já funcionam no banco local, e `doc/tecnologia.md` deixava a hospedagem como
"pendente". Colocar o sistema no ar (#40) exige duas escolhas gratuitas:

- **Onde o Next roda.** O app usa Route Handler (leitura do comprovante por IA, ADR 0016), e a #23
  traz `proxy.ts` e prefetch no servidor. Uma hospedagem só de arquivos estáticos não serve. A
  leitura do Gemini leva até cerca de 18 s, então o limite de duração da função importa.
- **Quem envia o e-mail do Auth.** O SMTP padrão do Supabase só serve para teste e limita os envios
  por hora, o que trava o cadastro com a confirmação obrigatória (ADR 0003). O sistema não tem
  domínio próprio, só o endereço `*.vercel.app`.

## Decisão

- **Hospedagem: Vercel, plano Hobby.** Roda Next 16 sem adaptador (`proxy.ts`, Route Handler e
  Server Component) e cria um preview por pull request. A função usa o limite padrão do plano, que
  comporta os 18 s da leitura do Gemini. Sem `vercel.json` até haver motivo.
- **E-mail do Auth: Brevo, plano gratuito, por SMTP.** A configuração vai em
  `[remotes.production.auth.email.smtp]` do `supabase/config.toml`, com usuário e chave lidos por
  `env(...)`. Nenhuma chave entra no repositório.
- **Variáveis de produção** ficam em Settings > Environment Variables da Vercel
  (`NEXT_PUBLIC_SUPABASE_*`, `GEMINI_API_KEY`, `GEMINI_MODEL`). A chave `secret` do Supabase não vai
  para a Vercel.
- **O aviso de privacidade cita os dois serviços**, junto do Supabase e do Google.

## Consequências

- Deploy por push e custo zero, sem servidor para manter.
- O plano Hobby da Vercel é só para uso não comercial. Serve a um projeto acadêmico, e uma mudança
  de uso pede revisão desta ADR.
- Sem domínio próprio, não há SPF nem DKIM do domínio do SAACI: o e-mail da Brevo pode cair no spam
  do `@aluno.ifce.edu.br`. O teste da #40 confere a caixa de entrada.
- Vercel e Brevo são terceiros novos e passam a receber dados (Vercel: as requisições; Brevo: o
  e-mail do aluno e o conteúdo dos e-mails do Auth). Aceitar esta ADR registra a aprovação do time,
  como o RNF26 fez com o Gemini. Os limites do plano gratuito de cada um precisam ser conferidos
  nos painéis antes do lançamento.
- O remetente é um Gmail do projeto, e o e-mail pode cair no spam. A tela de espera da confirmação
  (`PendingConfirmation`) diz ao aluno que o e-mail vem de SAACI e que ele deve olhar o spam. Um
  domínio próprio autenticado na Brevo é a saída se isso se mostrar um problema real.
- `doc/tecnologia.md` ganha a escolha de hospedagem e a linha de e-mail. O `README` passa a descrever
  o caminho de produção com a Brevo.
- A exceção do `SessionGate` (#23) não muda aqui.

## Alternativas descartadas

- **Netlify (plano gratuito).** Roda Next por um adaptador próprio e a função síncrona tem limite de
  duração curto, que pode cortar a leitura do Gemini. Limite não confirmado.
- **Cloudflare com OpenNext.** Cota gratuita generosa, mas exige adaptador novo, runtime diferente do
  Node e ajuste no build. Lib nova no repositório sem ganho que o projeto precise.
- **SMTP padrão do Supabase.** Trava o cadastro com a confirmação obrigatória.
- **Resend.** Boa entrega, mas exige domínio próprio verificado, e o projeto não tem um.
- **Gmail com senha de app.** Faz uma conta Google virar dependência do sistema, e o Google pode
  bloquear envio em volume.
