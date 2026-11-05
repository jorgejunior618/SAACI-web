# Design System

`src/@design-system/` concentra o que é usado por mais de uma tela. A fonte visual é a pasta
`design-system/` na raiz (exportada do Claude Design): tokens em `tokens/tokens.json`, catálogo em
`docs/componentes.md` e o resultado de cada tela em `saaci-design-png/`. Dela vêm só valores e
resultado final; o HTML e o CSS de lá não são copiados, os componentes são reescritos em Panda.

## O que entra

Só componente catalogado em `design-system/` (`docs/componentes.md`, `docs/fundamentos.md`, `css/`),
mesmo que nenhuma tela o use ainda. Fora do catálogo, ficam só `ThemeToggle` (pedido da equipe, ver
`decisoes.md`), `AppFrame` (coluna de 480px de `fundamentos.md`) e `LoadingState` (spinner grande
de tela inteira).

## Níveis

| Nível        | Contém                                       |
| ------------ | -------------------------------------------- |
| `tokens/`    | cor, tipografia, espaçamento, raio           |
| `atoms/`     | elemento indivisível                         |
| `molecules/` | composição de atoms com uma responsabilidade |
| `organisms/` | bloco completo de interface                  |
| `templates/` | esqueleto de página                          |

Import é unidirecional: `templates → organisms → molecules → atoms`. Atom não importa nada do
próprio design system.

## Promoção

Componente nasce em `_components/` da tela que o usa e sobe quando a segunda tela precisa dele.
Cópia entre telas não é aceita.

Exceção: componente que encapsula comportamento que ninguém deveria reimplementar e não tem
versão local que faça sentido, como `Modal` sobre `<dialog>` nativo e `Toast` com provider. Os
dois motivos precisam estar presentes.

## Tokens

- Cores semânticas com versão clara e escura (`base` e `_dark`). O tema resolvido fica em
  `data-theme` no `<html>`, escrito por um script antes da primeira pintura. Sem escolha salva, segue o
  sistema (Automático); o `ThemeToggle` do `AppFrame` troca entre Claro e Escuro. A escolha do
  Automático pela tela volta com o Perfil.
- Só a `preset-base` do Panda: valor fora dos tokens do SAACI não tem nome.
- Tipografia por `textStyle` (hero, display, heading, title, body, bodyStrong, support, label,
  caption), com a fonte Geist servida pelo próprio site via `next/font`.
- Borda, não sombra. A única sombra (`overlay`) é do bottom sheet.
- `brand.soft` só para opção marcada. `ink.subtle` nunca é texto de leitura. `danger.fill` só no
  botão destrutivo. `redemoinho` só no spinner grande.
- Número de horas sempre com `tabular-nums`.

## Recipes

Variação visual é recipe do Panda, tipada, em `recipe.ts`, só para o elemento principal do
componente. Duas peças que só diferem em conteúdo são o mesmo atom com prop. Pedaço sem variante
própria fica em `styles.ts`.

## Contrato de componente

- Props explícitas e tipadas.
- Componente que recebe dado assíncrono expõe `Skeleton`.
- Elemento interativo tem rótulo acessível e alvo de toque de pelo menos 44px.
- Ícone nunca aparece sozinho: sempre com texto.
- Altura não é travada em elemento que contém texto.

## DS_REFERENCE.md

Índice dos componentes e seus estados, atualizado no mesmo commit que cria ou altera um
componente.
