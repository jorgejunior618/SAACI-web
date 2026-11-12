# Arquitetura

Define **critérios de decisão**. O inventário do que existe hoje vive no código, e este documento não
o replica.

Fase atual: só front, com mock. O backend será o Supabase, ainda não integrado; o que vale só depois
disso está em "Quando o Supabase entrar".

## Plataforma

O SAACI é **só mobile**, e não há previsão de versão web (desktop). A tela de referência é 390 × 844;
em tela larga o conteúdo fica numa coluna centralizada de 480px, e só isso. Não crie breakpoint,
grid de várias colunas, menu lateral nem layout próprio para desktop.

Por quê: o aluno usa o sistema no celular (tirar foto do certificado, conferir horas), e um layout
web dobraria o custo de cada tela sem requisito que peça isso. Exemplo: a lista de atividades é uma
coluna de cartões, no celular e no monitor.

Instalação como app (PWA) é possível e está **adiada**: entra depois da primeira tela, só com o
manifest, para adicionar à tela inicial. Não há service worker nem uso offline: o app é autenticado e
guarda dado pessoal (RNF26), e um cache poderia mostrar dado de outra conta ou horas velhas (RNF20).

## Onde colocar uma lógica

| Se a lógica...                                 | Vai para                                    |
| ---------------------------------------------- | ------------------------------------------- |
| busca ou grava dado                            | `services/<dominio>/`, sobre o `.mock.ts`   |
| filtra, ordena ou calcula                      | o service (o mock hoje), nunca a tela       |
| calcula horas computadas                       | um service só, consumido por todas as telas |
| valida o que o aluno digitou                   | `schema.ts` ao lado da tela                 |
| só formata para exibição                       | `utils/`, no cliente                        |
| decide navegação ou junta dados de 2+ domínios | `components/` ou a própria feature          |

Duas regras resumem a tabela:

1. Dado não sai da origem em volume maior do que a tela consome.
2. Horas computadas têm um cálculo só (RNF20), e registro com comprovante não é gravado em mais de
   uma requisição (RNF24).

Painel, resumo e formulário mostram o mesmo número porque leem o mesmo cálculo. Um segundo cálculo
"só para a tela" diverge na primeira correção de regra, sem sintoma.

## Fluxos

### Leitura

```
SessionGate (só monta no navegador)
  └─ Client Component
       └─ useSuspenseQuery(definição de <dom>.queries.ts)
            └─ service → mock
```

O mock vive na memória do navegador, então o servidor não o enxerga e não há prefetch. O `Loading` da
feature cobre a espera.

### Escrita

```
Form → useMutation → service → mock
                    └─ onSuccess: rotina de invalidação do domínio
```

A tela trata o erro de envio como se a rede pudesse cair, mesmo com o mock nunca falhando: o que o
aluno preencheu não se perde (RNF24).

### Escrita da sessão

```
Login → useMutation → signIn() → onSuccess: setQueryData(accountKeys.session(), session)
```

A resposta de `signIn` já é o novo estado da sessão, então vai direto para o cache em vez de
disparar uma busca. A exceção está explicada em `react-query.md`.

## Invariantes

- Feature fala só com a superfície pública de `services/<dominio>` (ESLint garante). Ela não sabe se
  o dado vem de mock ou de rede.
- O mock só é importado de dentro do próprio domínio e dos testes.
- Mutation que altera estado derivado invalida **todos** os domínios que leem esse estado.
- Registro com comprovante é salvo completo ou não é salvo (RNF24).

## Quando o Supabase entrar

> Alvo (Supabase): ainda não implementado.

| Se a lógica...                                              | Vai para                  |
| ----------------------------------------------------------- | ------------------------- |
| lê dado de poucas linhas, filtra, ordena ou pagina          | query builder, no service |
| agrega ou cruza muitas linhas (horas computadas)            | View ou RPC               |
| escreve em 2+ tabelas, ou em tabela e arquivo               | RPC transacional          |
| decide quem pode ler ou gravar                              | RLS e policy do Storage   |
| depende de segredo (chave do serviço de IA, `service_role`) | Route Handler             |
| roda por agendamento (RNF05, RNF27)                         | Route Handler + Cron      |

- **Escrita com comprovante:** sobe o arquivo, depois a RPC grava atividade e referência numa
  transação só. Falha parcial não existe, e o arquivo órfão é limpo por rotina agendada
  (`modelagem-dados.md`).
- **Segredo:** o serviço de IA que lê o comprovante (RF41) é chamado por um Route Handler. A chave
  nunca chega ao navegador, e o tratamento de dado pessoal segue RNF26.
- **Leitura com prefetch:** o servidor busca, hidrata o cache e a tela usa a mesma definição de query
  (`react-query.md`). A exceção do `SessionGate` sai.
- RLS é a única fronteira de autorização; filtro no front é conveniência (RNF04). O domínio
  institucional (RF02) é barrado no servidor (`rls-e-permissoes.md`).
- RPC usa `security invoker`. Qualquer `security definer` entra aqui, por nome, antes de ser escrito.
  Registrados: `apagar_contas_nao_confirmadas` (RNF27, ADR 0003), que só o dono executa, e
  `apagar_minha_conta` (RF33, ADR 0006), que só o aluno logado executa e que lê `auth.uid()` em vez de
  receber o dono.
- **Agendamento que só mexe no banco e não usa segredo** roda como função SQL com `pg_cron`, sem Route
  Handler. A limpeza de conta não confirmada (RNF27) é assim (ADR 0003).
- Tabela editável inclui `updated_at` no `WHERE` de todo update/delete: zero linhas afetadas é
  conflito de concorrência, não sucesso.
- Feature não importa `supabase-js`; fala só com `services/`.

## Exceções nomeadas

Uma exceção que ninguém consegue enumerar já virou regra. Por isso cada uma está aqui, por nome.

| Exceção                                       | Regra que ela dobra                       | Por que existe                                          |
| --------------------------------------------- | ----------------------------------------- | ------------------------------------------------------- |
| `SessionGate` decide a sessão só no navegador | Página é Server Component e faz prefetch  | Enquanto a sessão for do mock, o servidor não a enxerga |
| `setQueryData` da sessão em vez de invalidar  | Invalidação sempre pela rotina do domínio | A resposta de `signIn`/`signOut` já é o novo estado     |

## Onde está a verdade corrente

| Pergunta                     | Fonte                                        |
| ---------------------------- | -------------------------------------------- |
| Quais domínios existem       | `src/services/`                              |
| O que cada mutation invalida | a rotina de invalidação do domínio           |
| Qual o schema (alvo)         | `supabase/migrations/` e `database.types.ts` |
| Por que a stack é assim      | `tecnologia.md`                              |
