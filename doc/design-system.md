# Design System

`src/@design-system/` concentra o que é usado por mais de uma tela. Do design system vêm só os
valores (tokens, cores, fonte, espaço) e o resultado final; o HTML e o CSS do protótipo não são
copiados, os componentes são reescritos em Panda.

## O que entra

Só componente do catálogo do design system, registrado em `DS_REFERENCE.md` no commit em que nasce,
mesmo que nenhuma tela o use ainda. Fora do catálogo, ficam só:

- `AppFrame`: a coluna de `sizes.content` (480px).
- `LoadingState`: spinner grande de tela inteira.
- `Icon`: o invólucro de `lucide-react` com o traço de 1,5px do design.

Componente que não está no catálogo e ninguém pediu não entra por "provavelmente vamos precisar".

## Níveis

| Nível        | Contém                                       |
| ------------ | -------------------------------------------- |
| `tokens/`    | cor, tipografia, espaçamento, raio           |
| `atoms/`     | elemento indivisível                         |
| `molecules/` | composição de atoms com uma responsabilidade |
| `organisms/` | bloco completo de interface                  |
| `templates/` | esqueleto de página                          |

## Hierarquia de import

```
templates → organisms → molecules → atoms
```

Import é unidirecional. Nível não importa de cima nem pula degraus. Atom não importa nada do próprio
design system. `@design-system` também nunca importa `services/`, `features/` ou `next/navigation`
(ESLint garante): ele é UI pura, sem dado e sem rota.

## Promoção

Componente do catálogo já nasce aqui (ver "O que entra"). Os demais nascem locais, em `_components/`
da tela que os usa, e sobem quando a **segunda** tela precisa deles, nunca por antecipação. Ao
promover, o componente é movido e passa a ter uma origem só; cópia entre telas não é aceita.

## Tokens

Os valores vivem em `tokens/` e no `panda.config.ts`. Este documento não os repete.

- Componente consome token semântico, nunca valor cru.
- Cores semânticas com versão clara e escura (`base` e `_dark`). O tema segue o do
  sistema, só por CSS (`@media (prefers-color-scheme: dark)`), sem script e sem escolha manual.
- Só a `preset-base` do Panda: valor fora dos tokens do SAACI não tem nome.
- Tipografia por `textStyle` (display, title, body, bodyStrong, support, label, caption), com a
  fonte Geist servida pelo próprio site via `next/font`.
- Borda, não sombra. A única sombra (`overlay`) é do bottom sheet.
- `brand.soft` só para opção marcada. `ink.subtle` nunca é texto de leitura. `danger.fill` só no
  botão destrutivo. `gorro` só no logo e na capa. `redemoinho` só na capa e no spinner grande.
- Número de horas sempre com `tabular-nums`, para a coluna alinhar.

## Recipes

Variação visual é `recipe` do Panda, tipada, em `recipe.ts`, só para o elemento principal do
componente. Não se cria variação por prop booleana solta nem por classe condicional montada na tela.
Pedaço sem variante própria (um spinner, um wrapper) fica em `styles.ts`; se ganhar variante, vira
`recipe.ts`.

Duas peças que só diferem em **conteúdo ou formatação** são o **mesmo atom com prop**, nunca dois
componentes. O campo de senha é o `TextField` com `type` e `action` ("Mostrar"/"Ocultar"), não um
`PasswordField`: dois componentes para a mesma caixa divergem em tamanho.

## Contrato de componente

- Props explícitas e tipadas; `any` não é aceito.
- Componente que recebe dado assíncrono expõe `Skeleton`.
- Elemento interativo tem rótulo acessível e alvo de toque de pelo menos 48px (`sizes.touch`).
- Ícone nunca aparece sozinho: sempre com texto.
- Altura não é travada em elemento que contém texto.

## DS_REFERENCE.md

Índice dos componentes e seus estados, atualizado no mesmo commit que cria ou altera um componente:
referência desatualizada é pior que ausente.
