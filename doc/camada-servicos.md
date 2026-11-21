# Camada de serviços

Fronteira entre as telas e a origem do dado. Feature nunca fala com o banco nem com o mock. Hoje a
origem é um mock em memória; com o Supabase, só esta camada muda. Os trechos marcados com `> Alvo`
descrevem o que vale quando a integração entrar.

## Arquivos de um domínio

| Arquivo              | Responsabilidade                                                     |
| -------------------- | -------------------------------------------------------------------- |
| `<dom>.types.ts`     | schema Valibot e tipo de domínio                                     |
| `<dom>.mock.ts`      | o backend fingido do domínio, em memória. Sai quando o domínio migra |
| `<dom>.api.ts`       | leitura                                                              |
| `<dom>.mutations.ts` | escrita (alvo: e RPC)                                                |
| `<dom>.keys.ts`      | chaves de cache                                                      |
| `<dom>.queries.ts`   | definições de query reaproveitáveis                                  |
| `<dom>.errors.ts`    | erro de domínio nomeado, quando o primeiro aparecer                  |
| `index.ts`           | superfície pública, sem reexportar o mock                            |

Arquivo interno nunca importa do `index.ts` do próprio domínio: o `index.ts` reexporta as mutations, e
importar por ele fecharia um ciclo.

## Tipo de domínio

O service devolve tipo de domínio em `camelCase`, inferido do schema Valibot. A row do banco, em
`snake_case`, não vaza para a feature: é isso que desacopla a tela do schema do banco. Data trafega
como `string`, porque `Date` não sobrevive ao `dehydrate` (`react-query.md`).

```ts
// account.types.ts (formato esperado: hoje `Session` ainda é um `type` simples)
export const SessionSchema = v.object({
  email: v.pipe(v.string(), v.email()),
})

export type Session = v.InferOutput<typeof SessionSchema>
```

## O mock

Cada domínio tem o seu `<dom>.mock.ts`: o backend fingido, **em memória e sem persistência**.
Recarregar a página volta ao estado inicial, que começa vazio ou com o dado de exemplo que o domínio
declarar. `<dom>.api.ts` e `<dom>.mutations.ts` falam só com esse arquivo.

- O mock ordena, filtra e calcula ali dentro, não na tela.
- A leitura devolve cópia (`structuredClone`), como uma resposta de rede faria.
- Não existe pasta compartilhada de mock nem banco único. O que dois domínios dividirem de verdade
  vira helper em `utils/` quando o segundo domínio precisar.
- O mock simula a demora da rede, para os estados de carregamento aparecerem como vão aparecer de
  verdade, e fica instantâneo nos testes.
- Só o próprio domínio e os testes importam arquivo de mock (o ESLint passa a travar isso com o
  esqueleto novo).

Na migração, `<dom>.api.ts` e `<dom>.mutations.ts` trocam a chamada ao `<dom>.mock.ts` por
`supabase-js`, e o mock do domínio é apagado no mesmo commit. Se uma parte do domínio depende de uma
integração que vem depois, ela fica num mock próprio com `TODO` para a issue que o apaga. Foi o caso
da leitura do comprovante em `activities`, que ficou em `activities.proof-reading.mock.ts` até a #22
trocá-la por um Route Handler de IA (ADR 0016).

> O código atual (`services/_mock/`, `MockPanel` e o `localStorage` `saaci:mock`) ainda guarda o
> banco inteiro no navegador. É legado e sai no reset do projeto.

## Leitura

Toda saída passa por `v.parse`:

```ts
// account.api.ts (formato esperado)
export async function getSession(): Promise<Session | null> {
  const account = await getAccountWithSession()

  return account ? v.parse(SessionSchema, { email: account.email }) : null
}
```

O parse é o contrato do service sendo conferido enquanto o mock existe, e o mesmo parse acusa a row
fora do formato quando a fonte for o Supabase, antes de ela chegar na tela.

## Escrita

```ts
// account.mutations.ts (formato esperado)
export async function signIn(email: string, password: string): Promise<Session> {
  const account = await openSession(normalizeEmail(email), password)

  if (!account) throw new InvalidCredentialsError()
  return toSession(account)
}
```

