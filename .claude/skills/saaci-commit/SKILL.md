---
name: saaci-commit
description: Sugere mensagem de commit em Conventional Commits, com assunto em português, compatível com o commitlint do SAACI-web. Use quando o usuário pedir a mensagem de commit, "sugere o commit" ou o texto de commit de uma etapa concluída. Nunca executa git commit nem git push, só entrega o texto.
---

# saaci-commit

Só sugere texto. Nunca roda `git commit` nem `git push`: commitar é decisão de quem contribui.

## Passo 1: coletar contexto

`git status` e `git diff` (staged e não staged) para entender o que mudou. Se nada estiver em stage,
avise e sugira com base no working tree, deixando claro que falta o `git add`.

## Passo 2: montar a mensagem

Formato: `<tipo>(<escopo>): <assunto>`

- **Tipo:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `ci`, `build`.
  O tipo é em inglês; o resto é em português.
- **Escopo:** opcional. Use quando ele esclarece (`claude`, `design-system`, `services`, `doc`,
  `login`). O histórico atual quase não usa escopo, então `feat: cria conta de exemplo` também vale.
- **Assunto:** verbo no imperativo presente, sem ponto final, até **72 caracteres** no cabeçalho
  inteiro. O `commitlint.config.mjs` desliga a regra de caixa do inglês de propósito, então
  "adiciona X" e "corrige Y" passam.
- **Corpo:** opcional, até 3 linhas. Explica o **porquê**, nunca repete o que o diff já mostra.
- **Breaking change** (quebra contrato ou exige refatorar outro lugar): o tipo leva `!`
  (`refactor!: ...`) e o corpo ganha uma linha `BREAKING CHANGE:` dizendo o quê.

## Passo 3: casos que mudam a sugestão

- **Diff mistura tipos claramente diferentes** (um `feat` e um `fix` sem relação): diga que devia ser
  dois commits e dê uma mensagem para cada. Nunca force `chore: ajustes`.
- **O diff toca `doc/`:** o hook de `pre-commit` exige uma ADR em `doc/adr/` no mesmo commit. Se não
  houver, avise antes de entregar a mensagem. Correção de digitação que não muda regra usa
  `--no-verify`, e isso o usuário decide.
- **Lock file ou arquivo que o usuário não tocou** entrando no diff: avise antes de sugerir.

Ver `exemplos.md` para casos reais do projeto.
