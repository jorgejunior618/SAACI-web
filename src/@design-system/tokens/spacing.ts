// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

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

/**
 * Tamanhos fixos do design system.
 *
 * @remarks
 * `touch` é o alvo de toque mínimo de qualquer controle, mesmo quando o desenho é menor. `bottomnav`
 * não conta a área segura do aparelho. `content` é a largura da coluna do `AppFrame`.
 */
export const sizes = {
  touch: { value: '48px' },
  control: { value: '48px' },
  topbar: { value: '56px' },
  bottomnav: { value: '60px' },
  content: { value: '480px' },
}

export const durations = {
  fast: { value: '200ms' },
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

/**
 * Animações do design system: `spin`, o giro do indicador de carregamento, `sheetIn`, a subida do
 * bottom sheet desde a base da tela, `edgeIn`, a borda da `TopBar` que aparece conforme a página rola,
 * `pulse`, o piscar suave dos `Skeleton`, e `popIn`, a entrada do número em destaque do `StateScreen`.
 */
export const keyframes = {
  spin: { to: { transform: 'rotate(360deg)' } },
  sheetIn: { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
  edgeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
  pulse: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
  popIn: {
    from: { opacity: '0', transform: 'translateY(12px) scale(0.96)' },
    to: { opacity: '1', transform: 'none' },
  },
}
