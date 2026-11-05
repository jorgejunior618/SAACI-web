# SAACI-web: roteador

Aplicação web do SAACI (Sistema de Apoio Acadêmico Colaborativo do IFCE). Produto, design e
requisitos vivem no repositório vizinho `../SAACI-produto`, que é a fonte de verdade do que
construir. Este repositório decide como construir.

## Antes de agir

| Tarefa                            | Leia primeiro                                                               |
| --------------------------------- | --------------------------------------------------------------------------- |
| Onde colocar uma lógica           | `doc/arquitetura.md`                                                        |
| Onde criar um arquivo             | `doc/estrutura-pastas.md`                                                   |
| Service, mock, tradução de erro   | `doc/camada-servicos.md`                                                    |
| Query, cache, invalidação         | `doc/react-query.md`                                                        |
| Componente, token, recipe         | `doc/design-system.md`, `src/@design-system/DS_REFERENCE.md`                |
| Estilo, nomes, formulário         | `doc/convencoes-codigo.md`                                                  |
| Teste                             | `doc/testes.md`                                                             |
| Por que algo é assim, pendências  | `doc/decisoes.md`                                                           |
| Requisito (RF/RNF)                | `../SAACI-produto/documentacao/produto/requisitos.html`                     |
| Texto de tela                     | `../SAACI-produto/documentacao/design-system/escrita-de-interface.html`     |
| Estado vazio, erro, caso de borda | `../SAACI-produto/documentacao/design-system/estados-e-casos-de-borda.html` |

`tecnica/` é o material original, de outro sistema (Lida). Não vale como regra deste projeto.

## Design

A interface segue o design exportado em `design-system/`. Antes de criar ou alterar uma tela, leia
`design-system/docs/telas-e-fluxos.md` (textos e estados) e confira o PNG da tela em
`design-system/saaci-design-png/`. Do pacote valem tokens, cores, fonte, espaço e o resultado
final; o HTML e o CSS de lá não são copiados.

## Base atual (05/11/2026)

O app foi reduzido ao login (`doc/decisoes.md`). Toda tela nova é validada pela equipe antes de entrar.

- **Stack:** Next.js (App Router), React, TypeScript, Panda CSS só com `preset-base`, TanStack
  Query, React Hook Form + Valibot, lucide-react, Vitest + Testing Library. Node 22 (`.nvmrc`) e
  pnpm; ESLint, Prettier, Husky (lint-staged) e commitlint.
- **Sem backend:** não há cliente HTTP nem variável de ambiente. `services/<dominio>` devolve
  Promise sobre o mock em `services/_mock/` (localStorage `saaci:mock`), e só essa camada muda
  quando o backend chegar.
- **O que existe:** `/login` (`features/autenticacao/Login`, `services/conta`) e `/` (`features/inicio/Inicio`, logo e Sair).
  `components/SessionGate` separa `(auth)` (sem sessão) de `(aluno)` (com sessão). A conta de
  exemplo nasce pelo painel "Mock" (só em dev).
- **Organização:** `app/` só roteia; tela em `features/<dominio>/<Tela>/`; componente com lógica
  em 2+ telas em `components/`; UI pura em `src/@design-system/` (tokens → atoms → molecules →
  organisms → templates), que não importa `services/`, `features/` nem `next/navigation`.
- **Design system:** só entra o que está catalogado em `design-system/`, com as exceções
  registradas em `doc/design-system.md`. Variação visual é `recipe.ts`; o resto, `styles.ts`.
  Atualize `DS_REFERENCE.md` no mesmo commit.

## Regras sempre válidas

- Fase atual: só front. Todo dado vem de mock em `services/<dominio>/<dominio>.mock.ts`.
- Feature fala só com `@/services/<dominio>`, nunca com o mock direto.
- Horas computadas têm um cálculo só, consumido por painel, resumo e formulário (RNF20).
- Mobile-first, com o mesmo conteúdo no desktop. Orientação embutida no ato de registrar.
- Todo erro diz o que fazer a seguir.
- Dado real que falta aparece como marcador visível (`[PRAZO DO RNF05]`), nunca inventado.
- Rode `pnpm lint`, `pnpm typecheck` e `pnpm test` antes de dar uma tarefa por pronta.
- Comunicação em PT-BR. Commits em Conventional Commits com assunto em português.
