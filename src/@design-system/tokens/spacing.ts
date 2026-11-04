// Escala de 4px. O nome é o múltiplo de 4.
export const spacing = {
  '0': { value: '0' },
  '1': { value: '4px' },
  '2': { value: '8px' },
  '3': { value: '12px' },
  '4': { value: '16px' },
  '6': { value: '24px' },
  '8': { value: '32px' },
}

export const radii = {
  control: { value: '6px' },
  card: { value: '12px' },
  full: { value: '9999px' },
}

export const sizes = {
  touch: { value: '48px' },
  control: { value: '48px' },
  topbar: { value: '56px' },
  bottomnav: { value: '60px' },
  fab: { value: '48px' },
  content: { value: '480px' },
}

export const durations = {
  fast: { value: '200ms' },
  pop: { value: '500ms' },
}

export const easings = {
  out: { value: 'cubic-bezier(.2, .8, .2, 1)' },
}

// Única sombra do sistema: bottom sheet e diálogo.
export const semanticShadows = {
  overlay: {
    value: { base: '0 -8px 32px rgba(31, 29, 24, 0.12)', _dark: '0 -8px 32px rgba(0, 0, 0, 0.5)' },
  },
}

export const keyframes = {
  spin: { to: { transform: 'rotate(360deg)' } },
  pop: {
    from: { opacity: '0', transform: 'translateY(12px) scale(.96)' },
    to: { opacity: '1', transform: 'none' },
  },
  pulse: {
    '0%': { boxShadow: '0 0 0 0 color-mix(in srgb, var(--colors-brand) 35%, transparent)' },
    '70%': { boxShadow: '0 0 0 10px transparent' },
    '100%': { boxShadow: '0 0 0 0 transparent' },
  },
}
