# Arquitetura

Define **critérios de decisão**. O inventário do que existe hoje vive no código, e este documento
não o replica.

Fase atual: só front, com mock. O backend é o Supabase, ainda
não integrado. Os trechos marcados com `> Alvo` descrevem o que vale quando a integração entrar.

## Onde colocar uma lógica

| Se a lógica...                                                       | Hoje (mock)                                 | Alvo (Supabase)                             |
| -------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------- |
| lê ou transforma dado de poucas linhas                               | `<dom>.api.ts` sobre `<dom>.mock.ts`        | query builder, no service                   |
| filtra, ordena ou pagina                                             | o mock, nunca a tela                        | Postgres, via query builder                 |
| agrega ou cruza muitas linhas (horas computadas)                     | um service só, consumido por todas as telas | View ou RPC                                 |
| escreve em 2+ tabelas, ou em tabela e arquivo, e precisa ser atômica | `<dom>.mutations.ts`                        | RPC transacional                            |
| decide quem pode ler ou gravar                                       | não existe, o mock tem uma conta só         | RLS e policy do Storage                     |
| depende de segredo (chave do serviço de IA, `service_role`)          | não existe                                  | Route Handler                               |
| roda por agendamento (RNF05, RNF27)                                  | não existe                                  | Route Handler + Cron (hospedagem a decidir) |
| valida o que o aluno digitou                                         | `schema.ts` ao lado da tela                 | `schema.ts` ao lado da tela                 |
| só formata para exibição                                             | `utils/`, no cliente                        | `utils/`, no cliente                        |
| decide navegação ou junta dados de 2+ domínios                       | `components/` ou a própria feature          | `components/` ou a própria feature          |

Duas regras resumem a tabela:

1. Dado não sai do banco em volume maior do que a tela consome.
2. Horas computadas têm um cálculo só (RNF20), e registro com comprovante não é gravado em mais de
   uma requisição (RNF24).

Painel, resumo e formulário mostram o mesmo número porque leem o mesmo cálculo. Um segundo cálculo
"só para a tela" diverge na primeira correção de regra, sem sintoma.

## Fluxos

### Leitura, hoje

```
SessionGate (só monta no navegador)
  └─ Client Component
       └─ useSuspenseQuery(definição de <dom>.queries.ts)
            └─ service → mock
```

O mock vive na memória do navegador, então o servidor não o enxerga e não há prefetch. O `Loading`
da feature cobre a espera.

### Leitura, alvo

> Alvo (Supabase): ainda não implementado.

```
Server Component
  ├─ prefetch da query
  └─ HydrationBoundary
       └─ Client Component
            └─ useSuspenseQuery com a mesma definição
```

A definição da query é declarada uma vez no service e reaproveitada nos dois lados. O passo a passo
está em `react-query.md`.

### Escrita simples

```
Form → useMutation → service → mock          (alvo: → PostgREST → RLS)
                    └─ onSuccess: rotina de invalidação do domínio
```

### Escrita da sessão

```
Login → useMutation → entrar() → onSuccess: setQueryData(contaKeys.sessao(), sessao)
```

A resposta de `entrar` já é o novo estado da sessão, então ela vai direto para o cache em vez de
disparar uma busca. A exceção está explicada em `react-query.md`.

### Escrita transacional

> Alvo (Supabase): ainda não implementado.

```
useMutation → upload do comprovante → RPC
   └─ BEGIN … COMMIT no Postgres
   └─ retorna o registro já pronto para a tela de confirmação
```

A RPC grava os dados da atividade e a referência do comprovante numa transação só. Falha parcial não
existe: ou grava tudo, ou nada (RNF24). Arquivo enviado e nunca referenciado é limpo por rotina
agendada. O que o aluno preencheu nunca se perde na falha: a tela trata o erro como se a rede
pudesse cair, mesmo enquanto o mock nunca falha.

### Chamada com segredo

> Alvo (Supabase): ainda não implementado.

```
Client → Route Handler → serviço de IA (leitura do comprovante, RF41)
```

O segredo nunca chega ao navegador. Quando o serviço for escolhido, o tratamento de dado pessoal
segue RNF26.

## Invariantes

- Feature fala só com a superfície pública de `services/<dominio>` (ESLint garante). Ela não sabe se
  o dado vem de mock ou de rede.
- O mock só é importado de dentro do próprio domínio e dos testes (regra a travar no ESLint com o esqueleto novo).
- Mutation que altera estado derivado invalida **todos** os domínios que leem esse estado, não
  apenas o próprio.
- Registro com comprovante é salvo completo ou não é salvo (RNF24).
- Alvo: RLS é a única fronteira de autorização. Filtro no front é conveniência, nunca segurança
  (RNF04). O domínio institucional (RF02) é barrado no servidor, não só na tela.
- Alvo: RPC usa `security invoker`, então o RLS de quem chamou continua valendo. Qualquer
  `security definer` entra na lista abaixo antes de ser escrito.
- Alvo: tabela editável tem `updated_at`, e todo update/delete o inclui no `WHERE`. Zero linhas
  afetadas é conflito de concorrência, não sucesso.
- Feature não importa `supabase-js`; fala só com `services/`.

## Exceções nomeadas

Uma exceção que ninguém consegue enumerar já virou regra. Por isso cada uma está aqui, por nome.

| Exceção                                       | Regra que ela dobra                       | Por que existe                                                                                                            |
| --------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `SessionGate` decide a sessão só no navegador | Página é Server Component e faz prefetch  | Enquanto a sessão for do mock, o servidor não a enxerga. Volta ao molde normal com o Supabase                             |
| `setQueryData` da sessão em vez de invalidar  | Invalidação sempre pela rotina do domínio | A resposta de `entrar`/`sair` já é o novo estado                                                                          |
| Nenhuma `security definer`                    | RPC é `security invoker`                  | Se uma RPC precisar, ela entra aqui por nome, com checagem de dono escrita à mão e retorno mínimo (`rls-e-permissoes.md`) |

## Onde está a verdade corrente

| Pergunta                     | Fonte                                        |
| ---------------------------- | -------------------------------------------- |
| Quais domínios existem       | `src/services/`                              |
| O que cada mutation invalida | a rotina de invalidação do domínio           |
| Qual o schema atual (alvo)   | `supabase/migrations/` e `database.types.ts` |
| O que o produto exige        | repositório `SAACI-produto`                  |
| Por que a stack é assim      | `tecnologia.md`                              |
