# 0012. Escrita monta a resposta sem ir à rede depois do commit

- **Status:** Proposta
- **Data:** 19/11/2026

## Contexto

A ADR 0011 decidiu que o registro de atividade lê tudo de que a resposta precisa antes do upload e,
depois do commit, não vai mais à rede. A regra ficou escrita só para a escrita com comprovante.

A revisão do `updateActivity` mostrou o mesmo defeito na correção: o `update` gravava e depois relia
perfil, regras e atividades para devolver as horas. Se essa leitura falhasse, a tela dizia "não
salva" para uma correção gravada, e o cache não era invalidado, porque o `onSuccess` não roda. Com
a trava de `updated_at`, a nova tentativa, feita com o valor antigo, virava `StaleActivityError`: um
conflito do aluno com ele mesmo.

O motivo não depende de comprovante. Vale para toda escrita cujo resultado a tela mostra ao aluno.

## Decisão

- Depois que a escrita é confirmada pelo banco, o service não vai mais à rede. A resposta sai do que
  a própria escrita devolveu (`.select(colunas)` no `update`, `returning` na RPC) somado ao que foi
  lido **antes** dela.
- O que a resposta precisa de outras tabelas (regras, perfil, as demais linhas para o cálculo único)
  é lido antes da escrita. Se essa leitura falhar, nada foi gravado, e o erro diz a verdade.
- Leitura depois de uma escrita que **não** gravou continua permitida. Exemplo: o `update` que pegou
  zero linhas relê a linha para separar "mudou" de "sumiu".
- **Commit incerto se reconcilia pela marca única da tentativa.** Quando a escrita falha sem código
  (rede), a requisição pode ter chegado e só a resposta se perdido. O service relê pelo que só esta
  tentativa tem: no registro, o `comprovante_caminho` (um `uuid` novo por envio, `unique` no banco);
  na correção, o id com `updated_at` diferente do lido **e** os valores pedidos já gravados. Achou,
  é sucesso, montado como na escrita confirmada. Não achou, ou a releitura falhou, sobe o erro
  original. A releitura não cria erro falso: sem ela, o desfecho já era o erro.
- Hoje seguem a regra `createActivity`, `updateActivity` e `updateProfile`. A reconciliação vale para
  `createActivity` e `updateActivity`; o `updateProfile` não tem trava de `updated_at`, então a nova
  tentativa dele regrava os mesmos valores sem conflito.

## Consequências

- O resultado da mutation reflete só o que o banco decidiu. Um erro na tela sempre quer dizer "não
  gravou", ou um commit incerto que nem a releitura conseguiu esclarecer (a rede seguiu fora).
- Nesse último caso, a nova tentativa do registro ainda pode duplicar a atividade. Fechar isso pede
  procurar uma atividade idêntica antes do upload, com uma janela de tempo a decidir: fica para uma
  issue própria.
- A leitura de antes custa idas ao banco mesmo quando a escrita é recusada. É o preço aceito.
- A resposta usa a lista lida antes da escrita. Uma escrita concorrente de outra aba no meio do
  caminho não aparece nela; aparece no refetch da invalidação, que a tela já chama no `onSuccess`.
- Quem escreve uma mutation nova monta a resposta assim. Função SQL que grava devolve as colunas de
  que o service precisa, em vez de só o `id`.
- `camada-servicos.md` ganha a regra na seção "Escrita".

## Alternativas descartadas

- **Manter a regra só para a escrita com comprovante.** A correção já repetia o defeito, e cada
  mutation nova o reabriria.
- **Tratar o commit incerto como "não gravou".** Era o comportamento anterior: o registro duplicava
  na nova tentativa, e a correção virava `StaleActivityError` sobre ela mesma.
- **Reconciliar por semelhança ("existe atividade parecida?").** Sem uma marca única, a releitura
  vira palpite e pode confundir duas atividades legítimas iguais (RF42 só avisa).
- **Erro próprio para "gravou, mas não carregou".** A tela teria de tratar um terceiro estado, e o
  aluno ainda não saberia o que aconteceu com as horas.
- **Tentar a releitura de novo antes de desistir.** Reduz a chance da falha, mas não a elimina, e
  atrasa a resposta de toda escrita.
