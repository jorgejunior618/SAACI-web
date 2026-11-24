# Como contribuir

Obrigado pelo interesse no SAACI-web. Este guia diz como propor uma mudança do começo ao fim.

## Antes de começar

- Leia o [README](README.md) para rodar o projeto (Node 22 e pnpm, nunca npm).
- Leia o documento de `doc/` da sua tarefa. A tabela "Antes de agir" de
  [.claude/CLAUDE.md](.claude/CLAUDE.md) indica qual é.
- Para mudança grande, abra uma issue antes e combine a ideia com a equipe.
- Siga o [Código de Conduta](CODE_OF_CONDUCT.md).

## Licença e DCO

O SAACI-web é distribuído sob a [GNU AGPL v3.0](LICENSE) (`AGPL-3.0-only`). Toda contribuição
entra sob essa mesma licença, e o copyright de cada trecho continua sendo de quem o escreveu.

Para declarar isso, cada commit leva a assinatura do
[Developer Certificate of Origin](https://developercertificate.org) (DCO). Com ela, você afirma
que escreveu a mudança ou que tem o direito de enviá-la sob a licença do projeto. Para assinar,
basta usar `-s` no commit:

```bash
git commit -s -m "feat: adiciona o painel de horas"
```

O `-s` acrescenta ao final da mensagem a linha
`Signed-off-by: Seu Nome <seu-email@exemplo.com>`, com o nome e o e-mail do `git config`. O
e-mail precisa ser o mesmo do autor do commit.

O check **"Assinatura DCO dos commits"** confere todo PR para a `dev`. Se ele reprovar, a
mensagem do check diz quantos commits assinar de uma vez com `git rebase --signoff` e como
mandar de novo com `git push --force-with-lease`. Colaborador que dá push direto na `dev` também
assina os commits.

### Cabeçalho de licença

Todo arquivo `.ts` e `.tsx` de `src/` começa com estas duas linhas, inclusive arquivo novo:

```ts
// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.
```

O ESLint cobra o cabeçalho (regra `saaci/license-header`), e o `pnpm lint:fix` insere as duas linhas
quando elas faltam. O hook do commit faz o mesmo nos arquivos alterados, então arquivo novo ganha o
cabeçalho sozinho.

Ficam de fora o código gerado: `src/styled-system/` e `src/@supabase/database.types.ts`. Na
primeira contribuição, acrescente seu nome e o link do seu perfil do GitHub ao [AUTHORS](AUTHORS)
no mesmo PR, no formato `Nome <https://github.com/usuario>`.

## Fluxo

### Quem não é colaborador do repositório

1. Faça um fork e trabalhe a partir da `dev` do fork, não da `main`.
2. Crie uma **branch separada** a partir da `dev`, com prefixo do tipo: `feat/`, `fix/`,
   `docs/`, `refactor/`, `test/` ou `chore/`. Exemplo: `feat/painel-de-horas`. PR que sai da
   `dev` ou da `main` do fork é reprovado.
3. Faça commits em [Conventional Commits](https://www.conventionalcommits.org/pt-br/), com o
   assunto em português e assinados com `git commit -s` (seção "Licença e DCO"). O hook do Husky
   confere a mensagem com o commitlint.
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
"Alvo e branch do PR". Na `dev`, PR de fora também precisa do "Assinatura DCO dos commits".

## Regras do código

- TypeScript `strict`, sem `any`.
- Identificadores em inglês. Texto exibido, rotas e pastas de tela em português.
- Mudou algo em `doc/`? A mudança entra com uma ADR em `doc/adr/` no mesmo commit.
- Pasta nova em `src/` ou arquivo movido entre pastas precisa ser combinado antes com a equipe.

## Reportar bug ou sugerir melhoria

Use os templates de issue. Vulnerabilidade de segurança **não** vai em issue pública: veja o
[SECURITY.md](SECURITY.md).
