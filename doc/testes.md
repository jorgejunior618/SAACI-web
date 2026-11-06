# Testes

Qual arnês usar e quando um teste é obrigatório. Como escrever um teste de componente está em
`convencoes-codigo.md`, seção Testes.

## Arnês

| Arnês                      | Onde                                      | Comando         |
| -------------------------- | ----------------------------------------- | --------------- |
| Vitest + Testing Library   | `src/**/*.test.ts(x)` e `tests/*.test.ts` | `pnpm test`     |
| pgTAP (RLS), alvo          | `supabase/tests/database/*.test.sql`      | `pnpm test:db`  |
| Integração com login, alvo | `tests/integration/**/*.test.ts`          | `pnpm test:rls` |

`tests/*.test.ts` é para teste que não tem arquivo para co-localizar: verifica uma regra do
repositório inteiro (por exemplo, "nenhum arquivo do navegador importa `service_role`").

Teste que lê ou grava o mock monta o estado pela função de exemplo do próprio `<dom>.mock.ts`, no
`beforeEach`. O mock é em memória e compartilhado pelo arquivo de teste inteiro.

## Quando o teste é obrigatório

A pergunta: **se isso quebrar, alguém percebe olhando a tela, ou o dado já saiu errado antes de
aparecer sintoma?** Onde o erro é silencioso, o teste é obrigatório:

- **Cálculo de horas** (RF14, RNF20): uma hora a mais no total não grita na tela.
- **Salvar completo ou nada** (RNF24): comprovante perdido só aparece quando o aluno precisar dele.
- **Isolamento entre alunos** (RNF04, alvo): ler o comprovante de outro não dá erro.

Um formulário quebrado grita sozinho e não precisa de teste obrigatório por isso. Função pura de
cálculo e schema têm `.test.ts` ao lado, e o teste verifica comportamento visível, não implementação.

**Toda função exportada de `src/utils/` tem `.test.ts` ao lado.** O helper foi promovido por servir
2+ lugares, então uma regressão ali custa por todos eles. Não vale para o `utils.ts` de uma tela só:
a obrigatoriedade começa na promoção.

## Um teste que nunca falhou não provou nada

Antes de um teste de proteção (validação, regra de horas, policy) contar como pronto, veja-o falhar
uma vez: comente a regra que ele protege, rode, veja vermelho, restaure.

- **A sabotagem precisa ser cirúrgica.** Vermelho por outro motivo não prova nada: tirar o `where` de
  um `update` pode estourar o arquivo inteiro antes da primeira asserção. Isole o comportamento
  afirmado. Num total por categoria, a sabotagem útil é somar todas as categorias mas ler o número de
  uma só.
- **Todo caso que compara contra algo lido precisa afirmar antes que havia o que comparar.** Duas
  listas vazias, ou `is(NULL, NULL)`, passam sobre nada. "Zero divergências" entre zero linhas é
  verde por acidente.

  ```ts
  const registros = await getAtividades(filtros)

  expect(registros.length).toBeGreaterThan(0) // pré-condição: há o que comparar
  expect(somaDasLinhas(registros)).toBe(totais.horasComputadas)
  ```

## Formatação em asserção

`Intl` com unidade ou moeda (`style: 'currency'`, `style: 'unit'`) separa o valor do símbolo com
**espaço não quebrável** (U+00A0). Os dois lados parecem idênticos na mensagem de erro, o que torna o
diagnóstico caro.

- Literal digitado à mão não casa com a função. Componha a asserção com a própria função de
  formatação:

  ```ts
  expect(mensagemDeFalta(10, 4)).toBe('Faltam 6 horas') // ✗ se houver NBSP no meio
  expect(mensagemDeFalta(10, 4)).toBe(`Faltam ${formatHoras(6)}`) // ✓
  ```

- `getByText` normaliza o NBSP do DOM, mas não o esperado. Normalize os dois lados:
  `texto.replace(/ /g, ' ')`.

`formatHoras` hoje sai como `10,0h`, sem espaço, então a armadilha só aparece se alguém trocar por
`style: 'unit'`.

## Banco: armadilhas para quando houver Supabase

> Alvo (Supabase): ainda não implementado. Cada item custou tempo no projeto de origem desta
> documentação.

- `throws_ok(sql, '42501', descricao)` trata o 3º argumento como **mensagem esperada**. Use sempre 4
  argumentos: `throws_ok(sql, '42501', NULL, 'descrição')`.
- `UPDATE`/`DELETE` sem policy de `select` no mesmo escopo afeta zero linhas, sem erro. `throws_ok`
  não percebe.
- `INSERT ... RETURNING` sem policy de `select` recusa o INSERT inteiro, não "grava e esconde".
- `row IS NOT NULL` só é verdade se **todos** os campos forem não nulos. Para "devolveu uma linha",
  conte com `select count(*)`.
- Fixture de teste e seed disputam o mesmo espaço de UUID: prefixo novo por bloco de fixture, levantado
  do código (`grep`), não de uma lista em documento.
- A suíte de integração grava sem rollback. Fixture é exclusiva de **um arquivo**, o teste monta o
  próprio estado pela RPC, e os arquivos rodam um por vez em banco recém-resetado.
- `PGRST303` intermitente logo após o login, no Docker Desktop do macOS, é relógio da VM e não bug.
  Resolva no arnês com retry curto, nunca com `sleep` fixo.
