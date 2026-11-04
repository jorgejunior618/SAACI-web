/**
 * SAACI — preset do Tailwind (opcional).
 * Use só se o projeto usar Tailwind. As cores apontam para as variáveis de
 * tokens.css, então o tema claro/escuro continua funcionando sozinho.
 *
 *   // tailwind.config.js
 *   module.exports = { presets: [require('./design-system/tokens/tailwind.preset.js')], content: [...] }
 *
 * E importe tokens.css uma vez no CSS global.
 */
const v = (name) => `var(--${name})`;

module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      surface: {
        sunken: v('surface-sunken'),
        DEFAULT: v('surface'),
        muted: v('surface-muted'),
        raised: v('surface-raised'),
      },
      ink: { DEFAULT: v('ink'), muted: v('ink-muted'), subtle: v('ink-subtle') },
      line: { DEFAULT: v('line'), strong: v('line-strong') },
      brand: {
        DEFAULT: v('brand'),
        pressed: v('brand-pressed'),
        on: v('on-brand'),
        text: v('brand-text'),
        soft: v('brand-soft'),
      },
      progress: { DEFAULT: v('progress'), track: v('progress-track') },
      warning: v('warning'),
      danger: { DEFAULT: v('danger'), fill: v('danger-fill'), on: v('on-danger') },
      focus: v('focus'),
      scrim: v('scrim'),
    },
    fontFamily: { sans: v('font-sans') },
    fontSize: {
      caption: ['12px', { lineHeight: '16px', fontWeight: '500' }],
      support: ['14px', { lineHeight: '20px' }],
      label: ['14px', { lineHeight: '20px', fontWeight: '500' }],
      body: ['16px', { lineHeight: '24px' }],
      title: ['20px', { lineHeight: '26px', fontWeight: '600', letterSpacing: '-0.2px' }],
      heading: ['24px', { lineHeight: '30px', fontWeight: '600', letterSpacing: '-0.2px' }],
      display: ['32px', { lineHeight: '36px', fontWeight: '600', letterSpacing: '-0.64px' }],
      hero: ['56px', { lineHeight: '60px', fontWeight: '600', letterSpacing: '-1.6px' }],
    },
    spacing: {
      0: '0', px: '1px',
      1: '4px', 2: '8px', 3: '12px', 4: '16px', 6: '24px', 8: '32px',
      touch: '48px', control: '48px', topbar: '56px', bottomnav: '60px',
    },
    borderRadius: { none: '0', control: '6px', card: '12px', full: '9999px' },
    boxShadow: { none: 'none', overlay: v('shadow-overlay') },
    extend: {
      minHeight: { touch: '48px', control: '48px' },
      height: { bar: '4px', 'bar-lg': '6px' },
    },
  },
};
