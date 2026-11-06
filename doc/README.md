# Documentação técnica

Como o SAACI-web é construído. O **o quê** e o **para quem** vivem no repositório vizinho
`../SAACI-produto`; o **porquê** da stack vive em `tecnologia.md`, e mudanças de regra viram ADR em `adr/`.

## Antes de agir

| Tarefa                          | Leia primeiro          |
| ------------------------------- | ---------------------- |
| Onde colocar uma lógica         | `arquitetura.md`       |
| Onde criar um arquivo           | `estrutura-pastas.md`  |
| Service, mock, tradução de erro | `camada-servicos.md`   |
| Query, cache, invalidação       | `react-query.md`       |
| Componente, token, recipe       | `design-system.md`     |
| Estilo, nomes, formulário       | `convencoes-codigo.md` |
| Teste                           | `testes.md`            |
| Tabela, coluna, relação         | `modelagem-dados.md`   |
| Policy, Storage, Auth, segredo  | `rls-e-permissoes.md`  |
| Por que a stack é assim         | `tecnologia.md`        |

Os trechos marcados com `> Alvo` descrevem o Supabase, que ainda não está integrado.

## Como mudar uma regra

A partir daqui, `doc/` só muda junto com uma ADR. Esta versão é a linha de base (etapa zero) e por
isso não tem ADR: a primeira nasce com a primeira mudança de regra.

1. Copie [`adr/0000-modelo.md`](adr/0000-modelo.md) para `adr/NNNN-titulo.md` e preencha: contexto,
   decisão, consequências e **alternativas descartadas**.
2. Altere o documento no **mesmo commit** da ADR.

ADR aceita não é editada. Para mudar a decisão, abra outra ADR que a substitui e troque o status da
antiga para `Substituída por NNNN`.

O hook de `pre-commit` (`scripts/check-adr.mjs`) recusa o commit que altera `doc/` sem uma ADR em
stage. Correção de digitação que não muda regra usa `git commit --no-verify`, e o review do PR
confere. O commit da linha de base também usa `--no-verify`, porque ainda não existe ADR.
