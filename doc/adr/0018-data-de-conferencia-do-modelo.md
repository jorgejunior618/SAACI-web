# 0018. A data de conferência do modelo do curso vive em `cursos.modelo_conferido_em`

- **Status:** Proposta
- **Data:** 21/11/2026

## Contexto

A tela Pedido diz de qual modelo de formulário o PDF sai ("Modelo da coordenação de X, conferido em
...") e mostrava o marcador `[DATA DE CONFERÊNCIA DO MODELO]`. A data não existia em `Course` nem na
tabela `cursos`. Sem um lugar para ela, a tela prometia um dado que ninguém guardava, e inventar uma
data seria dizer ao aluno que a coordenação conferiu algo que ela não conferiu.

## Decisão

- **`cursos` ganha `modelo_conferido_em date`**, nula por padrão. Entra por migration, junto do
  resto do cadastro do curso (RNF21), e só a coordenação define o valor.
- **`Course.checkedAt`** é `string | null` (data ISO). O service só repassa a coluna.
- **A tela só cita a data quando ela existe.** Com data: "Modelo da coordenação de X, conferido em
  dd/mm/aaaa." Sem data: "Modelo da coordenação de X." Nenhum marcador, nenhuma data suposta.
- **Nenhum curso recebe data agora.** Quando a coordenação informar, uma migration de `update`
  preenche a coluna.

## Consequências

- O curso-piloto mostra a frase sem data até a coordenação conferir o modelo.
- Cada conferência nova do modelo é uma migration pequena, como qualquer mudança no cadastro.
- `database.types.ts` passa a ter a coluna, e o `CourseSchema` rejeita data fora do formato ISO.
- Quem criar um `Course` em teste precisa informar `checkedAt` (`null` serve).

## Alternativas descartadas

- **Constante no código.** Contraria o RNF21: dado de curso mora no cadastro, não em TypeScript.
- **Texto livre.** Aceitaria "março" ou "ontem", e a tela não saberia formatar nem comparar.
- **Tirar a frase de conferência.** Perde a informação de que o modelo é da coordenação e de quando
  foi validado, que é o que o aluno quer saber antes de entregar.
