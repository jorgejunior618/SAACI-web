# Exemplos completos por contexto

Apoio da skill `saaci-tsdoc`. Modelos para adaptar. Cada um termina com o que aparece no balão por causa daquele comentário.

---

## 1. Função utilitária pura

```ts
/**
 * Formata um CPF bruto no padrão de exibição brasileiro.
 *
 * @param cpf - Dígitos do CPF, com ou sem formatação
 * @returns String formatada como "123.456.789-00", ou string vazia se inválido
 *
 * @example
 * // Usado na tela de perfil para exibir o documento do usuário
 * formatarCPF(usuario.cpf)
 */
export function formatarCPF(cpf: string): string { ... }
```

**No balão:** ao chamar `formatarCPF(`, o autocomplete mostra a frase de resumo. O hover completo mostra também o `@param`, o `@returns` (que cobre o caso de borda) e o exemplo com destaque de sintaxe.

---

## 2. Hook

```ts
/**
 * Busca e guarda o status de assinatura do usuário atual.
 *
 * @remarks
 * Precisa estar dentro do `AuthProvider`. Fora dele, retorna sempre `isLoading: true`.
 *
 * @returns Objeto com a flag `isPremium` e o estado `isLoading`
 *
 * @example
 * // Usado em telas com paywall para decidir qual conteúdo exibir
 * const { isPremium } = useAssinatura()
 */
export function useAssinatura() { ... }
```

**No balão:** o `@remarks` guarda a armadilha de uso (precisa do Provider) fora da frase de resumo. O autocomplete fica limpo e o hover completo avisa antes do primeiro uso.

---

## 3. Componente React: o caso que mais gera erro

Errado. Documentar as props no comentário da função não conecta a nada no JSX:

```tsx
/**
 * Exibe um cartão de produto com preço e botão de compra.
 *
 * @param props.produto - Produto exibido no cartão
 * @param props.aoComprar - Chamado com o ID do produto ao tocar em comprar
 */
export function CartaoProduto({ produto, aoComprar }: CartaoProdutoProps) { ... }
```

Ao passar o mouse sobre `produto` ou `aoComprar` num JSX que usa o componente, nada aparece. O TypeScript não liga essas linhas de `@param` às props reais.

Certo. A doc vive na interface de Props, campo a campo:

```tsx
interface CartaoProdutoProps {
  /** Produto exibido no cartão, com nome, preço e imagem. */
  produto: Produto;

  /** Chamado com o ID do produto ao tocar em comprar. */
  aoComprar: (produtoId: string) => void;

  /**
   * Tamanho visual do cartão.
   * @defaultValue "medium"
   */
  tamanho?: "small" | "medium" | "large";
}

/**
 * Exibe um cartão de produto com preço e botão de compra.
 *
 * @example
 * // Usado na VitrineScreen para cada item da lista
 * <CartaoProduto produto={item} aoComprar={handleComprar} />
 */
export function CartaoProduto({ produto, aoComprar, tamanho }: CartaoProdutoProps) { ... }
```

**No balão:** ao escrever `<CartaoProduto produto={...} />` em outro arquivo, passar o mouse sobre `produto` mostra "Produto exibido no cartão, com nome, preço e imagem." O autocomplete de props, ao abrir `<CartaoProduto />`, lista cada prop com a descrição e o `@defaultValue` de `tamanho`.

---

## 4. Tipo ou interface de domínio

```ts
/**
 * Representa um produto da vitrine com preço e estoque.
 *
 * @example
 * // Retornado pela API de produtos e passado para CartaoProduto
 * const produto: Produto = { id: "1", nome: "Camiseta", precoCentavos: 4990, estoque: 3 }
 */
export interface Produto {
  id: string
  nome: string

  /** Preço em centavos. 4990 vale R$ 49,90. */
  precoCentavos: number

  /** Unidades disponíveis. Zero esconde o botão de compra. */
  estoque: number
}
```

**No balão:** o hover sobre `Produto` mostra a frase de resumo e o exemplo. O hover sobre `precoCentavos`, em qualquer arquivo, explica a unidade, que não é óbvia só pelo tipo `number`.

---

## 5. Constante e objeto de configuração

```ts
/** Tempo, em milissegundos, de espera antes de tentar a requisição de novo. */
export const RETRY_DELAY_MS = 30_000
```

**No balão:** uma linha basta. O hover mostra o valor e a frase juntos, sem tags extras.

---

## 6. Definição de query (TanStack Query)

```ts
/**
 * Define a query da sessão atual, para o prefetch e o `useQuery` usarem a mesma chave.
 *
 * @remarks
 * Os dados ficam frescos por `STALE_TIME.cadastro`. Depois do login, grave a sessão com
 * `setQueryData(accountKeys.session(), session)` em vez de invalidar, senão o cache ainda diz
 * "sem sessão" por um instante.
 *
 * @example
 * // Usado pelo SessionGate para decidir entre a tela de login e a área logada
 * useQuery({ ...accountQueries.session(), enabled: isMounted })
 */
export const accountQueries = {
  session: () => queryOptions({ queryKey: accountKeys.session(), queryFn: getSession }),
}
```

**No balão:** o `@remarks` guarda a armadilha do cache fora da frase de resumo, e o exemplo mostra o consumidor real da definição.

---

## 7. Função obsoleta

```ts
/**
 * Formata um CPF bruto no padrão de exibição brasileiro.
 *
 * @deprecated Use {@link formatarDocumento}, que cobre CPF e CNPJ no mesmo formato.
 */
export function formatarCPF(cpf: string): string { ... }
```

**No balão:** todo lugar que chama `formatarCPF` passa a mostrar o nome riscado, com o aviso e o link clicável para `formatarDocumento` no hover.

---

## 8. Função genérica

```ts
/**
 * Ordena uma lista sem mutar o array recebido.
 *
 * @typeParam T - Tipo do item guardado na lista
 * @param itens - Lista original, não é alterada
 * @param comparador - Função de comparação, no mesmo formato do `Array.sort`
 *
 * @example
 * // Usado para ordenar produtos por preço sem afetar a lista original
 * criarListaOrdenada(produtos, (a, b) => a.precoCentavos - b.precoCentavos)
 */
export function criarListaOrdenada<T>(itens: T[], comparador: (a: T, b: T) => number): T[] { ... }
```

**No balão:** o `@typeParam` aparece junto dos parâmetros normais, deixando claro que `T` é inferido a partir de `itens` e não precisa ser passado à mão.
