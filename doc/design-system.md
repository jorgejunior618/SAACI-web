# Design System

`src/@design-system/` concentra o que é usado por mais de uma tela. A fonte visual é a pasta
`design-system/` na raiz (exportada do Claude Design): tokens em `tokens/tokens.json`, catálogo em
`docs/componentes.md` e o resultado de cada tela em `saaci-design-png/`. Dela vêm só valores e
resultado final; o HTML e o CSS de lá não são copiados, os componentes são reescritos em Panda.

## O que entra

Só componente catalogado em `design-system/` (`docs/componentes.md`, `docs/fundamentos.md`, `css/`),
mesmo que nenhuma tela o use ainda. Fora do catálogo, ficam só:

- `ThemeToggle`: pedido da equipe (botão de modo escuro em toda tela).
- `AppFrame`: a coluna de 480px de `fundamentos.md`.
- `LoadingState`: spinner grande de tela inteira.
- `Icon`: o invólucro de `lucide-react` com o traço de 1,5px do design.

Componente de domínio do catálogo (`TotalCard`, `RulePanel`, `CalcTable`…) fica, porque é desenho da
equipe de design. Componente que não está no catálogo e ninguém pediu não entra por "provavelmente
vamos precisar".

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

Componente nasce local, em `_components/` da tela que o usa.

Vira compartilhado quando a **segunda** tela precisa dele, nunca por antecipação. Ao promover, o
componente é movido e passa a ter uma origem só; cópia entre telas não é aceita.

### Exceção: componente que carrega comportamento, não só visual

`ConfirmSheet` nasceu direto no design system, sem esperar a segunda tela. Dois motivos, e os dois
precisam estar presentes para a exceção valer, não só um:

- **O componente encapsula comportamento que ninguém deveria reimplementar por conta própria.**
  `ConfirmSheet` usa `<dialog>` nativo por `showModal()`: foco preso, camada superior e fechamento
  por `Esc` vêm do navegador. Copiar isso à mão em `<div>` é a origem mais comum de modal
  inacessível. Reescrever esse comportamento em cada tela que precisasse de confirmação seria pior
  que promover cedo.
- **Ele não tem "versão local" que faça sentido.** Uma confirmação é chamada de qualquer tela e
  aparece por cima da tela inteira, fora do fluxo de quem a chamou. Não existe uma versão "só desta
  tela" dela para nascer em `_components/`.

Um componente puramente visual sem essas duas características continua seguindo a regra normal:
nasce local, sobe na segunda tela. A exceção não é precedente para promover por antecipação. É sobre
uma categoria específica de componente que a regra padrão não cobria. Um `Toast` com provider, se
um dia entrar no catálogo, cai na mesma exceção.

## Tokens

Os valores vivem em `tokens/` e no `panda.config.ts`. Este documento não os repete.

- Componente consome token semântico, nunca valor cru.
- Cores semânticas com versão clara e escura (`base` e `_dark`). O tema resolvido fica em
  `data-theme` no `<html>`, escrito por um script antes da primeira pintura, para a tela não piscar
  no tema errado. Sem escolha salva, segue o sistema (Automático); o `ThemeToggle` do `AppFrame`
  troca entre Claro e Escuro. A escolha do Automático pela tela volta com o Perfil.
- Só a `preset-base` do Panda: valor fora dos tokens do SAACI não tem nome.
- Tipografia por `textStyle` (hero, display, heading, title, body, bodyStrong, support, label,
  caption), com a fonte Geist servida pelo próprio site via `next/font`.
- Borda, não sombra. A única sombra (`overlay`) é do bottom sheet.
- `brand.soft` só para opção marcada. `ink.subtle` nunca é texto de leitura. `danger.fill` só no
  botão destrutivo. `redemoinho` só no logo, na capa e no spinner grande.
- Cor de status é categoria própria: não deriva da cor de marca nem se confunde com ela.
- Número de horas sempre com `tabular-nums`, para a coluna alinhar.

## Recipes

Variação visual é `recipe` do Panda, tipada, em `recipe.ts`. Não se cria variação por prop booleana
solta nem por classe condicional montada na tela.

`recipe.ts` é só para o elemento principal do componente, o que tem variante de cor, tamanho ou
aparência de verdade.

Duas peças que só diferem em **conteúdo ou formatação** (mesma borda, mesmo raio, mesmo
espaçamento) são o **mesmo atom com prop**, nunca dois componentes. É o caso do campo de senha: é o
`TextField` com `type` e `action` ("Mostrar"/"Ocultar"), não um `PasswordField`. Dois componentes
para a mesma caixa acabam divergindo em tamanho, como primário, secundário e destrutivo de um botão
divergiriam antes de virar recipe único.

## Estilos auxiliares

Pedaço de UI que não tem variante própria (um spinner, um wrapper, um ícone de estado) vira
`styled()` do Panda em `styles.ts`. A regra geral de onde o Panda entra em qualquer componente ou
tela está em `convencoes-codigo.md`.

Se o pedaço ganhar variante depois (cor, tamanho, estado), ele sai de `styles.ts` e vira
`recipe.ts`.

## Contrato de componente

- Props explícitas e tipadas; `any` não é aceito.
- Componente que recebe dado assíncrono expõe `Skeleton`.
- Elemento interativo tem rótulo acessível e alvo de toque de pelo menos 44px.
- Ícone nunca aparece sozinho: sempre com texto.
- Altura não é travada em elemento que contém texto.

## DS_REFERENCE.md

Índice dos componentes e seus estados. É atualizado no mesmo commit que cria ou altera um
componente: referência desatualizada é pior que ausente.
