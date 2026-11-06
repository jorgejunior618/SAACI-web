# Convenções de código

## Idioma

Substantivo de domínio em português, verbo e termo técnico em inglês.

```
getAtividades()      createAtividade()      updatePerfil()
type Atividade = { id, titulo, dataAtividade }
```

Coluna do banco é `snake_case` em português; o tipo de domínio é `camelCase`. A tradução acontece no
service (`camada-servicos.md`).

> O código do login ainda tem verbos em português (`entrar`, `sair`, `destinoDaSessao`, `lerDb`).
> Código novo segue esta regra, e o antigo é renomeado numa tarefa à parte.

### Prop de componente e variável interna: sempre em inglês

Vale para `@design-system/` e para `features/`, mesmo quando o componente nasce de um protótipo do
Claude Design, que nomeia em português. A tradução acontece ao trazer o componente para o código; o
protótipo não define a API final.

```
// ❌ copiado direto do protótipo
<Modal aberto={open} onFechar={fechar} />

// ✅ traduzido ao entrar no código
<Modal open={open} onClose={close} />
```

Duas exceções, e só essas:

- **Texto exibido (copy)** continua em português, porque é conteúdo, não identificador:
  `<Button>Registrar atividade</Button>`.
- **Valor de domínio como string** continua em português quando é vocabulário do negócio, não estado
  de interface. `StatusBadge status="conta" | "parcial" | "nao_conta"` é do produto;
  `InlineMessage tone="success" | "danger"` é estado de interface, por isso fica em inglês.

O texto de tela segue `escrita-de-interface.html` e o glossário do `SAACI-produto`.

## Arquivos co-localizados

| Situação                      | Arquivo        |
| ----------------------------- | -------------- |
| Carregamento de tela inteira  | `Loading.tsx`  |
| Carregamento de um componente | `Skeleton.tsx` |
| Falha com mensagem própria    | `Error.tsx`    |
| Lista sem resultado           | `Empty.tsx`    |
| Estilo                        | `styles.ts`    |
| Tipagem densa                 | `types.ts`     |
| Função pura local             | `utils.ts`     |
| Schema de formulário          | `schema.ts`    |

O nome é fixo, sem prefixo nem sufixo com o nome da tela (nada de `LoadingAtividades.tsx`). Dado de
exemplo não é arquivo da tela: vem de `services/<dominio>/<dominio>.mock.ts`.

| Situação                              | Obrigatório                                                      |
| ------------------------------------- | ---------------------------------------------------------------- |
| Tela que busca dado                   | `Loading.tsx` e `Empty.tsx`; a falha cai no `error.tsx` do grupo |
| Componente que recebe dado assíncrono | `Skeleton.tsx`                                                   |
| Tela estática                         | nenhum                                                           |

`Empty.tsx` cobre todo caso em que a busca teve sucesso mas devolveu zero resultados úteis. Vazio de
cadastro e vazio de filtro são textos **diferentes**: um convida a criar o primeiro registro, o outro
explica que o filtro não encontrou nada e oferece limpar.

## Estilo (Panda CSS)

Todo `css()`/`styled()` vive em `styles.ts`, sem exceção por tamanho. O `index.tsx` só faz
`import * as S from './styles'`.

- `styled()` vira uma tag própria: `<S.Cabecalho>`.
- `css()` é só uma classe para um elemento que já existe: `className={S.destaque}`.

Exceção: os patterns prontos do Panda (`HStack`, `VStack`, `Grid`, `Flex`, `Box`) podem ser usados
direto no `index.tsx`, como se usa um `<div>`.

Os dois compilam para classe estática em build. O que quebra essa extração é passar valor calculado
em runtime para dentro deles: sinal de que o valor deveria ser variante de `recipe`. A exceção útil é
a largura de uma barra de progresso, que vai em `style` inline ou variável CSS.

### Panda: dois pontos que quebram em silêncio

Nos dois casos, duas classes atômicas escrevem a mesma propriedade, e quem vence é a **ordem no CSS
compilado**, não a ordem em que você escreveu.

**1. Borda direcional com `borderColor` solto.** Use longhands.

```ts
// ❌ dois pontos escrevem border-right-color
borderRight: '1px solid',
borderColor: 'line',

// ✅
borderRightWidth: '1px',
borderRightStyle: 'solid',
borderRightColor: 'line',
```

(`border` com `borderColor`, ambos em todos os lados, não tem o problema.)

**2. Dois grupos de variante do `recipe` tocando a mesma propriedade.** A combinação vai inteira para
`compoundVariants`, que gera uma classe combinada de especificidade maior.

```ts
// ❌ variant.secondary e appearance.text mexem em borderColor e background
// ✅ appearance.text não declara cor, fundo nem borda; a combinação fica em compoundVariants
compoundVariants: [
  {
    variant: 'secondary',
    appearance: 'text',
    css: { borderColor: 'transparent', background: 'transparent', color: 'ink' },
  },
]
```

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

Vitest + Testing Library, com o `.test.ts` ao lado do que testa e foco em comportamento visível. O
que é obrigatório está em `testes.md`.

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
