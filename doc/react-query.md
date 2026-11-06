# TanStack Query

## Chaves

Chave é hierárquica, criada por factory em `<dom>.keys.ts`. Nunca escrita à mão na tela.

```ts
// atividades.keys.ts (ilustrativo; o exemplo real é conta.keys.ts)
export const atividadesKeys = {
  all: ['atividades'] as const,
  lists: () => [...atividadesKeys.all, 'list'] as const,
  list: (f: AtividadesFiltros) => [...atividadesKeys.lists(), f] as const,
  details: () => [...atividadesKeys.all, 'detail'] as const,
  detail: (id: string) => [...atividadesKeys.details(), id] as const,
}
```

A hierarquia permite invalidar no nível certo: derrubar todas as listagens sem tocar nos detalhes, ou
derrubar o domínio inteiro.

## Definição de query

Declarada uma vez em `<dom>.queries.ts`, usada no servidor e no cliente.

```ts
// conta.queries.ts (existe)
export const contaQueries = {
  sessao: () =>
    queryOptions({
      queryKey: contaKeys.sessao(),
      queryFn: getSessao,
      staleTime: STALE_TIME.cadastro,
    }),
}
```

Duplicar `queryKey` entre prefetch e `useQuery` é a origem mais comum de cache que não invalida. Por
isso a definição é única.

## Primeira carga

> Fase mock: a sessão e os dados moram na memória do navegador, então as páginas não fazem prefetch
> no servidor. O `SessionGate` só monta a área logada no navegador, e as telas usam
> `useSuspenseQuery` com o `Loading` da feature. O molde abaixo vale quando houver Supabase.

Molde de **toda** página que busca dado. As linhas do corpo são sempre as mesmas; só muda a query e a
feature:

```tsx
// app/(aluno)/atividades/page.tsx   (alvo)
export default async function AtividadesPage(): Promise<ReactNode> {
  const db = await createClient() // cliente de SERVIDOR, explícito
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery(atividadesQueries.list(filtros, db))

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
const { data } = useSuspenseQuery(atividadesQueries.list(filtros))
```

Por que cada peça existe:

| Peça                              | Papel                                                                                                                                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `createClient()` de servidor      | Passado **explícito** para a query. Omitir cairia no padrão da assinatura, que é o cliente do navegador, e ele não enxerga o cookie no servidor: a busca voltaria vazia, sem erro nenhum.        |
| `getQueryClient()`                | O cache. No servidor, uma instância **por requisição** (`React.cache()`); no navegador, um singleton preguiçoso.                                                                                 |
| `await prefetchQuery`             | Bloqueia de propósito: é o que garante que o HTML já saia com o dado. É por causa do `await` que o `useSuspenseQuery` abaixo **não** suspende na primeira pintura.                               |
| `dehydrate` + `HydrationBoundary` | Serializa o cache em JSON e o reinjeta no navegador antes do primeiro render. Só viaja query em estado de sucesso, e `Date`/`undefined` não sobrevivem: por isso o tipo de domínio usa `string`. |
| `<Suspense>`                      | Rede de segurança, não caminho normal: com o cache hidratado ele nunca aparece. Entra quando o prefetch falha ou numa navegação client-side, e é o que dispensa estado de carregamento na tela.  |

O `fallback` é o `Loading.tsx` da própria feature, ao lado do `Empty.tsx`, e não um spinner
genérico.

`getQueryClient()` mora em `src/providers/query-client/` e não dentro do `QueryProvider`: quem mais o
consome é a página, não o provider, e uma página alcançando dentro da pasta de um componente
inverteria a dependência.

A instância do servidor **nunca** é variável de módulo. Em Node o módulo é avaliado uma vez por
processo e ficaria viva entre requisições de alunos diferentes: o dado de um apareceria para outro,
sem erro nenhum na tela (RNF04). `React.cache()` memoiza por render, e uma requisição é um render.

## `useSuspenseQuery` ou `useQuery`

> **`useSuspenseQuery`** quando a `queryKey` é estável e a página prefetcha o dado.
> **`useQuery`** quando a chave depende de input da pessoa em tempo real, ou quando a query é
> condicional.

