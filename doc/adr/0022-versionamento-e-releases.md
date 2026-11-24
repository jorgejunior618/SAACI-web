# 0022. Versão em semver, por tag, com o GitHub Release como changelog

- **Status:** Aceita
- **Data:** 23/11/2026

## Contexto

O projeto ficou aberto a contribuições (CONTRIBUTING, código de conduta, licença AGPL-3.0) e já
roda em teste em produção, mas não tem versão: o `package.json` está em `0.0.0`, não há tag e
não há registro do que mudou entre uma entrega e outra. Quem reporta um bug não tem como dizer em
qual versão ele aparece, e quem chega não vê a evolução do projeto.

A `main` bloqueia push direto para todos, inclusive para workflow (ruleset "Proteção da main"). Por
isso, nenhuma automação consegue commitar um `CHANGELOG.md` ou subir a versão do `package.json`
na `main` sem abrir uma exceção nessa regra.

## Decisão

- A versão segue o semver e mora na **tag `vX.Y.Z`**, não no `package.json`. O pacote é `private`
  e não vai para o npm, então o campo `version` fica em `0.0.0` e não é usado.
- O **GitHub Release** de cada tag é o changelog, com as notas geradas pelo GitHub a partir dos PRs.
  O `CHANGELOG.md` da raiz só aponta para a página de Releases.
- A versão é publicada pelo workflow manual **Release** (`.github/workflows/release.yml`), rodado
  na `main` por um mantenedor depois do merge do PR `dev` → `main`. Ele só cria a tag e o Release.
- A próxima versão é calculada por `scripts/next-version.mjs`, a partir dos Conventional Commits
  desde a última tag: breaking change sobe o major (o minor enquanto a versão for 0.x), `feat` sobe
  o minor, `fix` e `perf` sobem o patch, e os outros tipos não geram release. Sem tag, a primeira
  versão é `0.1.0`. O campo "versao" do workflow aceita uma versão explícita.
- O projeto fica em 0.x até a entrega do TCC. A `1.0.0` é publicada com a versão final.

## Consequências

- Cada versão tem tag, notas e link estáveis. Issue de bug pode citar a versão.
- Não entra dependência nova: o cálculo é um script de cerca de 60 linhas, sem pacote.
- O título do PR passa a importar mais, porque vira a linha da nota do release (o template de PR
  já pede Conventional Commits no título).
- Publicar uma versão é um passo manual. Se ninguém rodar o workflow, a `main` anda sem tag nova.
- `doc/tecnologia.md` ganha a linha "Versão e release".

## Alternativas descartadas

- **release-please.** Abre um PR de release com o `CHANGELOG.md` e a versão no `package.json`, mas o
  PR criado pelo token do workflow não dispara o CI, e os checks obrigatórios da `main` travariam o
  merge. Contornar isso pede um token pessoal (PAT) nos secrets, com escopo de escrita.
- **Script local `pnpm release`** (commit-and-tag-version). Dependência nova, e o resultado depende
  de alguém lembrar de rodar o script na `dev` antes do PR de produção.
- **Exceção no ruleset para o workflow commitar na `main`.** Abre a única porta que a regra fecha,
  para ganhar só um arquivo de changelog que o Release já cobre.
