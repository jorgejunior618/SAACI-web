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
cp .env.example .env.local
pnpm dev
```

Preencha o `.env.local` antes de rodar, como mostra a seção [Supabase](#supabase). Hoje as telas
ainda leem dados de mock, então o app abre mesmo com as variáveis vazias. O backend entra por
domínio, em issues separadas.

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
   cp .env.example .env.local
   ```

   | Variável                               | Valor           |
   | -------------------------------------- | --------------- |
   | `NEXT_PUBLIC_SUPABASE_URL`             | Project URL     |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key |

5. Confira que o git ignora o arquivo: `git status` não deve listar o `.env.local`.

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
à parte. Só quem for mexer no banco precisa do [Docker](https://www.docker.com/products/docker-desktop/)
aberto; o app com mock roda sem ele.

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
[Supabase](#supabase)). Sem elas, o app com mock abre normalmente, e só a criação de um cliente
falha, com a mensagem do que preencher.

### Levar o Auth para produção

Nada é feito à mão no painel: o que vale no banco local está em `supabase/migrations/` (funções, gatilho
e limpeza de conta) e em `supabase/config.toml` (confirmação, validade do link, retornos, templates e
hook). Com o projeto de produção criado:

```bash
pnpm exec supabase link --project-ref <ref>
pnpm exec supabase db push        # migrations
pnpm exec supabase config push    # config.toml
```

Antes de subir:

- **`site_url` e `additional_redirect_urls`** do `config.toml` apontam para `127.0.0.1`. Em produção
  precisam da URL real, com `/confirme-email` e `/nova-senha`. Não confirmado: o jeito de manter dois
  ambientes no mesmo arquivo (bloco `[remotes.<nome>]`) deve ser conferido na documentação da CLI.
- **SMTP próprio.** O SMTP padrão do Supabase só serve para teste e limita os envios por hora, o que
  trava o cadastro com a confirmação obrigatória.
- **`pg_cron` habilitado** no projeto, para a limpeza de conta não confirmada (7 dias, ADR 0003).

Depois de subir, repita o teste da regra de domínio: o signup com `@gmail.com` precisa falhar com 403,
e o de `@aluno.ifce.edu.br` precisa criar a conta.

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
