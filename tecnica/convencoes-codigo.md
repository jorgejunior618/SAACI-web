# Convenções de código

## Idioma

Substantivo de domínio em português, verbo e termo técnico em inglês.

```
getPedidos()      createPagamento()      updateCliente()
type Pedido = { id, clienteNome, dataVenda }
```

Coluna do banco é `snake_case` em português; o tipo de domínio é
`camelCase`. A tradução acontece no service.

### Prop de componente e variável interna: sempre em inglês

Vale para `@design-system/` e para `features/` — mesmo quando o
componente nasce a partir de um protótipo do Claude Design, que nomeia em
português (`nome`, `tamanho`, `aberto`, `onFechar`). A tradução para
inglês acontece ao trazer o componente para o código; o protótipo não
define a API final.

```
// ❌ copiado direto do protótipo
<Icone nome="search" tamanho={20} />
<Modal aberto={open} onFechar={fechar} />

// ✅ traduzido ao entrar no código
<Icon name="search" size={20} />
<Modal open={open} onClose={close} />
```

Duas exceções, e só essas:

- **Texto exibido (copy)** continua em português — é conteúdo, não
  identificador: `<Button>Cadastrar cliente</Button>`.
- **Valor de domínio como string** continua em português quando é
  literalmente o vocabulário do negócio, não um estado de UI — o exemplo
  já em produção é `StatusChip status="pago" | "aberto" | "parcial"`.
  `Toast tone="success" | "error"` não se qualifica: sucesso/erro é
  estado de interface, não substantivo do negócio, por isso fica em
  inglês.

## Arquivos co-localizados

| Situação                      | Arquivo        |
| ----------------------------- | -------------- |
| Carregamento de tela inteira  | `Loading.tsx`  |
| Carregamento de um componente | `Skeleton.tsx` |
| Falha                         | `Error.tsx`    |
| Lista sem resultado           | `Empty.tsx`    |
| Estilo                        | `styles.ts`    |
| Tipagem densa                 | `types.ts`     |
| Função pura local             | `utils.ts`     |
| Schema de formulário          | `schema.ts`    |
| Dado de exemplo               | `mock.ts`      |

Nome é fixo, sem prefixo nem sufixo com o nome da tela.

Não usar: `LoadingPedidos.tsx` · `Pedidos.Loading.tsx` ·
`ErrorMessage.tsx` · `_hook/` no singular.

## Obrigatoriedade

| Situação                              | Obrigatório                              |
| ------------------------------------- | ---------------------------------------- |
| Tela que busca dado                   | `Loading.tsx`, `Error.tsx` e `Empty.tsx` |
| Componente que recebe dado assíncrono | `Skeleton.tsx`                           |
| Tela estática                         | nenhum                                   |

`Empty.tsx` cobre todo caso em que a busca teve sucesso mas devolveu
zero resultados úteis — inclusive quando a lista tecnicamente não está
vazia (Fase 7: "só o cliente Avulso existe" conta como vazio de
cadastro). Vazio de cadastro e vazio de filtro/busca são textos
**diferentes**: um convida a criar o primeiro registro, o outro explica
que o filtro não encontrou nada e oferece limpar — nunca o mesmo texto
genérico de "lista vazia".

## Estilo (Panda CSS)

Todo `css()`/`styled()` de um componente ou tela vive em `styles.ts` —
`index.tsx` nunca chama os dois direto, só `import * as S from './styles'`.
Sem exceção por tamanho: uma linha de `css()` também vai pro `styles.ts`.

Dentro de `styles.ts`, os dois convivem, cada um pro seu caso:

- `styled()` — vira uma tag própria, renderizada como componente
  (`<S.Cabecalho>`).
- `css()` — só uma classe pra colar num elemento que já existe
  (`className={S.destaque}`), sem criar tag nova.

```ts
// styles.ts
import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const Cabecalho = styled('header', { base: { display: 'flex' } })
export const destaque = css({ color: 'text.brand', fontWeight: '700' })
```

Exceção: os patterns prontos do Panda (`Hstack`, `Vstack`, `Grid`, `Flex`,
`Box`, de `styled-system/jsx`) podem ser usados direto no `index.tsx` —
não são estilo autoral, são componente pronto da lib, equivalente a usar
`<div>`.

