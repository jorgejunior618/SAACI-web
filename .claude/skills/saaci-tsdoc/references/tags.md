# Tags TSDoc e o que cada uma faz no editor

Apoio da skill `saaci-tsdoc`. Cada entrada segue o formato: para que serve, o que aparece no editor, exemplo curto e armadilha a evitar.

---

## Resumo (a primeira linha do comentário)

**Para que serve:** apresentar o símbolo em uma frase.

**O que aparece no editor:** é a única parte mostrada no autocomplete (`Ctrl+Space`), truncada se passar de uma linha. No hover completo aparece por inteiro, no topo.

```ts
/**
 * Formata um CPF para exibição.
 */
```

**Armadilha:** se a frase não responde "o que isso faz", o autocomplete não ajuda. Em boa parte dos usos é o único ponto de contato.

---

## `@param`

**Para que serve:** descrever o significado de um parâmetro.

**O que aparece no editor:** vira uma lista associada a cada parâmetro no balão de assinatura, que aparece ao digitar a chamada. O nome depois de `@param` precisa bater exatamente com o nome do parâmetro, senão o editor não liga os dois.

```ts
/**
 * @param cpf - Dígitos do CPF, com ou sem formatação
 */
```

**Armadilha:** descrever o tipo em vez do significado (`cpf - string`). O tipo já aparece sozinho, ao lado do nome, no mesmo balão.

---

## `@returns`

**Para que serve:** explicar o que volta da função, quando o nome não entrega isso sozinho.

**O que aparece no editor:** uma linha separada no hover, abaixo dos parâmetros.

```ts
/**
 * @returns String formatada como "123.456.789-00", ou string vazia se inválido
 */
```

**Armadilha:** repetir o tipo de retorno (`@returns string`) é ruído. Só vale quando há caso de borda ou formato específico a explicar.

---

## `@example`

**Para que serve:** mostrar uma situação real de uso.

**O que aparece no editor:** um bloco de código com destaque de sintaxe dentro do hover, se vier com a linguagem marcada (` ```tsx `). Sem a marcação, aparece sem cor.

```ts
/**
 * @example
 * // Usado na tela de perfil para exibir o documento do usuário
 * formatarCPF(usuario.cpf)
 */
```

**Armadilha:** exemplo genérico (`minhaFuncao(valor)`) não ajuda mais que o nome da função. O valor está no contexto de uso real, por isso procure um uso existente no projeto antes de escrever.

---

## `@deprecated`

**Para que serve:** avisar que o símbolo não deve mais ser usado.

**O que aparece no editor:** risca o nome do símbolo em todo lugar onde ele é usado no projeto e mostra o aviso em destaque no hover. É a tag com o efeito visual mais forte.

```ts
/**
 * @deprecated Use {@link formatarDocumento}, que cobre CPF e CNPJ.
 */
```

**Armadilha:** usar sem dizer a alternativa. Quem vê o risco na tela precisa saber para onde ir.

---

## `{@link Simbolo}`

**Para que serve:** apontar para outro símbolo do código.

**O que aparece no editor:** vira link clicável no hover. `Ctrl` (ou `Cmd`) + clique leva à definição do símbolo.

```ts
/**
 * @see {@link useSessao} para o hook equivalente de sessão.
 */
```

**Armadilha:** o link só resolve se o símbolo estiver importado ou visível no escopo do arquivo onde o comentário mora. Fora disso, aparece como texto puro, sem navegação.

---

## `@see`

**Para que serve:** apontar uma referência relacionada: outro símbolo, um `{@link}` ou uma URL.

**O que aparece no editor:** linha separada no hover, perto do fim.

```ts
/**
 * @see {@link CartaoProduto} para o componente que consome este tipo.
 */
```

---

## `@defaultValue`

**Para que serve:** documentar o valor padrão de uma prop ou parâmetro opcional.

**O que aparece no editor:** no balão da prop opcional (`?:`), para quem não passa valor.

```ts
interface Props {
  /**
   * Tamanho do botão.
   * @defaultValue "medium"
   */
  tamanho?: 'small' | 'medium' | 'large'
}
```

**Armadilha:** documentar um `@defaultValue` fora de sincronia com o código é pior que não documentar. O tooltip engana quem lê.

---

## `@throws`

**Para que serve:** avisar que a função pode lançar um erro, e em que condição.

**O que aparece no editor:** linha destacada no hover, para quem chama descobrir antes da produção que falta um `try/catch`.

```ts
/**
 * @throws Se o CPF vier com menos de 11 dígitos após a limpeza.
 */
```

---

## `@remarks`

**Para que serve:** detalhe mais longo que não cabe na frase de resumo.

**O que aparece no editor:** fica fora do trecho do autocomplete e aparece no hover completo, em seção separada. É o lugar da armadilha do teste do balão quando ela não cabe em uma frase.

```ts
/**
 * Busca e guarda o status de assinatura do usuário atual.
 *
 * @remarks
 * Precisa estar dentro do `AuthProvider`. Fora dele, retorna sempre `isLoading: true`.
 */
```

---

## `@typeParam`

**Para que serve:** descrever um parâmetro de tipo genérico (`<T>`).

**O que aparece no editor:** entra na lista de parâmetros do balão, junto com `@param`, identificado como tipo.

```ts
/**
 * @typeParam T - Tipo do item guardado na lista
 */
export function criarListaOrdenada<T>(itens: T[]): T[] { ... }
```

**Armadilha:** `@template` é o nome antigo (JSDoc). Em TSDoc o correto é `@typeParam`.

---

## `@privateRemarks`

**Para que serve:** nota interna para quem mantém o código, sem valor para quem só consome.

**O que aparece no editor:** não aparece em geradores de documentação pública, mas ainda aparece no hover. Use para contexto de manutenção, nunca para segredo.

---

## `@internal`

**Para que serve:** marcar que o símbolo, apesar de exportado, não é para uso fora do módulo onde está.

**O que aparece no editor:** sinalizador no hover. Lint e geradores de doc podem usá-lo para excluir o símbolo de relatórios públicos.

---

## Markdown dentro do TSDoc

O balão do hover renderiza Markdown. Use a favor da leitura:

- Crase (`` `assim` ``) para nome de variável, prop ou valor literal.
- Negrito (`**assim**`) só para alerta curto e real, nunca para decorar.
- Lista com `-` quando houver mais de uma opção ou passo.
- Bloco de código com a linguagem marcada (` ```tsx `) para ganhar destaque.
- Um `*` sozinho numa linha separa parágrafos. Sem ele, tudo vira um bloco só.

```ts
/**
 * Formata um CPF para exibição.
 *
 * Remove qualquer caractere que não seja dígito antes de validar.
 *
 * @param cpf - Dígitos do CPF, com ou sem formatação
 */
```
