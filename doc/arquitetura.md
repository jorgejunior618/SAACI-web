# Arquitetura

Define critérios de decisão. O inventário do que existe vive no código.

Fase atual: só front. O backend ainda não foi escolhido, e `services/` serve dados mockados.

## Onde colocar uma lógica

| Se a lógica...                                 | Vai para                                    |
| ---------------------------------------------- | ------------------------------------------- |
| busca ou grava dado                            | `services/<dominio>/`                       |
| guarda o dado enquanto não há backend          | `services/<dominio>/<dominio>.mock.ts`      |
| calcula horas computadas                       | um service só, consumido por todas as telas |
| valida o que o aluno digitou                   | `schema.ts` ao lado da tela                 |
| só formata para exibição                       | `utils/`                                    |
| decide navegação ou junta dados de 2+ domínios | `components/` ou a própria feature          |

Painel, resumo e formulário mostram o mesmo número porque leem o mesmo cálculo (RNF20).

## Fluxos

### Leitura

```
Server Component
  ├─ prefetch da query
  └─ HydrationBoundary
       └─ Client Component
            └─ useSuspenseQuery com a mesma definição
```

### Escrita

```
Form → useMutation → service → mock
                    └─ onSuccess: rotina de invalidação do domínio
```

## Invariantes

- Feature fala só com a superfície pública de `services/<dominio>` (ESLint garante). Ela não sabe
  se o dado vem de mock ou de rede.
- O mock só é importado de dentro do próprio domínio.
- Mutation que altera estado derivado invalida todos os domínios que leem esse estado.
- Registro com comprovante é salvo completo ou não é salvo, e o que o aluno preencheu nunca se
  perde em falha (RNF24). No mock isso é trivial, e a tela já deve tratar o erro como se não fosse.

## Onde está a verdade corrente

| Pergunta                     | Fonte                              |
| ---------------------------- | ---------------------------------- |
| Quais domínios existem       | `src/services/`                    |
| O que cada mutation invalida | a rotina de invalidação do domínio |
| O que o produto exige        | repositório `SAACI-produto`        |
