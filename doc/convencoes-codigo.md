# Convenções de código

## Idioma

Substantivo de domínio em português, verbo e termo técnico em inglês.

```
getAtividades()      createAtividade()      updatePerfil()
type Atividade = { id, titulo, dataAtividade }
```

Campo do tipo de domínio é `camelCase`, com o substantivo em português: `dataAtividade`.

Prop de componente e variável interna ficam sempre em inglês, mesmo quando a tela nasce de um
protótipo do Claude Design: `<Modal open={open} onClose={close} />`. Duas exceções:

- Texto exibido continua em português: `<Button>Registrar atividade</Button>`.
- Valor de domínio como string continua em português quando é vocabulário do negócio. Estado de
  interface fica em inglês: `tone="success"`.

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
| Dado de exemplo               | `mock.ts`      |

O nome é fixo, sem prefixo nem sufixo com o nome da tela.

| Situação                              | Obrigatório                                                                                                    |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Tela que busca dado                   | `Loading.tsx` e `Empty.tsx`; a falha cai no `error.tsx` do grupo, e `Error.tsx` só existe com mensagem própria |
| Componente que recebe dado assíncrono | `Skeleton.tsx`                                                                                                 |
| Tela estática                         | nenhum                                                                                                         |

Vazio de cadastro e vazio de filtro são textos diferentes: um convida a criar o primeiro
registro, o outro explica que o filtro não encontrou nada e oferece limpar.

## Estilo (Panda CSS)

Todo `css()`/`styled()` vive em `styles.ts`, e `index.tsx` só faz `import * as S from './styles'`.

- `styled()` vira uma tag própria: `<S.Cabecalho>`.
- `css()` é só uma classe para um elemento que já existe: `className={S.destaque}`.

Exceção: os patterns do Panda (`HStack`, `VStack`, `Grid`, `Flex`, `Box`) podem ser usados direto
no `index.tsx`.

Valor calculado em runtime dentro de `css()`/`styled()` quebra a extração estática. Isso é sinal
de que o valor deveria ser variante de `recipe`. A exceção útil é largura de barra de progresso,
que vai em `style` inline ou variável CSS.

### Borda: longhands, nunca shorthand direcional com `borderColor`

```ts
// ❌ dois pontos escrevem border-right-color, e quem vence é a ordem das classes atômicas
borderRight: '1px solid',
borderColor: 'border.default',

// ✅
borderRightWidth: '1px',
borderRightStyle: 'solid',
borderRightColor: 'border.default',
```

### Dois grupos de variante na mesma propriedade

Se dois grupos de variante podem ser combinados e tocam a mesma propriedade, a combinação vai
inteira para `compoundVariants`, nunca dividida entre os dois grupos.

## Quebra de componente

```
Sub-componente serve a 2+ telas?
  sim → @design-system, no nível atômico correspondente
  não → _components/ da própria tela
```

## Custom hook

Só com transformação pesada de dado, queries dependentes entre si ou reuso da mesma busca em 2+
telas. Envolver uma única query em hook não é motivo.

## Server e Client

- Página é Server Component por padrão.
- `'use client'` fica no arquivo mais baixo possível da árvore.
- Componente que apenas exibe dado não vira client.

## TypeScript

- `strict` ligado, `any` proibido.
- Retorno de função exportada é explícito. Exceção: `*.queries.ts`, onde anotar perde o tipo da
  chave que `queryOptions()` infere.
- Tipo de domínio vem por inferência do schema Valibot.

## Formulário

- React Hook Form com resolver Valibot, schema em `schema.ts`.
- Rótulo sempre visível. Regra fica em texto junto ao campo, nunca no placeholder.
- Erro aparece no próprio campo e diz o que fazer a seguir.
- Enquanto envia, o botão fica desabilitado e visível.
- Falha de rede não limpa o que foi digitado (RNF24).

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
