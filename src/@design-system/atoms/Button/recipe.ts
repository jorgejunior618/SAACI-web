import { type RecipeVariantProps, cva } from '@/styled-system/css'

export const buttonRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2',
    minHeight: 'control',
    paddingX: '4',
    borderRadius: 'control',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    textStyle: 'bodyStrong',
    lineHeight: '20px',
    textDecoration: 'none',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    _disabled: {
      background: 'line',
      color: 'ink.muted',
      borderColor: 'transparent',
      cursor: 'not-allowed',
    },
    '&[aria-busy=true]': { cursor: 'progress' },
  },
  variants: {
    variant: {
      // A ação da tela. Uma por tela.
      primary: {
        background: 'brand',
        color: 'brand.on',
        _active: { background: 'brand.pressed' },
      },
      secondary: {
        background: 'surface',
        color: 'ink',
        borderColor: 'line',
        _active: { background: 'surface.muted' },
      },
      tertiary: {
        background: 'transparent',
        color: 'brand.text',
        paddingX: '2',
      },
      tertiaryDanger: {
        background: 'transparent',
        color: 'danger',
        paddingX: '2',
      },
      // Só dentro de uma confirmação.
      danger: {
        background: 'danger.fill',
        color: 'danger.on',
      },
    },
    size: {
      md: {},
      lg: { minHeight: '56px' },
      xl: { minHeight: '64px' },
    },
    isBlock: {
      true: { display: 'flex', width: '100%' },
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})

export type ButtonVariants = NonNullable<RecipeVariantProps<typeof buttonRecipe>>
