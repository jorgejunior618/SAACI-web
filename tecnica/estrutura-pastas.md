# Estrutura de pastas

```
sistema/
├── .claude/
│   └── CLAUDE.md
├── doc/
├── supabase/
│   ├── migrations/               DDL + RPCs, versionado
│   └── seed.sql
├── panda.config.ts
└── src/
    ├── proxy.ts                  refresh de sessão (era `middleware.ts` na
    │                             raiz — Next 16 depreciou esse nome e exige
    │                             `src/proxy.ts` quando `src/` existe)
    ├── app/                      rota, layout, prefetch. Nada mais
    │   ├── (auth)/login/
    │   ├── (dono)/
    │   │   ├── layout.tsx
    │   │   ├── inicio/  pedidos/  pagamentos/  clientes/
    │   │   ├── contas-a-receber/  catalogo/  despesas/
    │   │   └── relatorios/  configuracoes/
    │   ├── (funcionario)/
    │   │   ├── layout.tsx
    │   │   └── inicio/  pedidos/
    │   └── api/
    │       ├── assistente/route.ts
    │       └── backup/route.ts
    │
    ├── features/                 UI e lógica de tela
    │   └── <dominio>/
    │       └── <Tela>/
    │           ├── index.tsx
    │           ├── styles.ts
    │           ├── types.ts
    │           ├── schema.ts
    │           ├── Loading.tsx
    │           ├── Error.tsx
    │           └── _components/
    │               └── <Componente>/   uma pasta por componente
    │                   ├── index.tsx
    │                   └── styles.ts   só o que é dele
    │
    ├── components/                compartilhado entre 2+ telas/rotas E com
    │   └── <Componente>/          lógica além de UI (fala com services/,
    │       └── index.tsx          utils/, constants/) — ver "Onde criar"
    │
    ├── services/                 fronteira com o backend
    │   └── <dominio>/
    │       ├── <dominio>.keys.ts
    │       ├── <dominio>.queries.ts
    │       ├── <dominio>.api.ts
    │       ├── <dominio>.mutations.ts
    │       ├── <dominio>.types.ts
    │       └── index.ts
    │
    ├── @supabase/
    │   ├── client.ts             browser
    │   ├── server.ts             server, com cookies
    │   ├── middleware.ts
    │   ├── database.types.ts     gerado por CLI
    │   ├── auth/
    │   └── index.ts
    │
    ├── @design-system/
    │   ├── tokens/
    │   ├── atoms/  molecules/  organisms/  templates/
    │   ├── DS_REFERENCE.md
    │   └── index.ts
    │
    ├── providers/                não existe SupabaseProvider: os clientes
    │   ├── query-client/         são funções de @supabase/, não contexto
    │   └── QueryProvider/
    │
    ├── hooks/                    hooks globais
    ├── utils/                    puros, sem rede
    │   └── tests/                asserções reusadas entre testes
    └── constants/
```

## Onde criar

| Vou criar                                | Vai em                                                 |
| ---------------------------------------- | ------------------------------------------------------ |
| Rota nova                                | `app/<grupo>/<rota>/page.tsx`, só importando a feature |
| Tela                                     | `features/<dominio>/<Tela>/index.tsx`                  |
| Sub-componente de uma tela só            | `features/<dominio>/<Tela>/_components/<Componente>/`  |
| Componente puro de UI, em 2+ telas       | `@design-system/<nível>/`                              |
| Componente com lógica, em 2+ telas/rotas | `components/<Componente>/`                             |
| Função que fala com o banco              | `services/<dominio>/<dominio>.api.ts`                  |
| Chamada de RPC                           | `services/<dominio>/<dominio>.mutations.ts`            |
| Schema Valibot de formulário             | `schema.ts` ao lado do `index.tsx`                     |
| Schema Valibot de resposta do banco      | `services/<dominio>/<dominio>.types.ts`                |
| Migration ou função SQL                  | `supabase/migrations/`                                 |
| Helper puro de uma tela                  | `utils.ts` ao lado do `index.tsx`                      |
| Helper puro usado em 2+ lugares          | `src/utils/`                                           |
| Asserção de teste reusada entre telas    | `src/utils/tests/`                                     |

## Domínios

`pedidos` · `pagamentos` · `clientes` · `extrato-cliente` · `contas-a-receber`
· `catalogo` · `despesas` · `relatorios` · `fechamento` · `configuracoes`
· `inicio`

O mesmo nome vale em `features/` e em `services/` — com uma exceção
declarada, `inicio`.

