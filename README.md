# SAACI Web

Aplicação web do SAACI, Sistema de Apoio Acadêmico Colaborativo do IFCE. Ajuda o aluno a entender
as regras de atividades complementares, registrar comprovantes e acompanhar as horas antes de
enviar o pedido à coordenação. Visão e requisitos estão no repositório `SAACI-produto`.

> Fase atual: só front. O app começa vazio: crie a conta, confirme o e-mail pelo painel "Mock"
> (só em desenvolvimento) e registre os certificados. Tudo fica no localStorage do navegador; das
> fotos de comprovante fica uma cópia reduzida, e dos PDFs só o nome e o tamanho.

## Stack

Next.js, Panda CSS, TanStack Query, React Hook Form e Valibot. Detalhes em
[`doc/tecnologia.md`](doc/tecnologia.md).

## Como rodar

Pré-requisitos: Node 22 (`nvm use`) e pnpm (`corepack enable pnpm`). O projeto não usa npm: `npm i`
no Node 20 é recusado pelo `.npmrc`, e no Node 22 bagunça o `node_modules` do pnpm.

```bash
nvm use
pnpm install
pnpm dev
```

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

[`doc/`](doc/) reúne arquitetura, convenções e decisões, e
[`.claude/CLAUDE.md`](.claude/CLAUDE.md) é o roteador por tarefa.

## Licença

[MIT](LICENSE).