Não é preferência. `useSuspenseQuery` **não aceita** `enabled` nem `placeholderData`, e essas são
exatamente as ferramentas de "query que às vezes não roda" e "query que troca de chave sem piscar".
A regra é só a consequência da API.

| Situação                                 | Hook                 | Por quê                                                                                      |
| ---------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------- |
| Lista ou detalhe que a página prefetcha  | `useSuspenseQuery`   | `data` nunca é `undefined`; sem `= []` mentindo que a lista está vazia                       |
| Duas ou mais queries no mesmo componente | `useSuspenseQueries` | Em sequência, cada `useSuspenseQuery` só é descoberto quando o anterior resolve: waterfall   |
| Busca, filtro ou paginação               | `useQuery`           | A chave muda a cada tecla; `placeholderData` (incompatível com suspense) evita o pisca-pisca |
| Query condicional (`enabled`)            | dividir o componente | Ver abaixo                                                                                   |

### O ganho concreto

`useQuery` devolve `data: undefined` quando a busca falha. Com o default `= []` ao lado, uma falha
de rede vira **lista vazia**: a tela diria "registre sua primeira atividade" para quem já tem
trinta. `useSuspenseQuery` lança a falha, e o `error.tsx` a mostra como erro.

### Query condicional: dividir, não usar `enabled`

`useSuspenseQuery` não tem `enabled`. Quando o mesmo componente serve cadastro (sem busca) e
edição (com busca), a divisão é em **dois componentes**. Não é hook condicional: cada um tem a sua
lista fixa de hooks.

```tsx
export function FormularioPerfil({ perfilId }: Props): ReactNode {
  return perfilId ? <PerfilEmEdicao perfilId={perfilId} /> : <Formulario />
}

function PerfilEmEdicao({ perfilId }: { perfilId: string }): ReactNode {
  const { data: perfil } = useSuspenseQuery(perfilQueries.detail(perfilId))

  if (!perfil) notFound()

  return <Formulario perfil={perfil} />
}
```

O que isso apaga: o `enabled`, o `if (isEdit && !perfil) return null` (tela em branco) e um bug
latente. O `defaultValues` do React Hook Form é lido **uma vez**, no primeiro render, então um
formulário que montasse antes do dado chegar nasceria vazio para sempre. Aqui o formulário só existe
num mundo onde o dado já chegou.

### A única exceção atual: `SessionGate`

`components/SessionGate` usa `useQuery` com `enabled`, e está comentado no arquivo. A busca da sessão
só pode rodar depois de o componente montar no navegador, porque enquanto a sessão for do mock o
servidor não a enxerga. Com o Supabase, a sessão passa a existir no servidor e a exceção sai
(`arquitetura.md`, "Exceções nomeadas").

## ErrorBoundary

`useSuspenseQuery` lança o erro em vez de devolvê-lo em `data`. Toda tela que usa suspense depende de
um `error.tsx` acima dela: hoje um por grupo de rota (`(auth)`, `(aluno)`), os dois reusando
`components/ErroDeTela`. Sem isso a falha sobe até o erro genérico do Next.

## Invalidação

Escrita que altera **estado derivado** não pode invalidar só o próprio domínio: todo domínio que lê
aquele estado fica obsoleto no mesmo instante. Registrar ou remover uma atividade muda o progresso do
painel, do resumo e do formulário (RNF20). Editar o semestre de início do perfil também, porque ele
decide quais atividades contam (RF11, RF38).

Para o inventário não se espalhar pelas telas, cada domínio exporta a sua rotina de invalidação:

```ts
// atividades.mutations.ts (ilustrativo)
export function invalidateAfterAtividadeWrite(qc: QueryClient): void {
  qc.invalidateQueries({ queryKey: atividadesKeys.all })
  qc.invalidateQueries({ queryKey: progressoKeys.all })
}
```

A tela chama a rotina; não monta a lista por conta própria. O inventário do que uma atividade derruba
precisa viver junto de quem escreve a atividade. `progressoKeys.all` só entra quando o domínio
`progresso` existir.

**A relação é mútua quando a escrita de um muda o estado do outro.** `invalidateAfterPerfilWrite`
também derruba `progressoKeys.all` (e `atividadesKeys.all`, porque cada atividade mostra se contou).
Sem isso, o painel continuaria exibindo as horas de antes de o semestre de início mudar: número velho
que parece certo.

