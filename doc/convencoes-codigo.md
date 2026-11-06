# Convenções de código

## Idioma

Substantivo de domínio em português, verbo e termo técnico em inglês.

```
getAtividades()      createAtividade()      updatePerfil()
type Atividade = { id, titulo, dataAtividade }
```

Coluna do banco é `snake_case` em português; o tipo de domínio é `camelCase`. A tradução acontece
no service (`camada-servicos.md`).

> O código do login ainda tem verbos em português (`entrar`, `sair`, `destinoDaSessao`, `lerDb`).
> Código novo segue esta regra, e o antigo é renomeado numa tarefa à parte.

### Prop de componente e variável interna: sempre em inglês

Vale para `@design-system/` e para `features/`, mesmo quando o componente nasce de um protótipo do
Claude Design, que nomeia em português (`nome`, `tamanho`, `aberto`, `onFechar`). A tradução para
inglês acontece ao trazer o componente para o código; o protótipo não define a API final.

```
// ❌ copiado direto do protótipo
<Icone nome="search" tamanho={20} />
<Modal aberto={open} onFechar={fechar} />

// ✅ traduzido ao entrar no código
<Icon name="search" size={20} />
<Modal open={open} onClose={close} />
```

Duas exceções, e só essas:

- **Texto exibido (copy)** continua em português, porque é conteúdo, não identificador:
  `<Button>Registrar atividade</Button>`.
- **Valor de domínio como string** continua em português quando é literalmente o vocabulário do
  negócio, não um estado de interface. `StatusBadge status="conta" | "parcial" | "nao_conta"`
  é vocabulário do produto. `InlineMessage tone="success" | "danger"` não se qualifica: sucesso e
  erro são estado de interface, por isso ficam em inglês.

O texto de tela segue `escrita-de-interface.html` e o glossário do `SAACI-produto`.

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

O nome é fixo, sem prefixo nem sufixo com o nome da tela. Dado de exemplo não é arquivo da tela: vem
de `services/<dominio>/<dominio>.mock.ts`.

Não usar: `LoadingAtividades.tsx`, `Atividades.Loading.tsx`, `ErrorMessage.tsx`, `_hook/` no
singular.

## Obrigatoriedade

| Situação                              | Obrigatório                                                                                                    |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Tela que busca dado                   | `Loading.tsx` e `Empty.tsx`; a falha cai no `error.tsx` do grupo, e `Error.tsx` só existe com mensagem própria |
| Componente que recebe dado assíncrono | `Skeleton.tsx`                                                                                                 |
| Tela estática                         | nenhum                                                                                                         |

`Empty.tsx` cobre todo caso em que a busca teve sucesso mas devolveu zero resultados úteis, inclusive
quando a lista tecnicamente não está vazia. Vazio de cadastro e vazio de filtro são textos
**diferentes**: um convida a criar o primeiro registro, o outro explica que o filtro não encontrou
nada e oferece limpar. Nunca o mesmo texto genérico de "lista vazia".

## Estilo (Panda CSS)

Todo `css()`/`styled()` de um componente ou tela vive em `styles.ts`. O `index.tsx` nunca chama os
dois direto, só faz `import * as S from './styles'`. Sem exceção por tamanho: uma linha de `css()`
também vai para o `styles.ts`.

Dentro do `styles.ts`, os dois convivem, cada um para o seu caso:

- `styled()` vira uma tag própria, renderizada como componente (`<S.Cabecalho>`).
- `css()` é só uma classe para colar num elemento que já existe (`className={S.destaque}`), sem
  criar tag nova.

```ts
// styles.ts
import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const Cabecalho = styled('header', { base: { display: 'flex' } })
export const destaque = css({ color: 'brand.text', fontWeight: '700' })
```

Exceção: os patterns prontos do Panda (`HStack`, `VStack`, `Grid`, `Flex`, `Box`, de
`styled-system/jsx`) podem ser usados direto no `index.tsx`. Não são estilo autoral, são componente
pronto da biblioteca, equivalente a usar `<div>`.

`css()`/`styled()` e performance não têm relação: os dois compilam para classe estática em build,
sem função sobrando no cliente. O que quebra essa extração, e aí sim custa performance, é passar
valor calculado em runtime para dentro de `css()`/`styled()`. Isso é sinal de que o valor deveria ser
variante de `recipe`, não argumento dinâmico. A exceção útil é a largura de uma barra de progresso,
que vai em `style` inline ou variável CSS.

