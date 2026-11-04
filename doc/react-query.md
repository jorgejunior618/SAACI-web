# TanStack Query

## Chaves e definição

Chave é hierárquica, criada por factory em `<dom>.keys.ts`, nunca escrita à mão na tela. A
definição da query é declarada uma vez em `<dom>.queries.ts` e usada nos dois lados: duplicar
`queryKey` entre prefetch e `useQuery` é a origem mais comum de cache que não invalida.

## Primeira carga

> Fase mock: a sessão e os dados moram no navegador, então as páginas não fazem prefetch no
> servidor. O `SessionGate` só monta a área logada no navegador, e as telas usam
> `useSuspenseQuery` com o `Loading` da feature. O molde abaixo volta quando houver backend.

Molde de toda página que busca dado:

```tsx
// app/(aluno)/atividades/page.tsx
export default async function AtividadesPage(): Promise<ReactNode> {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery(atividadesQueries.list())

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Loading />}>
        <ListaAtividades />
      </Suspense>
    </HydrationBoundary>
  )
}
```

```tsx
// features/atividades/ListaAtividades/index.tsx
'use client'
const { data } = useSuspenseQuery(atividadesQueries.list())
```

`Date` e `undefined` não sobrevivem ao `dehydrate`, por isso o tipo de domínio usa `string`.

A instância de servidor nunca é variável de módulo: ela viveria entre requisições de alunos
diferentes, e o dado de um apareceria para outro quando houver backend. `getQueryClient()` usa
`React.cache()`, que memoiza por requisição.

## `useSuspenseQuery` ou `useQuery`

| Situação                                 | Hook                               |
| ---------------------------------------- | ---------------------------------- |
| Lista ou detalhe que a página prefetcha  | `useSuspenseQuery`                 |
| Duas ou mais queries no mesmo componente | `useSuspenseQueries`               |
| Busca, filtro ou paginação               | `useQuery`, com o porquê comentado |
| Query condicional                        | dividir o componente               |

`useQuery` devolve `data: undefined` quando a busca falha, e com `= []` ao lado uma falha de rede
vira lista vazia: a tela diria "registre sua primeira atividade" para quem já tem trinta.
`useSuspenseQuery` lança, e o `error.tsx` mostra como erro.

`useSuspenseQuery` não aceita `enabled` nem `placeholderData`. Quando o mesmo componente serve
cadastro e edição, ele se divide em dois, o que também evita `defaultValues` do React Hook Form
congelar vazio.

## Invalidação

Cada domínio exporta a própria rotina, e a tela só a chama:

```ts
export function invalidateAfterAtividadeWrite(qc: QueryClient): void {
  qc.invalidateQueries({ queryKey: atividadesKeys.all })
  // progressoKeys.all entra quando o domínio existir
}
```

A régua: derruba o que uma escrita torna falso, e só isso. Toda escrita em atividade torna falso
o progresso do painel, do resumo e do formulário.

Import de chave entre domínios é direto do módulo (`.../x.keys`), nunca do barrel: os barrels
reexportam mutations, e isso fecharia um ciclo.

## staleTime

Constantes em `src/constants/cache.ts`, não números soltos.

| Natureza do dado          | `STALE_TIME`        |
| ------------------------- | ------------------- |
| Regra do curso, cadastro  | `cadastro`: 5 min   |
| Lista operacional         | `operacional`: 30 s |
| Horas computadas e totais | `calculo`: 0        |

## Regras

- `queryFn` sempre vem do service.
- Tela com suspense exige `<Suspense fallback={<Loading />}>` e `error.tsx` no grupo de rota.
- Invalidação sempre pela rotina do domínio.
- Atualização otimista só em operação reversível, nunca em total de horas.
