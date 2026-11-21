# 0015. O progresso é calculado por uma função SQL, e as horas de cada atividade seguem no TypeScript

- **Status:** Proposta
- **Data:** 21/11/2026

## Contexto

O `getProgress` lia perfil, curso, regras e atividades em quatro idas ao banco e somava no navegador
com `computeProgress` (issue #21). `doc/modelagem-dados.md` pede que o total saia de uma função, View
ou RPC únicas (RNF20), e a ADR 0003 deixou em aberto o segundo lado da paridade: rodar
`tests/hours-cases.json` também contra o SQL.

A issue manda mexer só em `src/services/progress`. As horas de cada atividade (lista, detalhe e a
resposta de registrar e corrigir) vêm de `computeActivities` dentro de `services/activities`, e a ADR
0012 exige que a resposta de uma escrita saia sem ir à rede depois do commit. Levar essas horas para o
SQL pediria transformar o `update` em RPC e rever as ADRs 0011 e 0012, fora do escopo.

## Decisão

- **Duas funções SQL**, na migration `progresso_do_aluno`:
  - `calcula_horas(entrada jsonb)` é a conta única: pura, `immutable`, sem ler tabela nem `auth.uid()`.
    Recebe atividades, itens, semestre de ingresso e meta, e devolve as horas de cada atividade e o
    progresso. Calcula em décimos inteiros com `numeric`, então não precisa do epsilon do TypeScript.
  - `progresso_do_aluno()` é `security invoker` e `stable`. Lê o perfil por `auth.uid()`, os itens do
    curso e as atividades (a RLS filtra) e chama `calcula_horas`. Devolve `null` quando o perfil não
    tem curso, e o service lança o mesmo erro de antes.
- **`calcula_horas` é executável por `authenticated`.** Ela não lê dado nenhum, só transforma o que
  recebe, então não vaza nada. Fica chamável para o teste de paridade rodar os casos arbitrários.
- **`getProgress` faz uma chamada** a `progresso_do_aluno`, valida o formato com um schema Valibot e
  traduz os nomes do banco para `Progress` (`v.parse(ProgressSchema)`). Erro do banco é repassado.
- **As horas de cada atividade continuam em `computeActivities`** (TypeScript), e a prévia do
  formulário (RF32) continua no navegador, como decidiu a ADR 0003. Duas implementações valem se o
  teste de paridade as mantém iguais.
- **Paridade nos dois lados.** `tests/hours-cases.json` roda contra o TypeScript (`pnpm test`) e contra
  `calcula_horas` (`pnpm test:rls`, `tests/integration/hours-parity.test.ts`). Caso novo entra no
  JSON. Quem mudar a conta muda as duas e mantém os dois lados verdes.
- **Ordem do máximo do item.** O SQL ordena por `created_at` e, no empate, por `id` (`collate "C"`),
  como o TypeScript ordena `registeredAt` e `id`. O caso de registro no mesmo instante trava o
  desempate.

## Consequências

- Uma ida ao banco no lugar de quatro, e o total sai do banco (RNF20).
- A conta existe em dois lugares. A paridade é obrigação de quem contribui. O CI roda `pnpm test`, o
  `pnpm test:db` (pgTAP, que cobre o isolamento e o total por aluno) e, no mesmo job do banco,
  depois do pgTAP, o `pnpm test:rls`, que tem a paridade SQL. O pgTAP não depende de banco limpo: os
  testes que contavam o banco inteiro passaram a contar só a fixture. (O `test:rls` entrou no CI
  depois desta decisão, no PR #68. A primeira versão deste texto dizia que ele só rodava na máquina
  de quem desenvolve.)
- Entre uma escrita e o refetch, o total do cache vem do banco e a lista vem do TypeScript. A paridade
  garante que são iguais.
- O TypeScript ordena `registeredAt` como texto e o SQL como `timestamptz`. Equivalem enquanto o
  PostgREST devolve o mesmo formato ISO, o que acontece hoje.
- `progress` não tem `*.mock.ts` (a ADR 0003 já o tirou), então não há mock a apagar nesta issue.
- `database.types.ts` foi gerado de novo. O retorno das funções sai como `Json`, e o schema Valibot do
  service confere o formato.

## Alternativas descartadas

- **View.** Não recebe o semestre nem a meta por parâmetro, não serve ao teste de paridade com dados
  arbitrários e devolveria linhas planas que o service teria de agregar, o que o RNF20 proíbe.
- **Calcular dentro de `progresso_do_aluno`, sem uma função pura separada.** A conta leria tabela e
  não poderia ser testada com os casos do JSON sem montar atividade, arquivo e perfil para cada um.
- **Levar também as horas de cada atividade para o SQL.** Exigiria `updateActivity` por RPC e rever as
  ADRs 0011 e 0012, e mexeria em `services/activities`, que a issue não cobre. Pode virar issue própria.
- **Tirar `computeProgress` do TypeScript.** A prévia da remoção no Detalhe ainda o usa, o
  `computeActivities` divide o mesmo código, e a paridade precisa de um lado para comparar.
