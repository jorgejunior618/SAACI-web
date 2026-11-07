# 0002. Identificadores em inglês, português só na rota e na tela

- **Status:** Proposta
- **Data:** 07/11/2026

## Contexto

O esqueleto do `src/` misturava idiomas sem critério. A equipe decidiu em 06/11/2026 que apenas a
rota e as telas ficam em português, e o resto segue o design system, em inglês. Os primeiros
componentes de `components/` (`ErroDeTela`, `TelaNaoEncontrada`) e os primeiros services
(`getAtividades`, `services/atividades/`) nasceram com nome em português, contra o que o
`@design-system` já faz (`Button`, `TextField`). `doc/convencoes-codigo.md` mandava "substantivo de
domínio em português", o que dá pasta, arquivo e função em dois idiomas.

## Decisão

- **Em português:** a URL e as pastas de `app/`, a pasta de cada tela em
  `features/<dominio>/<Tela>/` (`/entrar`, `features/acesso/Entrar`) e o texto exibido.
- **Em inglês:** todo o resto. Pasta, arquivo, função, tipo, campo, variável e prop, inclusive
  `services/` (`services/activities/activities.api.ts`, `getActivities`, `type Activity`,
  `countedHours`) e `components/` (`ErrorScreen`, `NotFoundScreen`, `MainNav`).
- O banco continua em português (tabela e coluna em `snake_case`), e o service traduz para o tipo
  de domínio em inglês e `camelCase`, como `doc/modelagem-dados.md` já descreve.
- Valor de string que é vocabulário do negócio continua em português, como já diz o doc
  (`'conta' | 'parcial' | 'nao_conta'`).
- `features/<dominio>/` usa o nome em português da tela e `services/<dominio>/` o nome em inglês
  (`features/atividades/` fala com `services/activities/`).

## Consequências

- Os cinco services existentes foram renomeados: `account`, `profile`, `rules`, `activities` e
  `progress`. Os erros também (`InvalidCredentialsError`, `StaleActivityError`).
- `doc/convencoes-codigo.md`, `estrutura-pastas.md`, `camada-servicos.md`, `react-query.md`,
  `arquitetura.md` e `testes.md` usam os nomes novos nos exemplos, e o `.claude/CLAUDE.md` repete a
  regra.
- Quem criar código nomeia em inglês. O revisor barra o contrário.
- O mesmo domínio tem dois nomes (tela em português, service em inglês). É o preço de manter a URL e
  o vocabulário da tela iguais ao do produto.

## Alternativas descartadas

- **Tudo em português, inclusive o domínio.** Destoa do design system e dos nomes de biblioteca que o
  código importa, e mistura verbo em inglês com substantivo em português na mesma função.
- **Tudo em inglês, inclusive rota e tela.** A URL e o nome da tela são o vocabulário do produto e
  casam com os requisitos e com o protótipo, que estão em português.
- **Inglês em pasta e função, campos do tipo em português.** Deixa dois idiomas dentro do mesmo tipo.
