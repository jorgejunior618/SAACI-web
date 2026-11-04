# Testes

## Arnês

| Arnês  | Onde                                      | Comando     |
| ------ | ----------------------------------------- | ----------- |
| Vitest | `src/**/*.test.ts(x)` e `tests/*.test.ts` | `pnpm test` |

Teste que lê ou grava mock chama `aplicarFixture()` (ou `apagarTudo()`) no `beforeEach`: o banco do
mock é compartilhado pelo arquivo inteiro.

## Quando teste é obrigatório

Onde o erro é silencioso: cálculo de horas (RF14, RNF20) e envio atômico (RNF24). A pergunta é: se isso quebrar, alguém percebe olhando a tela, ou o dado já saiu
errado antes de aparecer sintoma?

- Função pura de cálculo e schema têm teste, em `.test.ts` ao lado.
- Toda função exportada de `src/utils/` tem teste.
- Teste verifica comportamento visível, não implementação interna.

## Um teste que nunca falhou não provou nada

Teste de proteção precisa ser visto falhando uma vez: comente a regra que ele protege, rode, veja
vermelho, restaure. A sabotagem precisa ser cirúrgica, isolando o comportamento afirmado.

Todo caso que compara contra algo lido afirma antes que houve o que comparar: comparar duas listas
vazias passa sobre nada.

## Armadilha herdada

Número formatado por `Intl` usa espaço não quebrável: componha a asserção com a própria função de
formatação.
