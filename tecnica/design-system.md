# Design System

`src/@design-system/` concentra o que é usado por mais de uma tela.

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

Import é unidirecional. Nível não importa de cima nem pula degraus.
Atom não importa nada do próprio design system.

## Promoção

Componente nasce local, em `_components/` da tela que o usa.

Vira compartilhado quando a **segunda** tela precisa dele — nunca por
antecipação. Ao promover, o componente é movido e passa a ter uma origem
só; cópia entre telas não é aceita.

### Exceção: componente que carrega comportamento, não só visual (Fase 7)

`Modal` (`atoms/`) e `Toast` (`molecules/`, com `ToastProvider` em
`src/providers/`) nasceram direto no design system, na primeira tela
que os usou — sem esperar a segunda. Dois motivos, e os dois precisam
estar presentes para a exceção valer, não só um:

- **O componente encapsula comportamento que ninguém deveria
  reimplementar por conta própria.** `Modal` usa `<dialog>` nativo por
  `showModal()` — foco preso, camada superior e fechamento por `Esc`
  vêm do navegador; copiar isso à mão em `<div>` é a origem mais comum
  de modal inacessível. Reescrever esse comportamento em cada tela que
  precisasse de confirmação seria pior que promover cedo.
- **Ele não tem "versão local" que faça sentido.** `Toast` é chamado de
  qualquer tela, aparece fora da árvore de quem chamou, e sobrevive à
  navegação — isso exige contexto React (`ToastProvider`) montado uma
  vez no layout raiz. Não existe uma versão "só desta tela" dele para
  nascer em `_components/`.

Um componente puramente visual sem essas duas características continua
seguindo a regra normal — nasce local, sobe na segunda tela. Esta
exceção não é precedente para promover por antecipação; é sobre uma
categoria específica de componente que a regra padrão não cobria.

## Tokens

Os valores vivem em `tokens/` e no `panda.config.ts`. Este documento não
os repete.

- Componente consome token semântico, nunca valor cru.
- Cor de status é categoria própria: não deriva da cor de marca nem se
  confunde com ela.
- A fonte de assinatura aparece só no logotipo. Número, KPI e dado
  tabular nunca a usam.
- Coluna de número usa numeração tabular para alinhar.

## Recipes

Variação visual é `recipe` do Panda, tipada. Não se cria variação por
prop booleana solta nem por classe condicional montada na tela.

`recipe.ts` é só para o elemento principal do componente — o que tem
variante de cor/tamanho/aparência de verdade.

Duas peças do print que só diferem em **conteúdo/formatação** (não na
caixa em si — mesma borda, mesmo raio, mesmo espaçamento) são o **mesmo
atom com prop**, nunca dois componentes. Foi o caso de "Campo de texto" e
"Campo de valor": viraram um `TextField` só, com `prefix`/`numeric` —
constrói-los separado é como o `Button` primário/secundário/destrutivo
acabaram divergindo em tamanho antes de virar recipe único.

## Estilos auxiliares

Pedaço de UI que não tem variante própria (um spinner, um wrapper, um
ícone de estado) vira `styled()` do Panda em `styles.ts` — regra geral de
onde o Panda entra em qualquer componente/tela está em
`convencoes-codigo.md`.

Se o pedaço ganhar variante depois (cor, tamanho, estado), ele sai de
`styles.ts` e vira `recipe.ts`.

## Contrato de componente

- Props explícitas e tipadas; `any` não é aceito.
- Componente que recebe dado assíncrono expõe `Skeleton`.
- Elemento interativo tem rótulo acessível.
- Ícone nunca aparece sozinho: sempre com texto.
- Altura não é travada em elemento que contém texto.

## DS_REFERENCE.md

Índice dos componentes e seus estados. É atualizado no mesmo commit que
cria ou altera um componente — referência desatualizada é pior que
ausente.
