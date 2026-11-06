---
description: Revisão sênior profunda de UM arquivo, com gate de aprovação antes de aplicar qualquer correção
argument-hint: <caminho/do/arquivo>
---

# /saaci-revisar-codigo

Revisa um arquivo por vez. Se vier mais de um caminho ou nenhum, peça ao usuário um único arquivo
(`$ARGUMENTS`).

Toda a saída em PT-BR.

## Passo 1: ler o arquivo e o contexto imediato

Leia o arquivo apontado. Se for de `src/services/`, leia também o restante do domínio (os outros
`<dom>.*`) para entender o contrato antes de opinar. Se for de uma tela, leia o `schema.ts`, o
`styles.ts` e o `Loading.tsx` vizinhos.

## Passo 2: aplicar as regras

Descubra a categoria pela pasta e leia **só o documento dela** em `doc/`, nunca o `doc/` inteiro:

| Pasta                                  | Leia                                                                        |
| -------------------------------------- | --------------------------------------------------------------------------- |
| `src/services/**`                      | `doc/camada-servicos.md`, `doc/react-query.md`                              |
| `src/features/**`, `src/components/**` | `doc/convencoes-codigo.md`, `doc/estrutura-pastas.md`, `doc/react-query.md` |
| `src/@design-system/**`                | `doc/design-system.md` e `src/@design-system/DS_REFERENCE.md`               |
| `src/app/**`                           | `doc/estrutura-pastas.md`, `doc/arquitetura.md`                             |
| testes                                 | `doc/testes.md`                                                             |

Texto de tela conferido contra `../SAACI-produto/documentacao/design-system/escrita-de-interface.html`,
sem reescrever o que é decisão de produto.

## Passo 3: montar o relatório em 6 seções

1. **Pontos positivos**: o que o arquivo já faz bem, curto.
2. **Pontos de atenção**: por severidade, no formato de `.claude/references/formato-relatorio.md`.
3. **Checklist de conformidade**: as regras aplicáveis, marcando atende ou não atende.
4. **Sugestões de melhoria**: o que não é regra quebrada, mas melhoraria.
5. **Pontos para estudar**: o conceito por trás de algum achado, se ajudar quem está evoluindo de
   pleno para sênior.
6. **Explicação didática**: o porquê da regra mais relevante que apareceu.

Fecha com o veredito final do `formato-relatorio.md`.

## Passo 4: gate de aprovação (obrigatório)

Antes de editar qualquer coisa, liste as correções propostas com a severidade e pergunte
explicitamente quais aplicar.

- Nunca aplique item **Baixo** automaticamente: mencione, não corrija sozinho.
- Aplique só **Crítico** e **Médio** que o usuário aprovou.
- Se a correção introduzir breaking change (quebra contrato ou exige refatorar outro componente),
  abra a resposta com um ALERTA em negrito antes do gate.
- Nunca altere o `doc/` para encaixar o código: se a regra parece errada, diga isso no relatório e
  proponha uma ADR.