### `inicio` existe só em `features/`

As duas telas de abertura (`InicioDono`, `InicioFuncionario`) não têm
`services/inicio/`, e não é omissão: elas não têm dado próprio. A Home é
**composição** — lê `relatorios`, `contas-a-receber` e `pedidos`, que já
respondem por esses números para as telas que os detalham.

Um domínio de serviço aqui inventaria um quarto dono para dado que já tem
dono, e a primeira divergência apareceria quando alguém corrigisse o "a
receber" em Contas a receber e não na cópia da Home.

O critério vale para qualquer tela futura de painel: **feature sem service
quando ela só compõe; service novo quando a métrica é deliberadamente
diferente** — que foi o que criou `contas-a-receber`, `extrato-cliente` e
`fechamento`.

`extrato-cliente` é feature própria, consumida por 3 telas — nunca recriada dentro delas.

`fechamento` (Fase 15) é domínio próprio pelo critério que já criou
`contas-a-receber` e `extrato-cliente`: **métrica deliberadamente
diferente**. Ele lê `despesas`, `pagamentos`, `pedidos` e
`pagamento_pedidos`, mas não cabe em nenhum deles sem passar a significar
outra coisa — e conta a saída por `mes_competencia`, enquanto `relatorios`
conta por `data_despesa`. Nasceu só com leitura: sem `mutations` e sem
`errors`, como `relatorios`.

## Grupos de rota

| Grupo           | Shell                                      |
| --------------- | ------------------------------------------ |
| `(auth)`        | sem navegação                              |
| `(dono)`        | navegação lateral, desktop, densidade alta |
| `(funcionario)` | mobile, ação dominante                     |

## Arquivos de convenção do Next

| Arquivo         | Onde mora                                               |
| --------------- | ------------------------------------------------------- |
| `page.tsx`      | toda rota, com `export const metadata` do título da aba |
| `loading.tsx`   | rota que suspende — reexporta o `Loading` da feature    |
| `error.tsx`     | um por grupo, reexportando `components/ErroDeTela`      |
| `not-found.tsx` | ver abaixo                                              |

### `not-found.tsx`: um por grupo e um por entidade

`notFound()` não carrega dado — ele sobe até o `not-found.tsx` mais
próximo, e é a **posição do arquivo na árvore** que diz o que não foi
encontrado.

- **Raiz** (`app/`): URL que não casa com rota nenhuma. Sem shell, porque
  quem cai ali pode não ter sessão. É o **único** cujo `metadata` vale.
- **Por grupo** (`(dono)/`, `(funcionario)/`): rede de segurança, dentro do
  shell.
- **Por entidade** (`despesas/[id]/`, `pedidos/[numero]/`, …): nomeia o que
  não existe e volta para a **lista** daquela entidade. Cobre as rotas
  filhas do segmento — o de `[numero]/` serve `[numero]/editar/` também.

Os três reusam `components/TelaNaoEncontrada`; o arquivo de rota só passa
o texto e o destino.

**Metadata em `not-found.tsx` de segmento não funciona** e por isso não é
escrita: quando `notFound()` é lançado de dentro de uma página, o `<title>`
daquela página já foi resolvido e enviado. Medido em 14/08/2026.

## Aliases

```ts
"@/*"              → src/*
"@design-system"   → src/@design-system
"@supabase"        → src/@supabase
```

## Regras

- Critério de `components/` vs. `@design-system`: os dois servem componente
  usado em 2+ lugares, mas `@design-system` é UI pura, sem rede — nunca
  importa `services/` nem `@supabase`. `components/` é para quem tem lógica
  de verdade (chama `services/`, decide navegação) e não é puramente visual.
- `app/` nunca contém componente de UI, estilo ou regra de negócio.
- Arquivo interno de um módulo não importa do `index.ts` do próprio módulo.
- Feature não importa `supabase-js`; só `services/`.
- Pasta auxiliar tem underscore e plural: `_components/`, `_hooks/`.
- Máximo 2 níveis dentro de um domínio: `<dominio>/<Tela>/`.
- Componente em `_components/` é pasta com `index.tsx` e `styles.ts` próprio,
  nunca `.tsx` solto — o import de quem consome (`./_components/<Nome>`) não
  muda, e o estilo passa a nascer junto do componente em vez de engordar o
  `styles.ts` da tela.
- O `styles.ts` da tela guarda só o que a tela usa. Estilo que dois irmãos
  dividem é definido em cada um: um `_components/` que importa `../../styles`
  volta a acoplar o que a pasta separou.
