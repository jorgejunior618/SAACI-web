# 0020. A sessão e os dados das páginas são buscados no servidor e hidratados no cache

- **Status:** Proposta
- **Data:** 21/11/2026

## Contexto

O `SessionGate` decidia a sessão só no navegador (`useQuery` com `enabled` e `isMounted`), porque o
mock vivia na memória do navegador e o servidor não o enxergava. As telas liam tudo com
`useSuspenseQuery` e o `Loading`, sem prefetch. Os domínios saíram do mock (#17 a #21), então essa
razão acabou e sobraram três custos:

- Toda área logada começava com o carregamento da sessão e do perfil, em cascata, antes de qualquer
  tela buscar o próprio dado (RNF14, meta de 3 s no celular).
- Quem chega sem sessão a uma área logada só era mandado para `/entrar` depois de a página ser
  enviada e hidratada.
- O cookie de sessão só era renovado pelo navegador.

## Decisão

- **`src/proxy.ts` renova o cookie e barra a rota sem sessão.** Roda só nas rotas de `(aluno)`,
  `(onboarding)` e `(conta)` (o `matcher` é constante e um teste confere que cobre toda pasta de rota
  desses grupos). Confere com `getClaims()`, nunca `getSession()`, e manda para `/entrar` com o cookie
  renovado ou limpo. `(publico)` fica de fora: `/nova-senha` usa a sessão curta aberta pelo link. O
  proxy é um filtro rápido, e não a autoridade: quem pergunta ao Auth é o `SessionGate`, e a
  autorização é a RLS.
- **O layout de cada grupo usa `SessionBoundary`** (`app/_prefetch/`). Ele busca a sessão e, havendo
  sessão, o perfil, com o cliente do servidor, hidrata o cache e monta o `SessionGate` dentro de um
  `Suspense`.
- **`SessionGate` lê com `useSuspenseQuery`**, sem `isMounted` e sem `enabled`. O perfil é o
  componente à parte `ProfileGate`, que só monta com sessão. Falha de busca lança, e o `error.tsx` do
  grupo mostra a tela de erro.
- **A página que lê dado usa `PrefetchBoundary`** (`app/_prefetch/`). A função de prefetch recebe o
  `db` do servidor e o `QueryClient` da requisição, usa o `prefetchQuery` do contexto (`query()` com o
  erro engolido, porque o `prefetchQuery` do `QueryClient` está depreciado), busca em
  paralelo (`Promise.all`) o que não depende do perfil e, em seguida, o que depende do curso. Nenhum
  prefetch usa o cliente do navegador.
- **Toda definição de query aceita `db?: DbClient`** e o repassa ao service. O `db` não entra na
  chave: a do servidor e a do navegador precisam ser a mesma, senão o cache hidratado nunca casa.
  Como a regra `@tanstack/query/exhaustive-deps` exige o `db` na chave, cada definição leva um
  `eslint-disable-next-line` com o motivo. Um teste em `tests/` confere que todas repassam o `db` e
  que a chave não muda com ele.
- **`/nova-senha` não faz prefetch.** A conferência do link gasta o token no Auth, e o servidor não
  grava a sessão curta que ela abre.
- **`app/_prefetch/` fica no singular**, como exceção à regra de pasta auxiliar no plural: o nome é o
  tema (prefetch no servidor), e não um conjunto de peças.

## Consequências

- A primeira pintura das páginas com prefetch já tem o dado: o servidor devolve o HTML com o estado
  hidratado, e o navegador não refaz as buscas que o servidor fez. Sem sessão, a área logada responde
  307 antes de renderizar.
- As rotas dos grupos passam a ser dinâmicas, porque o layout lê o cookie. Nenhuma tela dos grupos é
  gerada estaticamente.
- Cada carga completa pergunta ao Auth (`getUser`) no layout, inclusive nas telas públicas.
- Enquanto a página espera o prefetch, o `Suspense` do layout mostra "Conferindo sua sessão", mesmo
  quando o que demora é o dado da tela. Na prática a resposta chega num bloco só, e o React troca o
  fallback antes da primeira pintura. O Lighthouse da #23 diz se isso incomoda.
- Rota nova em `(aluno)`, `(onboarding)` ou `(conta)` precisa entrar no `matcher` do proxy (o teste
  falha se faltar). Página nova que lê dado precisa de um `PrefetchBoundary` com a lista de queries,
  e a query nova precisa aceitar `db`.
- A falha de sessão ou de perfil deixa de ter tela própria dentro do `SessionGate` e cai no
  `error.tsx` do grupo. Se o botão de tentar de novo recupera de uma falha momentânea do Auth depende
  de o React Query resetar a query com erro, e isso não foi confirmado.
- `notFound()` de uma atividade inexistente continua mostrando a tela certa, mas a resposta sai com
  status 200, porque já está em streaming.
- Mudam `doc/arquitetura.md` (fluxo de leitura, exceções, e a frase de fase atual e o fluxo de escrita,
  que ainda citavam o mock), `doc/react-query.md`, `doc/camada-servicos.md` e
  `doc/estrutura-pastas.md`.

## Alternativas descartadas

- **Manter o `SessionGate` só no navegador.** Mantém a cascata de carregamento e o `Loading` na
  primeira pintura, que é o que a #23 quer tirar.
- **Sobrescrever o `queryFn` em cada página** (`{ ...profileQueries.detail(), queryFn: () =>
getProfile(db) }`). Não toca em `services/`, mas repete em dez páginas o que o service já sabe, e
  esquecer o `db` cai no cliente do navegador sem erro.
- **Pôr o `db` na chave da query.** Satisfaz o lint, mas a chave do servidor nunca casaria com a do
  navegador, e o dado hidratado seria ignorado.
- **`middleware.ts`.** O Next 16 renomeou a convenção para `proxy.ts`, e a antiga está depreciada.
- **Os dois componentes de servidor soltos em `app/`.** Funciona, mas mistura arquivos que não são
  convenção do Next com `layout.tsx` e `page.tsx`. A pasta privada separa o que é só prefetch.
- **`getSession()` no proxy.** Lê o cookie sem validar o JWT, então um cookie forjado passaria.
