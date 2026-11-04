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

// Fonte: design-system/docs/fundamentos.md, seção Tipografia.
export const textStyles = {
  heroXl: style('72px', '76px', '600', '-2px', true),
  hero: style('56px', '60px', '600', '-1.6px', true),
  display: style('32px', '36px', '600', '-0.64px', true),
  heading: style('24px', '30px', '600', '-0.2px'),
  title: style('20px', '26px', '600', '-0.2px'),
  body: style('16px', '24px', '400'),
  bodyStrong: style('16px', '24px', '500'),
  support: style('14px', '20px', '400'),
  label: style('14px', '20px', '500'),
  caption: style('12px', '16px', '500'),
}
