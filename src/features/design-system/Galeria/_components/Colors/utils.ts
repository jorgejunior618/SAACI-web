// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

/** Uma cor semântica pronta para exibir: nome, variável CSS do Panda e os valores dos dois temas. */
export type ColorSwatch = {
  /** Nome como o componente usa, por exemplo `surface.sunken`. */
  name: string
  /** Referência `var(--colors-...)` que acompanha o tema do sistema. */
  cssVar: string
  light: string
  dark: string
}

/** Cores que compartilham o primeiro trecho do nome (`surface`, `brand`), para exibir juntas. */
export type ColorGroup = {
  name: string
  swatches: ColorSwatch[]
}

type ThemedValue = { base: string; _dark: string }

function isThemed(value: unknown): value is ThemedValue {
  return typeof value === 'object' && value !== null && 'base' in value && '_dark' in value
}

/**
 * Achata o objeto de cores semânticas em uma lista plana, uma linha por cor.
 *
 * @param node Objeto de `semanticColors`, ou um grupo dele (`surface`, `brand`).
 * @param path Caminho já percorrido. Quem chama não precisa passar.
 * @returns As cores na ordem em que aparecem em `semanticColors`. A chave `DEFAULT` some do nome.
 */
export function flattenColors(node: object, path: string[] = []): ColorSwatch[] {
  if ('value' in node) {
    const parts = path.filter((part) => part !== 'DEFAULT')
    const value = node.value
    // Valor sem par claro/escuro é referência a outro token e vale nos dois temas.
    const themed: ThemedValue = isThemed(value)
      ? value
      : { base: String(value), _dark: String(value) }

    return [
      {
        name: parts.join('.'),
        cssVar: `var(--colors-${parts.join('-')})`,
        light: themed.base,
        dark: themed._dark,
      },
    ]
  }

  return Object.entries(node).flatMap(([key, child]: [string, object]) =>
    flattenColors(child, [...path, key]),
  )
}

/**
 * Agrupa as cores pelo primeiro trecho do nome, mantendo a ordem de aparição.
 *
 * @param swatches Lista de `flattenColors`.
 * @returns Um grupo por família (`surface`, `ink`, `brand`...). Cor sem família própria vira grupo de uma cor.
 */
export function groupColors(swatches: ColorSwatch[]): ColorGroup[] {
  const groups = new Map<string, ColorSwatch[]>()

  for (const swatch of swatches) {
    const family = swatch.name.split('.')[0]
    groups.set(family, [...(groups.get(family) ?? []), swatch])
  }

  return [...groups].map(([name, items]) => ({ name, swatches: items }))
}
