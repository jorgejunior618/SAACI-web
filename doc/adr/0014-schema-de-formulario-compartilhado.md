# 0014. Schema de formulário usado por domínios diferentes mora em `src/utils/`

- **Status:** Proposta
- **Data:** 20/11/2026

## Contexto

`doc/convencoes-codigo.md` e `doc/estrutura-pastas.md` mandam o schema Valibot de formulário para
`schema.ts`, ao lado da tela. O formulário da atividade (nome, quantidade e datas em dd/mm/aaaa,
com as mesmas máscaras e mensagens) serve a duas telas de domínios diferentes: Registrar
(`features/registrar`) e a correção no Detalhe da atividade (`features/atividades`). Uma tela não
importa outra (`.claude/references/promocao-componente.md`), então "ao lado da tela" não tem
resposta. Copiar o schema em cada tela faria as mensagens e as validações divergirem, e o aluno
veria regras diferentes para o mesmo campo.

## Decisão

- Schema de formulário usado por telas de **domínios diferentes** mora em `src/utils/<nome>.ts`,
  junto dos helpers de parse e de formato do mesmo formulário, com `<nome>.test.ts` ao lado.
- Schema usado por **uma tela só** continua em `schema.ts`, ao lado do `index.tsx`.
- Schema usado por telas do **mesmo domínio** vai para `features/<dominio>/_components/`, junto do
  componente que o consome, como na ADR 0005.
- O schema de formulário lê texto digitado e devolve o formato do service. Ele não substitui o
  schema do domínio em `services/<dominio>/<dominio>.types.ts`, que continua validando a resposta
  do service.

## Consequências

- `src/utils/activity-form.ts` (`ActivityFormSchema`, `parseQuantity`, `buildPreview`) fica
  conforme.
- A regra de promoção de componente passa a valer também para schema: o lugar acompanha quem usa.
- `src/utils/` já exige teste de todo export (`doc/testes.md`), então o schema compartilhado sempre
  tem teste.
- `doc/estrutura-pastas.md` e `doc/convencoes-codigo.md` ganham o caso nas tabelas de onde criar e
  na seção de formulário.

## Alternativas descartadas

- **`services/<dominio>/<dominio>.types.ts`:** é o schema do domínio, com o formato do banco. O
  formulário trata texto em dd/mm/aaaa e quantidade com vírgula, que não pertencem ao service.
- **Copiar o schema em cada tela:** as mensagens e as validações divergem com o tempo, e a correção
  passaria a aceitar o que o registro recusa.
- **`src/components/ActivityFields/`:** o schema serve também à prévia e às telas que não renderizam
  os campos. Amarrá-lo ao componente obrigaria a tela a importar o componente só pelo schema.
