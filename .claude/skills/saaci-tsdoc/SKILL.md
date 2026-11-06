---
name: saaci-tsdoc
description: Escreve TSDoc em PT-BR para o tooltip do editor (hover e autocomplete) em função, hook, componente, tipo e interface de arquivos .ts e .tsx de src/. Use ao criar ou alterar símbolo exportado, mesmo sem pedido de documentação, e quando o dev pedir para documentar um bloco ou arquivo. Não use em arquivo de teste, script, config, código gerado nem em símbolo não exportado fora do modo revisão.
---

# saaci-tsdoc

> Origem: skill `tsdoc` do forward-kit (fwd 0.2.0), adaptada ao SAACI-web.

Escreve TSDoc para um leitor específico: alguém em outro arquivo, meses depois, que passa o mouse sobre o símbolo ou abre o autocomplete. O balão do editor é o produto. Os comentários saem em PT-BR e não mudam a lógica.

## Quando usar

- **Modo criação:** a skill entra sozinha ao criar ou alterar função, hook, componente, tipo ou interface exportados. Documenta só o que está sendo criado ou alterado, no mesmo edit do código. Sem passo separado, sem pedir confirmação, sem documentar o resto do arquivo. O resumo final cabe em uma linha.
- **Modo revisão:** o dev pediu para documentar. Com bloco selecionado, documenta o bloco. Sem seleção, percorre o arquivo inteiro e documenta tudo que passa no teste do balão, exportado ou não.

## Neste projeto

- A regra é do projeto (`.claude/CLAUDE.md`): símbolo exportado **novo ou alterado** em `src/` leva TSDoc. Não há retrofit do código antigo.
- Props de componente se documentam na interface ou no tipo `Props`, campo a campo. A skill vale também para `services/`, `utils/`, `hooks/` e `@design-system/`.
- `export default` de `page.tsx`, `layout.tsx`, `error.tsx` e `not-found.tsx` só leva comentário se houver armadilha que o nome não conta.

## Quando não usar

- Arquivo de teste (`*.test.ts(x)`), script (`scripts/`), config, código gerado (`src/styled-system/`).
- Import, linha só de `export`, nome autoexplicativo, getter ou setter trivial, wrapper de uma linha.

## Fluxo

1. **Leia** o arquivo ou bloco inteiro antes de escrever. O TSDoc reflete a intenção real do código.
2. **Procure um uso real** do símbolo exportado no projeto (Grep) antes de escrever o `@example`. Exemplo inventado é pior que nenhum.
3. **Aplique o teste do balão** a cada símbolo:
   - O que quem usa, em outro arquivo, precisa saber e não deduz do nome e do tipo?
   - A primeira frase sozinha já responde? É a única parte que aparece no autocomplete.
   - Existe armadilha (ordem de chamada, efeito colateral, valor que vem vazio, precisa de Provider)? É o conteúdo mais valioso.
   - Se tudo se resolve pelo nome, não escreva comentário. Ruído no balão custa mais que ausência.
4. **Escreva** pelas regras abaixo e aplique com Edit.
5. **Resumo.** Em modo revisão, liste `arquivo → símbolo (tipo)`. Em modo criação, uma linha.

## Regras de escrita

- Voz ativa, sujeito explícito: "Busca o plano do usuário".
- Uma frase, uma ideia. A segunda vira `@remarks`.
- Verbo no lugar de nominalização: "Valida o CPF", não "Faz a validação do CPF".
- Palavra do dia a dia no lugar de jargão. Termo sem tradução comum (debounce, cache, retry) pode ficar, com o efeito explicado na mesma frase.
- A primeira frase começa com verbo no presente, na 3ª pessoa, e não repete o nome do símbolo nem as palavras "função", "hook" ou "componente".
- `@param` descreve significado e origem, nunca o tipo.
- **Componente React:** a doc de cada prop vai na interface de Props, campo a campo. `@param props.x` na função não aparece em lugar nenhum.

### Vícios a cortar

| Não escreva                                           | Escreva                               |
| ----------------------------------------------------- | ------------------------------------- |
| Travessão ligando ideias                              | Vírgula, ponto ou duas frases         |
| "Não apenas valida, mas também formata"               | "Valida e formata"                    |
| "É importante notar que", "Vale ressaltar", "Em suma" | Comece pelo fato                      |
| "Basicamente", "essencialmente", "simplesmente"       | Corte a palavra                       |
| "Robusto", "poderoso", "elegante", "facilmente"       | Corte                                 |
| "Lida com toda a lógica de X"                         | Diga qual lógica, ou não diga         |
| Emoji, reticências, negrito espalhado                 | Nada. Negrito só em alerta curto real |

Se dá para cortar a palavra sem perder informação, corte. Adjetivo que não muda a decisão de quem lê é ruído.

## Tags

Sempre: `@param`, `@returns`, `@example`. Quando fizer diferença: `@deprecated`, `@defaultValue`, `@throws`, `@see`, `{@link}`, `@remarks`, `@typeParam`.

- O que cada tag faz no editor e a armadilha de cada uma: [references/tags.md](references/tags.md). Leia antes de usar uma tag fora do grupo "sempre".
- Modelos por contexto (função, hook, componente, tipo, constante, store, obsoleto, genérico): [references/exemplos.md](references/exemplos.md).
