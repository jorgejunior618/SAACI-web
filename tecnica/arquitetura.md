# Arquitetura

Define **critérios de decisão**. O inventário do que existe hoje vive no
código — este documento não o replica.

## Onde colocar uma lógica

| Se a lógica...                              | Vai para                    |
| ------------------------------------------- | --------------------------- |
| lê ou transforma dados de poucas linhas     | query builder, no service   |
| filtra, ordena ou pagina                    | Postgres, via query builder |
| agrega ou cruza muitas linhas               | View ou RPC                 |
| escreve em 2+ tabelas e precisa ser atômica | RPC transacional            |
| decide quem pode ler ou gravar              | RLS                         |
| depende de segredo                          | Route Handler               |
| roda por agendamento                        | Route Handler + Cron        |
| só formata para exibição                    | `utils/`, no cliente        |

Duas regras resumem a tabela:

1. Dado não sai do banco em volume maior do que a tela consome.
2. Escrita que pode corromper valor financeiro não acontece em mais de
   uma requisição.

## Fluxos

### Leitura

```
Server Component
  ├─ prefetch da query
  └─ HydrationBoundary
       └─ Client Component
            └─ useQuery com a mesma definição
```

A definição da query é declarada uma vez no service e reaproveitada nos
dois lados.

### Escrita simples

```
Form → useMutation → service → PostgREST → RLS
                              └─ onSuccess: invalida o que ficou obsoleto
```

### Escrita transacional

```
useMutation → RPC
   └─ BEGIN … COMMIT no Postgres
   └─ retorna o resultado já pronto para a tela de confirmação
```

Uma requisição. Falha parcial não existe: ou grava tudo, ou nada.

### Chamada com segredo

```
Client → Route Handler → serviço externo
```

O segredo nunca chega ao browser.

## Invariantes

- RLS é a única fronteira de autorização. Filtro no front é conveniência,
  nunca segurança.
- RPC usa `security invoker`: o RLS de quem chamou continua valendo, com
  uma única exceção nomeada abaixo — nunca `security definer` ad-hoc
  numa RPC nova sem passar por este documento primeiro.
- Tabela editável tem `updated_at`, e todo update/delete o inclui no
  `WHERE`. Zero linhas afetadas é conflito de concorrência, não sucesso.
- Funcionário escreve, nunca reescreve. O que ele lançou só é corrigido
  pelo dono — inclusive por tabela filha (`rls-e-permissoes.md`).
- Feature não importa `supabase-js`; fala só com `services/`.
- Mutation que altera estado derivado invalida **todos** os domínios que
  leem esse estado, não apenas o próprio.

## Exceção nomeada a `security invoker`

RPC de alocação de pagamento (Fase 10, ainda não escrita): roda como
`security definer`. Motivo — o funcionário com a capacidade
`pode_lancar_pagamento` não pode ler pedido que não é dele (Fase 5); mas
a alocação precisa varrer todos os pedidos em aberto do cliente para
distribuir o valor. Rodando como `invoker`, a RPC não encontraria o que
alocar, e o pagamento viraria crédito integral em silêncio — a mesma
classe de erro silencioso que a Fase 10 já nomeia como crítica.

A analogia que sustenta por que isso não é uma porta dos fundos: você não
tem a chave do cofre, mas aperta um botão no caixa eletrônico que mexe
nele. O que torna isso seguro não é o privilégio ser baixo — é a operação
ser fechada: entra um valor, sai uma confirmação, não existe caminho para
pedir "me mostre o cofre". Três obrigações valem para esta exceção e para
qualquer outra que vier a existir:

- a checagem de organização é escrita à mão dentro da função — o RLS
  parou de ajudar;
- o retorno é o mínimo que a tela daquele papel precisa (para o
  funcionário, o que ele digitou; nunca contra qual pedido o valor foi
  alocado — isso revelaria a dívida de terceiros);
- a função é listada por nome, aqui — uma exceção que ninguém consegue
  enumerar já virou regra.

## Onde está a verdade corrente

| Pergunta                     | Fonte                                      |
| ---------------------------- | ------------------------------------------ |
| Quais RPCs e Views existem   | `supabase/migrations/`                     |
| Quais domínios existem       | `src/services/`                            |
| O que cada mutation invalida | o `onSuccess` da própria mutation          |
| Qual o schema atual          | `src/@supabase/database.types.ts` (gerado) |
