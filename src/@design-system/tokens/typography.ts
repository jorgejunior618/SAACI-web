// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

export const fonts = {
  // --font-geist vem do next/font no layout raiz.
  sans: {
    value: 'var(--font-geist), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
}

type TextStyle = {
  value: {
    fontSize: string
    lineHeight: string
    fontWeight: string
    letterSpacing?: string
    fontVariantNumeric?: string
  }
}

const style = (
  fontSize: string,
  lineHeight: string,
  fontWeight: string,
  letterSpacing?: string,
  isNumeric = false,
): TextStyle => ({
  value: {
    fontSize,
    lineHeight,
    fontWeight,
    ...(letterSpacing && { letterSpacing }),
    ...(isNumeric && { fontVariantNumeric: 'tabular-nums' }),
  },
})

/**
 * Estilos de texto do design system, usados pelo `textStyle` do Panda.
 *
 * @remarks
 * `display` é o número da tela (um por tela) e `title` serve de título de tela e de seção.
 * Os dois usam `tabular-nums` para as casas das horas alinharem.
 */
export const textStyles = {
  display: style('32px', '36px', '600', '-0.64px', true),
  title: style('20px', '26px', '600', '-0.2px'),
  body: style('16px', '24px', '400'),
  bodyStrong: style('16px', '24px', '500'),
  support: style('14px', '20px', '400'),
  label: style('14px', '20px', '500'),
  caption: style('12px', '16px', '500'),
}