Dois services importam a chave um do outro, e o import é **direto do módulo**
(`@/services/atividades/atividades.keys`), nunca do barrel. Os dois barrels reexportam as mutations,
e as mutations importam as chaves do outro lado: importá-las pelo barrel fecharia um ciclo. Os
arquivos de chave só dependem de um tipo do próprio domínio, então são folhas.

**`progresso` é a invalidação mais larga, e a mais fácil de justificar.** A tela agrega tudo: não
existe recorte dela que uma atividade ou o semestre de início deixe intacto. Isso **não** contradiz a
régua "derruba o que uma escrita torna falso, e só isso". A régua é sobre precisão, não sobre
tamanho: aqui a resposta certa é larga porque o que a escrita torna falso é largo mesmo. Larga onde o
dado se espalha, curta onde ele não sai do lugar.

### Contra-exemplo, para a régua não virar "invalide sempre tudo"

`DetalheAtividade` invalida de propósito só `lists()` e o progresso ao remover uma atividade
(RF17). Derrubar `atividadesKeys.all` incluiria a query de detalhe em que a tela está montada, o
refetch traria `null`, e `notFound()` dispararia antes do `router.push`. A pessoa cairia num 404 em
vez de voltar para a lista. Numa tela cuja navegação já saiu da árvore do detalhe antes do refetch,
essa corrida não existe e a rotina larga serve.

### Exceção: a resposta já é o novo estado

Quando a mutation devolve exatamente o dado que a query guarda, a tela grava no cache em vez de
invalidar. É o caso da sessão:

```ts
// features/autenticacao/Login/index.tsx (existe)
onSuccess: (sessao) => {
  queryClient.setQueryData(contaKeys.sessao(), sessao)
  router.replace(destinoDaSessao(sessao))
}
```

Invalidar dispararia uma busca para saber o que a resposta de `entrar` já disse. Até ela terminar, o
cache ainda diria "sem sessão", e o `SessionGate` do grupo `(aluno)` devolveria a pessoa ao login
no meio do `router.replace`. Duas condições, e as duas precisam valer: a chave vem
da factory, e o valor gravado é o que o service devolveu, nunca montado na tela. Fora isso, a regra
é invalidar pela rotina do domínio.

## staleTime

Com `staleTime: 0`, o dado hidratado pelo servidor nasce vencido e o TanStack Query o rebusca no
primeiro mount: a tela pinta com dado e requisita assim mesmo. Por isso os valores são constantes
nomeadas em `src/constants/cache.ts` (`STALE_TIME`), nunca números soltos em cada `queryOptions`:

| Natureza do dado                 | Política        | `STALE_TIME`        |
| -------------------------------- | --------------- | ------------------- |
| Regra do curso, cadastro, sessão | longo           | `cadastro`: 5 min   |
| Lista operacional                | curto           | `operacional`: 30 s |
| Horas computadas e totais        | revalida sempre | `calculo`: 0        |

## Paginação e filtro

Cada combinação de filtro é uma chave própria, então voltar a um filtro já visitado não gera
requisição. Na troca de página, `placeholderData` mantém o conteúdo atual visível em vez de piscar
estado de carregamento.

É por isso que lista com busca fica em `useQuery`: `placeholderData` não existe em
`useSuspenseQuery`, então a tabela inteira sumiria atrás do fallback a cada termo digitado. Quando a
tela mistura as duas (a lista com filtro em `useQuery` e o contador de chave fixa em
`useSuspenseQuery`), a mistura é deliberada e fica comentada no arquivo.

## Regras

- `queryFn` sempre vem do service; função de rede não é escrita na tela.
- Chave sempre da factory.
- `useSuspenseQuery` por padrão; `useQuery` só com busca, filtro ou paginação, e com o porquê
  comentado na linha.
- Query condicional divide o componente; `enabled` não entra em suspense.
- Tela com suspense exige `<Suspense fallback={<Loading />}>` na página e `error.tsx` no grupo de
  rota.
- Invalidação sempre pela rotina do domínio, salvo o `setQueryData` de resposta que já é o novo
  estado.
- Atualização otimista só quando a operação é reversível na UI. Nunca em total de horas, que depende
  do retorno real do cálculo.
- `QueryClient` de servidor é por requisição.
