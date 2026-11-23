# Como contribuir

Obrigado pelo interesse no SAACI-web. Este guia diz como propor uma mudança do começo ao fim.

## Antes de começar

- Leia o [README](README.md) para rodar o projeto (Node 22 e pnpm, nunca npm).
- Leia o documento de `doc/` da sua tarefa. A tabela "Antes de agir" de
  [.claude/CLAUDE.md](.claude/CLAUDE.md) indica qual é.
- Para mudança grande, abra uma issue antes e combine a ideia com a equipe.
- Siga o [Código de Conduta](CODE_OF_CONDUCT.md).

## Fluxo

### Quem não é colaborador do repositório

1. Faça um fork e trabalhe a partir da `dev` do fork, não da `main`.
2. Crie uma **branch separada** a partir da `dev`, com prefixo do tipo: `feat/`, `fix/`,
   `docs/`, `refactor/`, `test/` ou `chore/`. Exemplo: `feat/painel-de-horas`. PR que sai da
   `dev` ou da `main` do fork é reprovado.
3. Faça commits em [Conventional Commits](https://www.conventionalcommits.org/pt-br/), com o
   assunto em português. O hook do Husky confere a mensagem com o commitlint.
4. Antes de abrir o PR, rode:

   ```bash
   pnpm format:check
   pnpm lint
   pnpm typecheck
   pnpm test
   ```

5. Abra o PR e **selecione `dev` como base**. O GitHub sugere a `main` por padrão, então troque
   antes de criar o PR. Preencha o template.

> **O check "Alvo e branch do PR" reprovou?** O PR aponta para a `main` ou sai da `dev` ou da
> `main` do seu fork. Para trocar o alvo, clique em **Edit** ao lado do título do PR e mude a
> base para `dev`: o check roda de novo sozinho. Se a branch de origem for o problema, crie uma
> branch separada e abra um PR novo a partir dela. A mensagem do check, na aba **Checks**, diz
> qual dos dois casos é o seu.

Para entrar na `dev`, o PR precisa de **2 aprovações** de colaboradores (um push novo derruba as
aprovações anteriores), **CI verde** e **todas as conversas do review resolvidas**.

### Colaborador

- Pode dar push direto na `dev`, ou abrir PR para ela a partir de uma branch própria.
- Leva a mudança para a `main` por PR (em geral `dev` → `main`), sem precisar de aprovação, com o
  CI verde e as conversas do review resolvidas.
- Ao revisar um PR de fora, só faça merge com as 2 aprovações. O GitHub mostra ao colaborador a
  opção de ignorar as regras ("bypass"): não use em PR externo.

## Regras das branches

| Branch | Push direto      | Merge de PR                              | Force push e exclusão |
| ------ | ---------------- | ---------------------------------------- | --------------------- |
| `main` | ninguém          | colaborador, com CI verde, sem aprovação | bloqueados            |
| `dev`  | só colaboradores | PR de fora: 2 aprovações e CI verde      | bloqueados            |

O CI verde são os jobs "Formato, lint, tipos, testes e build", "Banco, tipos e testes pgTAP" e
"Alvo e branch do PR".

## Regras do código

- TypeScript `strict`, sem `any`.
- Identificadores em inglês. Texto exibido, rotas e pastas de tela em português.
- Mudou algo em `doc/`? A mudança entra com uma ADR em `doc/adr/` no mesmo commit.
- Pasta nova em `src/` ou arquivo movido entre pastas precisa ser combinado antes com a equipe.

## Reportar bug ou sugerir melhoria

Use os templates de issue. Vulnerabilidade de segurança **não** vai em issue pública: veja o
[SECURITY.md](SECURITY.md).