**Depois do commit, nada vai à rede (ADR 0012).** A resposta sai do que a escrita devolveu
(`.select(colunas)` no `update`, `returning` na RPC) somado ao que foi lido **antes** dela. Uma
leitura que falhasse depois do commit faria a tela dizer "não salva" para o que foi gravado, e a nova
tentativa duplicaria o registro ou bateria na trava de `updated_at`. Reler depois de uma escrita que
não gravou (zero linhas) continua permitido. Quando a escrita falha sem código (rede), o commit é
incerto: o service relê pela marca única da tentativa (o caminho do comprovante no registro; o id,
o `updated_at` novo e os valores pedidos na correção). Achou, é sucesso; não achou, ou a releitura
falhou, sobe o erro original.

## Tradução de erro

O service traduz erro de domínio conhecido antes de lançar, e a tela nunca vê código nem mensagem de
constraint. Erro sem tradução conhecida é **repassado intacto**, nunca engolido: traduzir só o que se
conhece evita que um bug de rede vire "a senha não confere" na tela. `<dom>.errors.ts` entra quando
a primeira tradução aparecer.

`InvalidCredentialsError` tem a mesma mensagem para e-mail desconhecido e senha errada. Dizer qual dos
dois errou ajudaria quem tenta descobrir e-mails de aluno.

## Quando o Supabase entrar

> Alvo (Supabase): ainda não implementado.

- **Cliente do banco.** A mesma função roda no servidor (prefetch) e no navegador. O cliente entra por
  parâmetro, com o do navegador como padrão: `getActivities(filtros, db = createClient())`. O Server
  Component sempre passa o seu, porque **omitir no servidor cai no cliente do navegador, que não
  enxerga o cookie de sessão: a busca volta vazia, sem erro nenhum**.
- **Tradução de erro.** `invalid_credentials` vira `InvalidCredentialsError` e `email_not_confirmed` vira
  um erro próprio, que a tela leva à verificação (RF05).
- **Escrita com comprovante (implementada em `activities`, ADR 0011).** Toda leitura de que a
  resposta precisa acontece antes do upload. O arquivo sobe para a pasta do dono, a RPC recebe só a
  referência e devolve a linha criada, e depois do commit nada mais vai à rede: falha ali diria "não
  registrada" para o que foi gravado. Se o banco recusar (erro com código), o service apaga o arquivo
  na hora. Erro de rede não apaga, porque o commit pode ter acontecido, e o que sobrar a rotina
  `limpa-comprovantes` apaga. O que o aluno preencheu continua na tela (RNF24). `createActivity` é a
  exceção ao cliente por parâmetro: só roda no navegador (`arquitetura.md`, exceções nomeadas).
- **Função passada direto ao TanStack.** `queryFn: getActivities` e `mutationFn: createActivity`
  mandam o contexto da query ou da mutation como argumento, e ele cairia no lugar do `db`. Na query,
  embrulhe: `queryFn: () => getActivities()`.
- **Quando a leitura vira função SQL (RPC).** O `.select()` basta para lista simples. Vai para uma
  função SQL o que o construtor não expressa sem erro silencioso: total do filtro inteiro (somar o
  array recebido daria a soma **da página**), valor derivado de outras linhas (horas computadas
  dependem da regra, do semestre e do máximo da categoria), filtro que atravessa tabela filha (use
  `exists`, não join) e a prévia do formulário, que precisa passar pela mesma conta que grava
  (RNF20). Lista e resumo são duas funções com chaves de cache próprias, o predicado do filtro mora
  numa terceira compartilhada, e o detalhe não ganha função própria: chama a de lista com `limit 1`.

## Regras

- Toda resposta passa por `v.parse` antes de sair do service.
- Nome de função carrega o domínio: `createActivity`, não `create`.
- O service devolve Promise pura, mesmo sobre o mock, e não conhece React nem TanStack Query.
- Erro sem tradução conhecida é lançado, nunca engolido. Quem trata é a tela.
- Alvo: colunas são listadas (`select('*')` não), e filtro, ordenação e paginação vão na query, nunca
  em array depois.
- Alvo: função SQL com `returns table(...)` tem **toda** coluna marcada como não nula pelo gerador de
  tipos, que não tem como saber. Quem sabe é o schema Valibot: deixe o `v.parse` recusar o que não
  deveria vir nulo.
