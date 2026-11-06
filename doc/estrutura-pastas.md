# Estrutura de pastas

Os itens marcados com `alvo` ainda não existem e entram com a integração do Supabase.

```
SAACI-web/
├── .claude/CLAUDE.md
├── doc/                          adr/0000-modelo.md é o modelo de ADR
├── scripts/                      check-adr.mjs, chamado pelo hook de commit
├── supabase/                     alvo
│   └── migrations/               DDL, RLS e RPCs, versionado
├── tests/                        testes de regra do repositório inteiro
├── panda.config.ts
└── src/
    ├── proxy.ts                  alvo: refresh de sessão e rota protegida
    ├── app/                      rota, layout, prefetch. Nada mais
    │   ├── (auth)/               login
    │   └── (aluno)/              / (página pós-login, provisória)
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
    │           ├── Empty.tsx
    │           └── _components/
    │               └── <Componente>/   uma pasta por componente
    │                   ├── index.tsx
    │                   └── styles.ts   só o que é dele
    │
    ├── components/               compartilhado entre 2+ telas/rotas E com
    │   └── <Componente>/         lógica além de UI (fala com services/,
    │       └── index.tsx         utils/, constants/). Ver "Onde criar"
    │
    ├── services/                 fronteira com a origem do dado
    │   └── <dominio>/
    │       ├── <dominio>.keys.ts
    │       ├── <dominio>.queries.ts
    │       ├── <dominio>.api.ts
    │       ├── <dominio>.mutations.ts
    │       ├── <dominio>.mock.ts      sai quando o domínio migra
    │       ├── <dominio>.types.ts
    │       ├── <dominio>.errors.ts    quando houver a primeira tradução
    │       └── index.ts
    │
    ├── @supabase/                alvo
    │   ├── client.ts             navegador
    │   ├── server.ts             servidor, com cookies
    │   ├── database.types.ts     gerado por CLI
    │   └── index.ts
    │
    ├── @design-system/
    │   ├── tokens/
    │   ├── atoms/  molecules/  organisms/  templates/   (AppFrame, Screen)
    │   ├── DS_REFERENCE.md
    │   └── index.ts
    │
    ├── providers/                não existe SupabaseProvider: os clientes
    │   ├── query-client/         são funções de @supabase/, não contexto
    │   ├── QueryProvider/
    │   ├── theme/                tema claro, escuro ou automático
    │   └── ThemeSync/
    │
    ├── hooks/                    hooks globais
    ├── utils/                    puros, sem rede
    ├── constants/
    └── styled-system/            gerado pelo Panda, fora do git
```

Pasta `utils/tests/` (asserção reusada entre testes) nasce quando a primeira asserção for reusada
por duas telas. Antes disso não existe.

## Onde criar

| Vou criar                                | Vai em                                                 |
| ---------------------------------------- | ------------------------------------------------------ |
| Rota nova                                | `app/<grupo>/<rota>/page.tsx`, só importando a feature |
| Tela                                     | `features/<dominio>/<Tela>/index.tsx`                  |
| Sub-componente de uma tela só            | `features/<dominio>/<Tela>/_components/<Componente>/`  |
| Componente puro de UI, em 2+ telas       | `@design-system/<nível>/`                              |
| Componente com lógica, em 2+ telas/rotas | `components/<Componente>/`                             |
| Leitura de dado                          | `services/<dominio>/<dominio>.api.ts`                  |
| Escrita de dado (alvo: chamada de RPC)   | `services/<dominio>/<dominio>.mutations.ts`            |
| Dado de exemplo de um domínio            | `services/<dominio>/<dominio>.mock.ts`                 |
| Schema Valibot de formulário             | `schema.ts` ao lado do `index.tsx`                     |
| Schema Valibot do domínio                | `services/<dominio>/<dominio>.types.ts`                |
| Migration ou função SQL (alvo)           | `supabase/migrations/`                                 |
| Helper puro de uma tela                  | `utils.ts` ao lado do `index.tsx`                      |
| Helper puro usado em 2+ lugares          | `src/utils/`                                           |

## Domínios

Hoje existem só os domínios do login. Os demais voltam quando cada tela for construída e validada
pela equipe.

| Domínio        | `features/`    | `services/` | Responde por                    |
| -------------- | -------------- | ----------- | ------------------------------- |
| `autenticacao` | sim (`Login`)  | `conta`     | entrar, sair e sessão           |
| `inicio`       | sim (`Inicio`) | não         | página pós-login, só com o Sair |
| `atividades`   | a criar        | a criar     | registro e comprovante          |
| `painel`       | a criar        | não         | composição do progresso         |
| `formulario`   | a criar        | não         | composição do progresso         |
| `perfil`       | a criar        | a criar     | curso e semestre                |
| `regras`       | não            | a criar     | categorias, conversão, limites  |
| `progresso`    | não            | a criar     | cálculo único de horas (RNF20)  |

