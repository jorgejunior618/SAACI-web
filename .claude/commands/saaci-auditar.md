---
description: Audita o diff da branch atual contra as regras do doc/ antes de abrir o PR. Só relatório, nunca corrige
---

# /saaci-auditar

Só audita. Nunca corrige e nunca edita arquivo. Para corrigir, use `/saaci-revisar-codigo <arquivo>`
depois.

Toda a saída em PT-BR.

## Passo 1: levantar o diff

```
git diff origin/dev...HEAD --name-only
```

`dev` é a branch base dos PRs de trabalho (a `main` só recebe o PR de produção, feito pelo dono).
Rode `git fetch origin dev` antes se a `origin/dev` puder estar velha. Se o diff vier vazio, avise e
pare: não há o que auditar.

## Passo 2: categorizar cada arquivo

Classifique pela pasta e leia **só o documento da categoria**, nunca o `doc/` inteiro:

| Padrão de caminho                           | Categoria        | Leia                                                                            |
| ------------------------------------------- | ---------------- | ------------------------------------------------------------------------------- |
| `src/services/**`                           | Serviço          | `doc/camada-servicos.md`, `doc/react-query.md` (chaves e queries)               |
| `src/features/**`, `src/components/**`      | Tela             | `doc/convencoes-codigo.md`, `doc/estrutura-pastas.md`, `doc/react-query.md`     |
| `src/@design-system/**`                     | Design system    | `doc/design-system.md`, e confira `src/@design-system/DS_REFERENCE.md`          |
| `src/app/**`                                | Rota             | `doc/estrutura-pastas.md` (arquivos de convenção do Next), `doc/arquitetura.md` |
| `**/*.test.ts`, `**/*.test.tsx`, `tests/**` | Teste            | `doc/testes.md`                                                                 |
| `supabase/migrations/**` (quando existir)   | Migration ou RPC | `doc/modelagem-dados.md`, `doc/rls-e-permissoes.md`                             |
| `doc/**`                                    | Documentação     | `doc/README.md` (regra de ADR)                                                  |

`.claude/`, configuração e `package.json` ficam fora da auditoria de regras.

## Passo 3: aplicar as regras por categoria

Para cada arquivo, cheque só as regras da categoria dele. Não aplique regra de React Query em
arquivo de migration, por exemplo. Para todo símbolo exportado novo ou alterado em `.ts`/`.tsx`,
confira se tem TSDoc (achado Baixo).

Para componente novo, movido ou alterado em `src/features/**`, `src/components/**` ou
`src/@design-system/**`, aplique `.claude/references/promocao-componente.md`: procure no repositório
componente igual ou parecido em outra tela, e importação de `_components/` entre telas. A
severidade está nesse arquivo.

Mudança em `doc/**` sem uma ADR nova em `doc/adr/` no mesmo diff é achado Médio: o hook de commit
recusa isso, a menos que tenha sido pulado com `--no-verify`.

## Passo 4: checar lint e tipos

Rode `pnpm lint` e `pnpm typecheck` e inclua no relatório só os erros que tocam arquivos do diff.
Não rode `pnpm test` aqui.

## Passo 5: relatório

Siga `.claude/references/formato-relatorio.md`: seções por severidade e o veredito final
(APROVADO, ATENÇÃO ou BLOQUEADO) na última linha.

## Regra fixa

Este comando nunca aplica correção. Reportar é o fim do trabalho dele.
