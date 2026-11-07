# 0001. O aluno corrige a atividade registrada

- **Status:** Proposta
- **Data:** 07/11/2026

## Contexto

`doc/modelagem-dados.md` diz "registrar e remover, nunca editar (RF17)": para corrigir, o aluno
remove a atividade e registra de novo. O protótipo validado pela equipe, no Detalhe da atividade,
tem "Corrigir dados": o aluno ajusta nome, item, quantidade e data, com a prévia de quanto a
atividade passa a contar. As duas fontes se contradizem, e quem implementa o Detalhe precisa de uma
delas como verdade.

Se nada mudar, o dev escolhe sozinho entre o design e o doc, e o outro lado fica com a divergência.

## Decisão

O aluno pode corrigir nome, item, quantidade e data da atividade. O comprovante não se troca: para
usar outro arquivo, remove e registra de novo.

- A correção passa pelo mesmo cálculo único de horas (RNF20) e invalida atividades e progresso.
- Toda escrita traz o `updated_at` que a tela leu e o inclui no `WHERE`. Zero linhas afetadas é
  conflito de edição, não sucesso, e a tela pede para abrir a atividade de novo.
- Remover continua existindo, com confirmação, e apaga o comprovante.

## Consequências

- `doc/modelagem-dados.md` troca a regra de "nunca editar" por esta.
- O service `atividades` ganha `updateAtividade` e `AtividadeDesatualizadaError`, e a atividade
  carrega `atualizadaEm`. O mock já segue este contrato.
- Os testes do cálculo de horas passam a cobrir também a correção.
- O hash do comprovante (RF42) não muda, porque o arquivo não é editável.
- O requisito RF17 precisa ser revisado no repositório de requisitos, senão a documentação de
  produto continua dizendo o contrário.

## Alternativas descartadas

- **Manter só remover e registrar de novo.** Respeita o requisito escrito, mas diverge do design
  validado e obriga o aluno a subir o mesmo arquivo para corrigir um zero a mais.
- **Permitir trocar também o comprovante.** Reabre a regra de salvar completo ou nada (RNF24), cria
  arquivo órfão no Storage a cada troca e muda o hash que o RF42 usa para avisar repetição.