`css()`/`styled()` e performance não têm relação — os dois compilam pra
classe estática em build, sem função sobrando no cliente. O que quebra
essa extração (e aí sim custa performance) é passar valor calculado em
runtime pra dentro de `css()`/`styled()`; isso é sinal de que o valor
deveria ser variante do `recipe`, não argumento dinâmico.

### Nunca misturar shorthand direcional de borda com `borderColor` solto

```ts
// ❌ dois pontos escrevendo border-right-color ao mesmo tempo — qual
// vence depende da ordem das classes atômicas no CSS final, não da
// ordem escrita aqui. Já causou borda com a cor errada em produção.
borderRight: '1px solid',
borderColor: 'border.default',

// ✅ longhands explícitos — sem sobreposição, sem ambiguidade
borderRightWidth: '1px',
borderRightStyle: 'solid',
borderRightColor: 'border.default',
```

Vale pra `borderTop`/`borderLeft`/`borderBottom` também. `border` (todos os
lados) + `borderColor` (todos os lados) não tem esse problema — os dois
cobrem exatamente o mesmo conjunto de lados, então não há ambiguidade de
qual classe atômica vence.

### O mesmo problema entre dois grupos de variante do `recipe`

Dois grupos de variante (`variant` e `appearance`, por exemplo) declarando
a mesma propriedade em combinações diferentes tem a ambiguidade idêntica —
`variant.secondary` seta `borderColor` de um jeito, `appearance.text` tenta
zerar do outro, e qual vence depende da ordem das classes no CSS
compilado, não da lógica do componente. Já causou botão "texto" aparecendo
com borda visível quando não devia.

```ts
// ❌ dois grupos de variante mexendo em borderColor/background ao mesmo tempo
variants: {
  variant: { secondary: { borderColor: 'border.default', background: 'surface.card' } },
  appearance: { text: { borderColor: 'transparent', background: 'transparent' } },
}

// ✅ appearance.text não declara cor/fundo/borda — cada combinação fica
// inteira dentro de compoundVariants, que gera uma classe combinada
// (.variant_x.appearance_text) com especificidade CSS maior — vence de
// verdade, não por sorte de ordem
compoundVariants: [
  {
    variant: 'secondary',
    appearance: 'text',
    css: { borderColor: 'transparent', background: 'transparent', color: 'text.primary' },
  },
]
```

Regra: se dois grupos de variante do mesmo `recipe` podem ser combinados
**e** tocam a mesma propriedade, a combinação vai pra `compoundVariants`
completa — nunca dividida entre os dois grupos.

## Quebra de componente

```
Sub-componente serve a 2+ telas?
  sim → @design-system, no nível atômico correspondente
  não → _components/ da própria tela
```

## Custom hook

Criar apenas quando houver transformação pesada de dado, queries
dependentes entre si, ou reuso da mesma busca em 2+ telas. Envolver uma
única query em hook não é motivo suficiente.

## Server e Client

- Página é Server Component por padrão.
- `'use client'` fica no arquivo mais baixo possível da árvore.
- Componente que apenas exibe dado não vira client.

## TypeScript

- `strict` ligado, `any` proibido.
- Retorno de função exportada é explícito.
- Tipo de domínio vem por inferência do schema Valibot, não escrito à mão.

## Formulário

- React Hook Form com resolver Valibot.
- Schema em `schema.ts`, ao lado da tela.
- Erro aparece no próprio campo, no momento em que ocorre.
- Enquanto envia, o botão fica desabilitado e visível — nunca some.
- Falha de rede não limpa o que foi digitado.

## Testes

- Vitest + Testing Library.
- Arquivo `.test.ts` ao lado do que testa.
- Obrigatório em função pura de cálculo, schema e RPC financeira.
- Testa comportamento visível, não implementação interna.

## Nomes

| Item                          | Forma                                              |
| ----------------------------- | -------------------------------------------------- |
| Pasta de tela e de componente | `PascalCase`                                       |
| Pasta de domínio              | `kebab-case`                                       |
| Pasta auxiliar                | `_plural`                                          |
| Função                        | verbo com contexto: `createPedido`, nunca `create` |
| Booleano                      | prefixo `is`, `has` ou `can`                       |
