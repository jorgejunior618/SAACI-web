# Estrutura de pastas

Os itens marcados com `alvo` ainda não existem e entram com a integração do Supabase.

```
SAACI-web/
├── .claude/CLAUDE.md
├── doc/                          documentação técnica; adr/ tem o modelo de ADR
├── scripts/                      check-adr.mjs, chamado pelo hook de commit
├── supabase/                     banco local (config.toml, seed.sql)
│   ├── migrations/               DDL, RLS e RPCs, versionado
│   ├── tests/database/           testes pgTAP
│   └── functions/<nome>/index.ts Edge Function em Deno, chamada pelo pg_cron (ADR 0011)
├── tests/                        testes de regra do repositório inteiro
├── panda.config.ts
└── src/
    ├── proxy.ts                  alvo: refresh de sessão e rota protegida
    ├── app/                      rota, layout, prefetch. Nada mais
    │   ├── (<grupo>)/<rota>/     page.tsx, loading.tsx, error.tsx
    │   └── api/<tema>/<ação>/    route.ts: Route Handler, só para segredo (ADR 0016)
    │
    ├── features/                 UI e lógica de tela
    │   └── <dominio>/
    │       ├── _components/<Componente>/{index.tsx,styles.ts}   de 2+ telas do domínio
    │       └── <Tela>/
    │           ├── index.tsx  styles.ts  types.ts  schema.ts
    │           ├── Loading.tsx  Error.tsx  Empty.tsx
    │           └── _components/<Componente>/{index.tsx,styles.ts}
    │
    ├── components/<Componente>/  2+ telas E lógica além de UI
    ├── services/<dominio>/       fronteira com a origem do dado
    │   ├── <dominio>.{keys,queries,api,mutations,mock,types,errors}.ts
    │   └── index.ts
    ├── @supabase/                alvo: client.ts, server.ts, database.types.ts
    ├── @design-system/           tokens, atoms, molecules, organisms, templates
    ├── providers/                QueryProvider/ (index.tsx, query-client.ts)
    ├── hooks/                    hooks globais
    ├── utils/                    puros, sem rede
    ├── constants/
    └── styled-system/            gerado pelo Panda, fora do git
```

Não existe `SupabaseProvider`: os clientes são funções de `@supabase/`, não contexto.

## Onde criar

| Vou criar                                | Vai em                                                     |
| ---------------------------------------- | ---------------------------------------------------------- |
| Rota nova                                | `app/<grupo>/<rota>/page.tsx`, só importando a feature     |
| Route Handler (só para segredo)          | `app/api/<tema>/<ação>/route.ts`, fino, chamando o service |
| Tela                                     | `features/<dominio>/<Tela>/index.tsx`                      |
| Sub-componente de uma tela só            | `features/<dominio>/<Tela>/_components/<Componente>/`      |
| Componente de 2+ telas do mesmo domínio  | `features/<dominio>/_components/<Componente>/`             |
| Componente puro de UI, em 2+ telas       | `@design-system/<nível>/`                                  |
| Componente com lógica, em 2+ telas/rotas | `components/<Componente>/`                                 |
| Leitura de dado                          | `services/<dominio>/<dominio>.api.ts`                      |
| Escrita de dado (alvo: chamada de RPC)   | `services/<dominio>/<dominio>.mutations.ts`                |
| Dado de exemplo de um domínio            | `services/<dominio>/<dominio>.mock.ts`                     |
| Schema Valibot de formulário             | `schema.ts` ao lado do `index.tsx`                         |
| Schema de formulário de 2+ domínios      | `src/utils/<nome>.ts`, com teste (ADR 0014)                |
| Schema Valibot do domínio                | `services/<dominio>/<dominio>.types.ts`                    |
| Migration ou função SQL                  | `supabase/migrations/`                                     |
| Rotina agendada que usa a API do Storage | `supabase/functions/<nome>/index.ts` (Deno)                |
| Helper puro de uma tela                  | `utils.ts` ao lado do `index.tsx`                          |
| Helper puro usado em 2+ lugares          | `src/utils/`                                               |

## Domínios

Um domínio tem nome em português em `features/` (vocabulário da tela) e em inglês em `services/`
(`features/atividades/` fala com `services/activities/`). A exceção são os domínios que só **compõem**.
Uma tela de painel ou de formulário não tem `services/dashboard/`, porque não tem dado próprio: lê
`progress`, `activities` e `rules`, que já respondem por esses números. Um service aqui inventaria
um segundo dono para um dado que já tem dono, e a primeira divergência apareceria quando alguém
corrigisse o total em um lugar e não na cópia (RNF20).

O critério vale para qualquer tela: **feature sem service quando ela só compõe; service novo quando a
métrica é deliberadamente diferente.**

## Grupos de rota

Grupo de rota separa telas por estado de sessão (por exemplo, sem sessão e com sessão), cada um com
um `SessionGate` no modo certo. Quem chega no grupo errado é levado para o lugar certo. Grupos novos
(confirmação de e-mail, curso) entram junto com as telas que os pedem.

`(conta)` reúne as telas da conta que valem com ou sem curso, com `SessionGate mode="account"` (hoje, Excluir conta). `app/conta-apagada/` fica fora dos grupos, por exceção nomeada em `arquitetura.md` (ADR 0007).

## Arquivos de convenção do Next

| Arquivo         | Onde mora                                               |
| --------------- | ------------------------------------------------------- |
| `page.tsx`      | toda rota, com `export const metadata` do título da aba |
| `loading.tsx`   | rota que suspende, reexporta o `Loading` da feature     |
| `error.tsx`     | um por grupo, reexportando `components/ErrorScreen`     |
| `not-found.tsx` | raiz, um por grupo e um por entidade (abaixo)           |

`notFound()` sobe até o `not-found.tsx` mais próximo, então a **posição do arquivo** diz o que não
foi encontrado: na raiz, URL sem rota; no grupo, rede de segurança; na entidade (`atividades/[id]/`),
o item que não existe, com volta para a lista. Os três reusam `components/NotFoundScreen`. Só o da
raiz pode ter `metadata`: num segmento o `<title>` da página já foi enviado quando `notFound()` roda.

## Aliases

```ts
"@/*"            → src/*
"@design-system" → src/@design-system
"@supabase"      → src/@supabase        // alvo
```

## Regras

- `components/` contra `@design-system`: os dois servem componente usado em 2+ lugares, mas
  `@design-system` é UI pura e nunca importa `services/`, `features/`, `next/navigation` nem
  `@supabase`. `components/` é para quem tem lógica (chama `services/`, decide navegação).
- Feature importa `@/services/<dominio>`, nunca um arquivo interno do domínio (ESLint garante).
- Feature não importa `supabase-js`; só `services/`.
- `app/` nunca contém componente de UI, estilo ou regra de negócio.
- Arquivo interno de um módulo não importa do `index.ts` do próprio módulo.
- Pasta auxiliar tem underscore e plural: `_components/`, `_hooks/`.
- Máximo 2 níveis dentro de um domínio: `<dominio>/<Tela>/` ou `<dominio>/_components/` (ADR 0005).
- Componente em `_components/` é pasta com `index.tsx` e `styles.ts` próprio, nunca `.tsx` solto.
- O `styles.ts` da tela guarda só o que a tela usa. Estilo que dois irmãos dividem é definido em
  cada um: um `_components/` que importa `../../styles` volta a acoplar o que a pasta separou.
