# 0013. A tela de detalhe usa o "não encontrado" como estado vazio

- **Status:** Proposta
- **Data:** 20/11/2026

## Contexto

`doc/convencoes-codigo.md` pede `Loading.tsx` e `Empty.tsx` a toda tela que busca dado, e define o
`Empty.tsx` como "a busca teve sucesso mas devolveu zero resultados úteis". A regra foi escrita
pensando em lista: vazio de cadastro e vazio de filtro.

A tela de detalhe de uma entidade (rota `[id]`, como `atividades/[id]`) busca **uma** entidade. O
único "zero resultado" dela é a entidade não existir ou ser de outro aluno. Esse caso já tem lugar
próprio: a tela chama `notFound()`, e `doc/estrutura-pastas.md` manda o `not-found.tsx` da entidade
(`atividades/[id]/not-found.tsx`) mostrar o aviso com a volta para a lista. Um `Empty.tsx` no
detalhe nunca apareceria, mas a regra como está faz a auditoria e a revisão apontarem a falta, e a
próxima tela de detalhe teria a mesma dúvida.

## Decisão

- A tela de detalhe de uma entidade (rota `[id]`) tem `Loading.tsx` e **não** tem `Empty.tsx`.
- O estado sem dado do detalhe é o `notFound()`, que mostra o `not-found.tsx` da entidade, com a
  volta para a lista.
- Lista dentro de uma tela de detalhe (por exemplo, os comentários de uma entidade) continua com o
  seu vazio próprio, pela regra geral do `Empty.tsx`.

## Consequências

- O Detalhe da atividade (`features/atividades/Detalhe`) fica conforme sem arquivo morto.
- A auditoria e a revisão deixam de apontar a falta do `Empty.tsx` em tela de detalhe.
- Toda tela de detalhe nova precisa do `not-found.tsx` na pasta `[id]` da rota, já exigido por
  `doc/estrutura-pastas.md`.
- `doc/convencoes-codigo.md` ganha a linha da tela de detalhe na tabela de arquivos obrigatórios.

## Alternativas descartadas

- **Criar um `Empty.tsx` no detalhe só para cumprir a regra:** o arquivo nunca seria mostrado, porque
  o `notFound()` interrompe a renderização antes. Código morto que confunde quem lê.
- **Manter a regra como está:** o achado continua aberto em toda auditoria, e cada tela de detalhe
  repete a discussão.
- **Mostrar o vazio dentro da própria tela, sem `notFound()`:** o status HTTP seria 200 para algo que
  não existe, e o aviso e a volta para a lista seriam reescritos em cada detalhe, em vez de virem do
  `components/NotFoundScreen`.
