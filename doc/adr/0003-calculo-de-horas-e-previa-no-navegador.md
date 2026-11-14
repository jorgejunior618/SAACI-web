# 0003. O cálculo de horas é uma função só, e a prévia do formulário roda no navegador

- **Status:** Proposta
- **Data:** 08/11/2026

## Contexto

O progresso hoje é um número fixo (59h de 120h), e a atividade registrada conta a quantidade
inteira. `doc/modelagem-dados.md` deixou em aberto onde roda a prévia do formulário (RF32): na RPC a
cada digitação, ou no cliente com um teste que prove a igualdade com o SQL (RNF20). O cálculo
também tinha três pontos sem regra escrita:

- qual atividade perde horas quando o item passa do máximo (RF16);
- qual data da atividade decide o ingresso (RF38): o doc dizia "quando terminou", e a equipe
  definiu que vale a data de início;
- a razão de conversão existia só em texto ("1h a cada 4h de curso"), sem campos para a conta.

Sem essas regras, painel, resumo e formulário podem dar números diferentes, que é o defeito que o
RNF20 proíbe.

## Decisão

- **Uma função pura de cálculo**, em `src/utils/compute-hours.ts`, sem rede. Hoje o mock de
  `activities` e o `getProgress` a consomem. Com o Supabase, o banco calcula em uma função SQL única
  (RNF20), e esta função TS continua existindo só para a prévia.
- **A prévia do formulário (RF32) roda no navegador**, com a mesma função, sem chamada de rede a
  cada digitação. Um arquivo de casos (`tests/hours-cases.json`, entrada e saída esperada) roda
  contra a função TS e, quando o Supabase entrar, também contra a função SQL. Divergência entre as
  duas quebra o teste. O valor gravado é sempre o do banco: a prévia só informa.
- **Razão em campos.** Cada item tem `ratio: { hours, per, unit }`, e a atividade conta
  `quantity × hours / per`. O texto da regra continua, só para exibição.
- **Uma casa decimal, sempre para baixo (RF14)** por atividade. A conta é feita em décimos
  inteiros, para o ponto flutuante não transformar 3,0 em 2,9. O total geral é a soma dos itens em
  horas inteiras, para baixo, limitado à meta.
- **Excesso (RF16) por ordem de registro.** Dentro do item, quem foi registrado primeiro
  (`registeredAt`) garante as horas. A atividade que passa do máximo fica `parcial`, e as seguintes
  ficam `nao_conta` com o motivo `item_cheio`. Uma atividade nova nunca muda o status de uma antiga.
- **Ingresso (RF38) pela data de início.** A atividade tem `startDate` e `endDate` (fim maior ou
  igual ao início) e conta se `startDate >= startSemester`. Atividade que não conta pelo ingresso
  não ocupa o máximo do item.
- **Fator Qualis** (itens 17 a 24): o aluno informa o fator como quantidade.
  `[TABELA DO FATOR QUALIS]` a confirmar com a coordenação.

## Consequências

- `doc/modelagem-dados.md` troca "a data da atividade é quando ela terminou" por início e fim, e o
  item do RF32 sai de "Em aberto".
- O contrato de `activities` troca `activityDate` por `startDate` e `endDate` (atividade, registro,
  correção e sugestão da leitura do comprovante). O formulário pede as duas datas.
- `rules` ganha `ratio` em cada item. Curso novo precisa da razão em campos, não só do texto.
- `progress` deixa de ter mock próprio: compõe atividades, regras, curso e perfil.
- Editar o perfil também invalida `activities`, porque o semestre muda o status de cada atividade.
- Quem mexer no cálculo SQL precisa manter `tests/hours-cases.json` passando nos dois lados. Caso
  novo entra no arquivo, não só no teste TS.

## Alternativas descartadas

- **Prévia pela RPC a cada digitação.** Uma fonte só, mas o formulário passa a depender de rede,
  mostra carregamento a cada tecla e gera uma chamada por digitação. A paridade testada dá a mesma
  garantia sem esse custo.
- **Excesso pela data da atividade.** Registrar uma atividade antiga mudaria o status de outra já
  lançada, e o aluno veria uma atividade "que contava" deixar de contar sem ter mexido nela.
- **Ingresso pela data de fim.** Contrário à regra definida pela equipe: uma atividade que começou
  antes do curso não conta, mesmo terminando depois.
- **Calcular dentro do mock de `activities`.** O progresso e a prévia teriam de importar o mock de
  outro domínio (`camada-servicos.md` proíbe), e o cálculo ficaria preso a um domínio.
