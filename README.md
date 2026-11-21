# SAACI Web

Aplicação web do SAACI, Sistema de Apoio Acadêmico Colaborativo do IFCE. Ajuda o aluno a entender
as regras de atividades complementares, registrar comprovantes e acompanhar as horas antes de
enviar o pedido à coordenação.

> Fase atual: esqueleto inicial. O `src/` tem só a configuração, os tokens do design system, o
> tema e uma página provisória em `/`. Telas e componentes entram um a um, especificados e
> conferidos contra o catálogo do design system.

## Stack

Next.js, Panda CSS, TanStack Query, React Hook Form e Valibot. O backend será o Supabase, ainda não
integrado. Detalhes em
[`doc/tecnologia.md`](doc/tecnologia.md).

## Como rodar

Pré-requisitos: Node 22 (`nvm use`) e pnpm (`corepack enable pnpm`). O projeto não usa npm: `npm i`
no Node 20 é recusado pelo `.npmrc`, e no Node 22 bagunça o `node_modules` do pnpm.

```bash
nvm use
pnpm install
cp .env.example .env.development.local
pnpm dev
```

Preencha o `.env.development.local` antes de rodar, como mostra a seção [Supabase](#supabase). Conta,
regras do curso, perfil e atividades com comprovantes já falam com o Supabase: antes do `pnpm dev`,
suba o banco local com `pnpm db:start` (precisa do Docker aberto) e preencha o
`.env.development.local` com a URL e a chave que `pnpm db:status` mostra. O `.env.production.local`
guarda o projeto remoto e só vale para `pnpm build` e `pnpm start`. Ainda não vem do banco a
leitura do comprovante por IA, fingida até a #22.

## Supabase

O projeto Supabase do time se chama `SAACI - Web` e fica na região South America (São Paulo), para
manter os dados dos alunos no Brasil (LGPD). Esta seção só prepara o acesso. Tabelas, login e
armazenamento têm cada um a sua issue.

### Como pegar as chaves

1. Peça a quem administra a organização `SAACI` no [Supabase](https://supabase.com) para convidar
   o seu e-mail. Aceite o convite e abra o projeto `SAACI - Web`.
2. Clique em **Connect**, no topo do projeto, ou abra **Settings > API Keys**.
3. Copie a **Project URL** (`https://<id>.supabase.co`) e a **Publishable key**
   (começa com `sb_publishable_`).
4. Crie o seu arquivo de ambiente e cole os dois valores:

   ```bash
   cp .env.example .env.development.local
   ```

   | Variável                               | Valor           |
   | -------------------------------------- | --------------- |
   | `NEXT_PUBLIC_SUPABASE_URL`             | Project URL     |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key |

5. Confira que o git ignora o arquivo: `git status` não deve listar o `.env.development.local`.

O `.env.example` guarda só os nomes, sem valor, e é o único arquivo de ambiente que vai para o
repositório. Um teste (`tests/env.test.ts`) falha se alguém preencher um valor nele ou versionar um
`.env` real.

### Chave pública e chave secreta

- A **publishable key** pode ir ao navegador. Quem protege os dados é o RLS do banco, não o
  segredo da chave. Ela substitui a antiga chave `anon`.
- A **secret key** (`sb_secret_...`) substitui a antiga `service_role` e **ignora o RLS por
  completo**. Ela nunca vai para o navegador, nem para variável com prefixo `NEXT_PUBLIC_`, que o
  Next.js embute no código enviado ao usuário. Por isso ela não está no `.env.example`: nenhum
  código atual precisa dela. Quando precisar, ela entra só em código de servidor, e a regra está em
  [`doc/rls-e-permissoes.md`](doc/rls-e-permissoes.md).
- Se uma chave vazar (commit, print, chat), avise o time e gere uma nova no painel do Supabase em
  **Settings > API Keys**.
- A senha do banco (Database password) fica no gerenciador de senhas do time. Não vai para
  arquivo do repositório.

Os documentos em `doc/` ainda usam os nomes antigos (`anon` e `service_role`). Os nomes novos
valem para o mesmo papel de cada chave.

## Banco local

Todo mundo sobe o mesmo Postgres no próprio computador e versiona as mudanças de tabela em
`supabase/migrations/`. A CLI do Supabase já vem no `pnpm install`, então não há nada para instalar
à parte. O app inteiro depende do banco local, então o [Docker](https://www.docker.com/products/docker-desktop/)
precisa estar aberto e o banco no ar (`pnpm db:start`) para rodar o app, não só para mexer no banco.

| Comando          | O que faz                                                         |
| ---------------- | ----------------------------------------------------------------- |
| `pnpm db:start`  | sobe o banco e os serviços locais (a primeira vez baixa imagens)  |
| `pnpm db:stop`   | para os containers e guarda os dados em um volume do Docker       |
| `pnpm db:reset`  | apaga o banco local e reaplica as migrations e o `seed.sql`       |
| `pnpm db:status` | mostra as URLs e as chaves do banco local                         |
| `pnpm db:types`  | regera `src/@supabase/database.types.ts` a partir do banco local  |
| `pnpm test:db`   | roda os testes pgTAP de `supabase/tests/database/` no banco local |

O Studio (painel visual do banco) abre em `http://127.0.0.1:54323` com o banco no ar. Os e-mails do
Auth (confirmação e nova senha) não saem de verdade: caem no Mailpit, em `http://127.0.0.1:54324`.
O link de cada e-mail abre `/confirme-email?token=...` ou `/nova-senha?token=...`: copie-o do Mailpit.
O link vale 1 hora e só funciona uma vez.

Abra o app sempre em `http://localhost:3000`, nunca em `127.0.0.1`: o `site_url` do Auth local é
`localhost`, e o `next dev` bloqueia a origem `127.0.0.1` (a página não hidrata e o link do e-mail
fica em "Confirmando seu e-mail" para sempre). Se mudar o `site_url` em `supabase/config.toml`,
reinicie com `pnpm db:stop` e `pnpm db:start`.

### Como criar uma migration nova

1. Com o banco no ar, crie o arquivo. O nome descreve a mudança, em português e `snake_case`:

   ```bash
   pnpm db:migration cria_tabela_perfis
   ```

   Isso gera `supabase/migrations/<data_e_hora>_cria_tabela_perfis.sql`.

2. Escreva o SQL no arquivo. Siga as convenções de
   [`doc/modelagem-dados.md`](doc/modelagem-dados.md): tabela e coluna em português, `snake_case`,
   tabela no plural e chave primária `uuid`. Toda tabela nova nasce com RLS e policy na mesma
   migration ([`doc/rls-e-permissoes.md`](doc/rls-e-permissoes.md)).
3. Aplique do zero para provar que o histórico inteiro funciona:

   ```bash
   pnpm db:reset
   ```

4. Regere os tipos do banco, com o banco no ar:

   ```bash
   pnpm db:types
   ```

   Isso reescreve `src/@supabase/database.types.ts`. Faça o commit dele junto com a migration. Se o
   comando falhar, o arquivo atual fica como estava: confira se o Docker está aberto e se
   `pnpm db:start` rodou.

5. Se o reset terminar sem erro, faça o commit da migration e dos tipos. Não edite uma migration
   que já foi para a `main`: corrija com uma migration nova.

### No CI

Todo pull request roda o job `banco` ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)). Ele
sobe o mesmo banco local, aplica as migrations e o seed, regera os tipos e roda os testes pgTAP.
Falha em dois casos:

- **Tipos desatualizados.** O `database.types.ts` regerado difere do que está no commit. Para
  corrigir, repita o passo no seu computador e faça o commit do arquivo:

  ```bash
  pnpm db:start
  pnpm db:reset
  pnpm db:types
  git diff src/@supabase/database.types.ts   # deve estar vazio depois do commit
  ```

- **Teste pgTAP falhando.** Reproduza com `pnpm db:reset && pnpm test:db`.

O job não usa segredo: as chaves do banco local são as de demonstração geradas pela CLI. Se um
passo futuro precisar de segredo (por exemplo, o deploy), ele entra só em
**Settings > Secrets and variables > Actions** do GitHub e é lido por `${{ secrets.NOME }}`. Nunca
vai para o repositório nem para o `config.toml`.

### Limpeza dos comprovantes

Sobram arquivos no bucket `comprovantes` quando o registro falha depois do upload, quando a remoção
apaga a atividade mas não o arquivo, e quando a conta é apagada. De hora em hora, o `pg_cron` chama a
Edge Function `limpa-comprovantes` (`supabase/functions/`), que apaga pela API do Storage os
arquivos sem atividade com mais de 1 hora. A função `public.comprovantes_orfaos` só lista; o SQL não
apaga arquivo.

A chamada leva um segredo, que fica em dois lugares e nunca no repositório:

| Onde               | Nome              | Valor                                |
| ------------------ | ----------------- | ------------------------------------ |
| Ambiente da função | `LIMPEZA_SEGREDO` | o segredo                            |
| Vault do banco     | `limpeza_segredo` | o mesmo segredo                      |
| Vault do banco     | `limpeza_url`     | o endereço da função (tabela abaixo) |

Sem os dois segredos do Vault, o job roda e não chama nada. Sem o `LIMPEZA_SEGREDO`, a função recusa
toda chamada.

**No banco local** (o `pnpm db:reset` apaga o Vault, então repita depois de cada reset):

1. Copie `supabase/functions/.env.example` para `supabase/functions/.env` e troque o valor, por
   exemplo pela saída de `openssl rand -hex 32`. O `.env` não vai para o Git.
2. Sirva a função: `pnpm exec supabase functions serve`.
3. No SQL Editor do Studio, grave os segredos. Dentro do Docker, o endereço do host é
   `host.docker.internal`:

   ```sql
   select vault.create_secret('http://host.docker.internal:54321/functions/v1/limpa-comprovantes', 'limpeza_url');
   select vault.create_secret('<o mesmo valor do .env>', 'limpeza_segredo');
   ```

4. Para testar sem esperar a hora cheia, chame a função com uma idade menor. O mínimo é 1 minuto:
   abaixo disso, um registro em andamento poderia perder o arquivo. Espere 1 minuto depois do upload
   e chame:

   ```bash
   curl -X POST http://127.0.0.1:54321/functions/v1/limpa-comprovantes \
     -H "x-limpeza-segredo: <o segredo>" -d '{"idade":"1 minute"}'
   ```

   A resposta diz quantos arquivos foram apagados: `{"deleted":1}`. Idade abaixo do mínimo ou fora do
   formato "número unidade" volta 400.

**No projeto remoto** (junto do passo de produção, #40):

1. `pnpm exec supabase functions deploy limpa-comprovantes`
2. `pnpm exec supabase secrets set LIMPEZA_SEGREDO=<o segredo>`
3. No SQL Editor do painel, os mesmos `vault.create_secret`, com a URL
   `https://<ref-do-projeto>.supabase.co/functions/v1/limpa-comprovantes`.

### Cliente do Supabase no código

Os clientes ficam em `src/@supabase/` e só os `services/` os usam. Tela, componente e
`@design-system` não importam `@supabase/*` (o ESLint barra).

| Onde o código roda                   | Importe                                    |
| ------------------------------------ | ------------------------------------------ |
| navegador (padrão do parâmetro `db`) | `createClient` de `@supabase/client`       |
| servidor (Server Component e `app/`) | `createServerClient` de `@supabase/server` |

O service recebe o cliente por parâmetro, com o do navegador como padrão:
`getActivities(filtros, db = createClient())`. No servidor, **passe sempre o cliente do servidor**.
Se esquecer, o service cai no cliente do navegador, que não enxerga o cookie de sessão, e a busca
volta vazia, sem erro. Detalhes em [`doc/camada-servicos.md`](doc/camada-servicos.md).

Os clientes leem `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (seção
[Supabase](#supabase)). Sem elas, a criação do cliente falha com a mensagem do que preencher, e o app
não passa do Acesso.

### Levar o Auth para produção

Nada é feito à mão no painel do Supabase: o que vale no banco local está em `supabase/migrations/`
(funções, gatilho e limpeza de conta) e em `supabase/config.toml` (confirmação, validade do link,
retornos, templates e hook). Para produção, o mesmo arquivo tem o bloco `[remotes.production]`, que
sobrescreve só `site_url`, os retornos, o SMTP e o limite de e-mails (ADR 0019). A CLI só aplica o
bloco quando o `project_id` dele é o ref do projeto ligado por `supabase link`, e o `config push`
imprime `Loading config override: [remotes.production]` quando isso acontece. Sem essa linha, o push
subiu a configuração local: pare e confira o ref.

**Antes de começar**, tenha em mãos:

- O projeto Supabase de produção (ref em Project Settings > General).
- Uma conta na Brevo, com um remetente verificado (Senders & IP) e uma chave SMTP
  (SMTP & API > SMTP). Anote o usuário e a chave: a chave aparece uma vez.
- Uma conta na Vercel ligada ao repositório do GitHub.

**Passo a passo, nesta ordem:**

1. **Vercel.** Importe o repositório. Em Settings > Environment Variables, só no ambiente
   Production, crie `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e
   `GEMINI_API_KEY` (`GEMINI_MODEL` é opcional). A chave `secret` do Supabase não vai para a
   Vercel. Faça o deploy e anote a URL (`https://<app>.vercel.app`): ela só existe depois dele.
2. **Marcadores do `config.toml`.** No bloco `[remotes.production]`, troque `[REF DO PROJETO]`,
   `[URL DA VERCEL]` (3 ocorrências, sem o `https://`) e `[REMETENTE VERIFICADO NA BREVO]`. Faça o
   commit: o ref e a URL são públicos, mas a chave SMTP nunca entra no arquivo.
3. **`pg_cron`.** Em Database > Extensions do painel, habilite `pg_cron`. Ele roda a limpeza de
   conta não confirmada (7 dias, ADR 0003) e a chamada da limpeza de comprovantes.
4. **CLI.** Com a chave da Brevo só no seu terminal:

   ```bash
   export BREVO_SMTP_USER=<usuário da Brevo>
   export BREVO_SMTP_KEY=<chave SMTP da Brevo>
   pnpm exec supabase link --project-ref <ref>
   pnpm exec supabase db push        # migrations
   pnpm exec supabase config push    # config.toml, bloco de produção
   ```

   O `config push` mostra o que vai mudar e pergunta antes de aplicar. Confira a linha
   `Loading config override`.

5. **Limpeza dos comprovantes.** Siga "No projeto remoto" em [Limpeza dos comprovantes](#limpeza-dos-comprovantes)
   (deploy da função, `LIMPEZA_SEGREDO` e os dois segredos do Vault).
6. **Confira o job.** No SQL Editor do painel:

   ```sql
   select jobname, schedule, active from cron.job;
   ```

   `apagar-contas-nao-confirmadas` precisa aparecer com `active = true`.

**Teste depois de subir**, na URL da Vercel:

- O cadastro com `@gmail.com` falha com 403, e o de `@aluno.ifce.edu.br` cria a conta.
- O e-mail de confirmação chega em português. Olhe também a caixa de spam: sem domínio próprio, a
  Brevo pode cair lá (ADR 0019). O link abre `/confirme-email` no endereço da Vercel, e não em
  `localhost`.
- A leitura automática de um comprovante responde. A rota confere o `Origin` contra o `Host`, e é aqui
  que um endereço errado apareceria como 403.

Se mudar a URL da Vercel (domínio próprio, por exemplo), atualize o bloco `[remotes.production]` e
repita o `config push`: os links dos e-mails saem com o `site_url`.

## Scripts

| Comando          | O que faz                   |
| ---------------- | --------------------------- |
| `pnpm dev`       | servidor de desenvolvimento |
| `pnpm build`     | build de produção           |
| `pnpm lint`      | ESLint                      |
| `pnpm typecheck` | TypeScript                  |
| `pnpm test`      | Vitest                      |
| `pnpm format`    | Prettier                    |

Os comandos `pnpm db:*` estão na seção [Banco local](#banco-local).

## Documentação

[`doc/`](doc/) reúne arquitetura, convenções e o modelo de ADR para mudar regras, e
[`.claude/CLAUDE.md`](.claude/CLAUDE.md) é o roteador por tarefa.

## Licença

[MIT](LICENSE).