O mesmo nome vale em `features/` e em `services/`, com uma exceção declarada: os domínios que só
compõem.

### `painel` e `formulario` existem só em `features/`

As telas de painel e de formulário não têm `services/painel/` nem `services/formulario/`, e não é
omissão: elas não têm dado próprio. São **composição**: leem `progresso`, `atividades` e `regras`,
que já respondem por esses números para as telas que os detalham.

Um domínio de serviço aqui inventaria um segundo dono para um dado que já tem dono, e a primeira
divergência apareceria quando alguém corrigisse o total em `progresso` e não na cópia do painel
(RNF20).

O critério vale para qualquer tela futura: **feature sem service quando ela só compõe; service novo
quando a métrica é deliberadamente diferente.** É por esse critério que `progresso` tem service
próprio: ele responde pelo cálculo de horas que painel, resumo e formulário compartilham.

## Grupos de rota

| Grupo     | Sessão (`SessionGate`, modo) | Barra inferior |
| --------- | ---------------------------- | -------------- |
| `(auth)`  | só sem sessão (`visitante`)  | não            |
| `(aluno)` | com sessão (`aluno`)         | não, por ora   |

Quem chega no grupo errado vai para o lugar certo: Entrar ou Início (`destinoDaSessao`). Grupos e
modos novos (confirmação de e-mail, curso, tarefa) entram junto com as telas que os pedem.

## Arquivos de convenção do Next

| Arquivo         | Onde mora                                               |
| --------------- | ------------------------------------------------------- |
| `page.tsx`      | toda rota, com `export const metadata` do título da aba |
| `loading.tsx`   | rota que suspende, reexporta o `Loading` da feature     |
| `error.tsx`     | um por grupo, reexportando `components/ErroDeTela`      |
| `not-found.tsx` | ver abaixo                                              |

### `not-found.tsx`: um por grupo e um por entidade

`notFound()` não carrega dado. Ele sobe até o `not-found.tsx` mais próximo, e é a **posição do
arquivo na árvore** que diz o que não foi encontrado.

- **Raiz** (`app/`): URL que não casa com rota nenhuma. Sem sessão, porque quem cai ali pode não
  ter. É o **único** cujo `metadata` vale.
- **Por grupo** (`(aluno)/`): rede de segurança, dentro da moldura do app.
- **Por entidade** (`atividades/[id]/`): nomeia o que não existe e volta para a **lista** daquela
  entidade. Cobre as rotas filhas do segmento: o de `[id]/` serve `[id]/corrigir/` também.

Os três reusam `components/TelaNaoEncontrada`. O arquivo de rota só passa o texto e o destino.

**Metadata em `not-found.tsx` de segmento não funciona** e por isso não é escrita: quando
`notFound()` é lançado de dentro de uma página, o `<title>` daquela página já foi resolvido e
enviado.

## Aliases

```ts
"@/*"            → src/*
"@design-system" → src/@design-system
"@supabase"      → src/@supabase        // alvo
```

## Regras

- Critério de `components/` contra `@design-system`: os dois servem componente usado em 2+ lugares,
  mas `@design-system` é UI pura, sem rede, e nunca importa `services/`, `features/`,
  `next/navigation` nem `@supabase`. `components/` é para quem tem lógica de verdade (chama
  `services/`, decide navegação) e não é puramente visual.
- Feature importa `@/services/<dominio>`, nunca um arquivo interno do domínio (ESLint garante).
- Feature não importa `supabase-js`; só `services/`.
- `app/` nunca contém componente de UI, estilo ou regra de negócio.
- Arquivo interno de um módulo não importa do `index.ts` do próprio módulo.
- Pasta auxiliar tem underscore e plural: `_components/`, `_hooks/`.
- Máximo 2 níveis dentro de um domínio: `<dominio>/<Tela>/`.
- Componente em `_components/` é pasta com `index.tsx` e `styles.ts` próprio, nunca `.tsx` solto. O
  import de quem consome (`./_components/<Nome>`) não muda, e o estilo passa a nascer junto do
  componente em vez de engordar o `styles.ts` da tela.
- O `styles.ts` da tela guarda só o que a tela usa. Estilo que dois irmãos dividem é definido em
  cada um: um `_components/` que importa `../../styles` volta a acoplar o que a pasta separou.
