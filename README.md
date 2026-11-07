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

## Scripts

| Comando          | O que faz                   |
| ---------------- | --------------------------- |
| `pnpm dev`       | servidor de desenvolvimento |
| `pnpm build`     | build de produção           |
| `pnpm lint`      | ESLint                      |
| `pnpm typecheck` | TypeScript                  |
| `pnpm test`      | Vitest                      |
| `pnpm format`    | Prettier                    |

## Documentação

[`doc/`](doc/) reúne arquitetura, convenções e o modelo de ADR para mudar regras, e
[`.claude/CLAUDE.md`](.claude/CLAUDE.md) é o roteador por tarefa.

## Licença

[MIT](LICENSE).