### Nunca misturar shorthand direcional de borda com `borderColor` solto

```ts
// ❌ dois pontos escrevendo border-right-color ao mesmo tempo: qual vence depende da ordem das
// classes atômicas no CSS final, não da ordem escrita aqui. Já causou borda com a cor errada.
borderRight: '1px solid',
borderColor: 'line',

// ✅ longhands explícitos, sem sobreposição e sem ambiguidade
borderRightWidth: '1px',
borderRightStyle: 'solid',
borderRightColor: 'line',
```

Vale para `borderTop`, `borderLeft` e `borderBottom` também. `border` (todos os lados) com
`borderColor` (todos os lados) não tem o problema: os dois cobrem exatamente o mesmo conjunto de
lados, então não há ambiguidade sobre qual classe atômica vence.

### O mesmo problema entre dois grupos de variante do `recipe`

Dois grupos de variante (`variant` e `appearance`, por exemplo) declarando a mesma propriedade em
combinações diferentes têm a ambiguidade idêntica. `variant.secondary` seta `borderColor` de um
jeito, `appearance.text` tenta zerar do outro, e qual vence depende da ordem das classes no CSS
compilado, não da lógica do componente. Já causou botão "texto" aparecendo com borda visível quando
não devia.

```ts
// ❌ dois grupos de variante mexendo em borderColor e background ao mesmo tempo
variants: {
  variant: { secondary: { borderColor: 'line', background: 'surface' } },
  appearance: { text: { borderColor: 'transparent', background: 'transparent' } },
}

// ✅ appearance.text não declara cor, fundo nem borda. Cada combinação fica inteira dentro de
// compoundVariants, que gera uma classe combinada (.variant_x.appearance_text) com especificidade
// CSS maior: vence de verdade, não por sorte de ordem
compoundVariants: [
  {
    variant: 'secondary',
    appearance: 'text',
    css: { borderColor: 'transparent', background: 'transparent', color: 'ink' },
  },
]
```

Regra: se dois grupos de variante do mesmo `recipe` podem ser combinados **e** tocam a mesma
propriedade, a combinação vai para `compoundVariants` completa, nunca dividida entre os dois grupos.

## Quebra de componente

```
Sub-componente serve a 2+ telas?
  sim → @design-system, no nível atômico correspondente
  não → _components/ da própria tela
```

## Custom hook

Criar apenas quando houver transformação pesada de dado, queries dependentes entre si, ou reuso da
mesma busca em 2+ telas. Envolver uma única query em hook não é motivo suficiente.

## Server e Client

- Página é Server Component por padrão.
- `'use client'` fica no arquivo mais baixo possível da árvore.
- Componente que apenas exibe dado não vira client.

## TypeScript

- `strict` ligado, `any` proibido.
- Retorno de função exportada é explícito (ESLint garante). Exceção: `*.queries.ts`, onde anotar
  perde o tipo da chave que `queryOptions()` infere.
- Tipo de domínio vem por inferência do schema Valibot, não escrito à mão. Dois tipos para a mesma
  coisa divergem na primeira mudança de campo.

## Formulário

- React Hook Form com resolver Valibot, schema em `schema.ts` ao lado da tela.
- Rótulo sempre visível. Regra fica em texto junto ao campo, nunca no placeholder.
- Erro aparece no próprio campo, no momento em que ocorre, e diz o que fazer a seguir (RNF13).
- Enquanto envia, o botão fica desabilitado e visível. Nunca some.
- Falha de rede não limpa o que foi digitado (RNF24).

## Testes

- Vitest + Testing Library.
- Arquivo `.test.ts` ao lado do que testa.
- Obrigatório onde o erro é silencioso: função pura de cálculo e schema. A regra completa está em
  `testes.md`.
- Testa comportamento visível, não implementação interna.

## Nomes

| Item                          | Forma                                                 |
| ----------------------------- | ----------------------------------------------------- |
| Pasta de tela e de componente | `PascalCase`                                          |
| Pasta de domínio              | `kebab-case`                                          |
| Pasta auxiliar                | `_plural`                                             |
| Função                        | verbo com contexto: `createAtividade`, nunca `create` |
| Booleano                      | prefixo `is`, `has` ou `can`                          |

## Commits

Conventional Commits com assunto em português: `feat: adiciona painel de progresso`.
