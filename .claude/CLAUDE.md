# CLAUDE.md

SAACI-web (Sistema de Apoio Acadêmico Colaborativo do IFCE): Next.js (App Router) + Panda CSS +
TanStack Query + React Hook Form e Valibot. Backend: Supabase (alvo), hoje mock. Produto, design e
requisitos vivem no repositório vizinho `../SAACI-produto`, a fonte de verdade do **quê**. Este
repositório decide **como** construir.

## Antes de agir

Leia **apenas** o documento da tarefa. Não carregue `doc/` inteiro.

| Tarefa                                     | Leia                                                                                |
| ------------------------------------------ | ----------------------------------------------------------------------------------- |
| Decidir onde uma lógica mora               | `doc/arquitetura.md`                                                                |
| Criar arquivo ou pasta                     | `doc/estrutura-pastas.md`                                                           |
| Service, mock, tradução de erro            | `doc/camada-servicos.md`                                                            |
| Buscar, cachear ou invalidar dado          | `doc/react-query.md`                                                                |
| Criar ou alterar tela                      | `design-system/docs/telas-e-fluxos.md` e o PNG em `design-system/saaci-design-png/` |
| Criar ou promover componente compartilhado | `doc/design-system.md` e `src/@design-system/DS_REFERENCE.md`                       |
| Estilo, nomes, formulário                  | `doc/convencoes-codigo.md`                                                          |
| Escrever ou decidir teste                  | `doc/testes.md`                                                                     |
| Tabela, coluna ou relação (Supabase)       | `doc/modelagem-dados.md`                                                            |
| Policy, RLS, Storage, Auth                 | `doc/rls-e-permissoes.md`                                                           |
| Escolher biblioteca                        | `doc/tecnologia.md`                                                                 |
| Mudar uma regra                            | `doc/adr/` (modelo em `0000-modelo.md`)                                             |
| Requisito (RF/RNF)                         | `../SAACI-produto/documentacao/produto/requisitos.html`                             |
| Texto de tela                              | `../SAACI-produto/documentacao/design-system/escrita-de-interface.html`             |
| Estado vazio, erro, caso de borda          | `../SAACI-produto/documentacao/design-system/estados-e-casos-de-borda.html`         |

## Regras sempre válidas

- TypeScript `strict`; `any` proibido.
- Fase atual: só front. Todo dado vem de `services/<dominio>/<dominio>.mock.ts`, e a feature fala só
  com `@/services/<dominio>`, nunca com o mock.
- `app/` contém apenas rota, layout e prefetch.
- Toda resposta de service passa por `v.parse`.
- Verbo em inglês, substantivo de domínio em português. Texto exibido em PT-BR.
- Horas computadas têm um cálculo só, consumido por painel, resumo e formulário (RNF20).
- Autorização é RLS (alvo). Esconder botão é UX, não segurança.
- Design system: só entra o que está catalogado em `design-system/`. Dele valem tokens, cores,
  fonte, espaço e o resultado final; o HTML e o CSS de lá não são copiados. Variação visual é
  `recipe.ts`; o resto, `styles.ts`.
- Mobile-first, com o mesmo conteúdo no desktop. Todo erro diz o que fazer a seguir.
- Dado real que falta aparece como marcador visível (`[PRAZO DO RNF05]`), nunca inventado.
- Símbolo exportado novo ou alterado em `src/` leva TSDoc em PT-BR (skill `saaci-tsdoc`). Sem
  retrofit do código antigo.
- **Estrutura de pastas não muda sem aprovação.** Criar pasta nova em `src/`, mover arquivo entre
  pastas ou inventar um nível novo é decisão de arquitetura: proponha, mostre a alternativa e espere
  confirmação. Usar as pastas de `doc/estrutura-pastas.md` nunca precisa perguntar.
- **Regra nova em `doc/` não nasce sozinha.** `doc/` só muda no mesmo commit de uma ADR em
  `doc/adr/`, e o hook `pre-commit` confere. Na dúvida, escreva a proposta na resposta, não no
  arquivo.
- Comunicação em PT-BR. Commits em Conventional Commits com assunto em português.

## Escopo

`SAACI-web/` é o limite de edição. `../SAACI-produto` é só leitura, para requisito e design. Os
caminhos abaixo são previsíveis: não use busca ampla no filesystem.

```
SAACI-web/
  doc/                    documentação técnica
  doc/adr/                ADRs (modelo em 0000-modelo.md)
  design-system/          pacote exportado do Claude Design (só leitura)
  scripts/                check-adr.mjs, eslint-pos-edicao.mjs
  tests/                  testes que não co-localizam com um arquivo
  src/app/                rotas
  src/features/           telas
  src/components/         componentes com lógica, em 2+ telas
  src/services/           acesso a dados (hoje, mocks)
  src/@design-system/     componentes compartilhados
  src/providers/ hooks/ utils/ constants/
  .claude/                comandos, skills e referências
```

`supabase/migrations/` e `src/@supabase/` entram com a integração e ainda não existem.

## Skills

| Situação                                     | Skill          |
| -------------------------------------------- | -------------- |
| Tarefa em mais de um arquivo ou com decisão  | `saaci-plano`  |
| Criar ou alterar símbolo exportado em `src/` | `saaci-tsdoc`  |
| Sugerir mensagem de commit                   | `saaci-commit` |

`saaci-plano` e `saaci-tsdoc` são automáticas: disparam pelo tipo de pedido, sem precisar ser
chamadas. Para revisar texto de tela, use a skill `saaci-copy` do `../SAACI-produto`.

## Comandos

| Situação                                             | Comando                           |
| ---------------------------------------------------- | --------------------------------- |
| Auditar o diff da branch atual antes de abrir o PR   | `/saaci-auditar`                  |
| Revisão profunda de 1 arquivo, com gate de aprovação | `/saaci-revisar-codigo <arquivo>` |

`/saaci-plano` chama a skill de mesmo nome. Depois de cada Edit ou Write em `.ts`/`.tsx`, o hook de `.claude/settings.json` roda o ESLint no
arquivo e devolve os erros.

## Estado atual (06/11/2026)

- O app foi reduzido ao login: `/login` (`features/autenticacao/Login`, `services/conta`) e `/`
  (`features/inicio/Inicio`). Toda tela nova é validada pela equipe antes de entrar.
- Não há cliente HTTP nem variável de ambiente. O Supabase é o alvo, e só a camada `services/` muda
  quando ele chegar.
- Legado que sai no reset do projeto: `services/_mock/` (guarda o banco no `localStorage`) e o
  `MockPanel`. O mock novo é em memória, por domínio (`doc/camada-servicos.md`).

## Antes de terminar

- Componente novo ou alterado em `@design-system` → atualizar `DS_REFERENCE.md` no mesmo commit.
- Rode `pnpm lint`, `pnpm typecheck` e `pnpm test` antes de dar uma tarefa por pronta.
- Mexeu em `doc/` → ADR no mesmo commit.
- Migration nova (quando existir) → regerar `database.types.ts`.
- Sem comando destrutivo nem script pesado sem aprovação explícita.
