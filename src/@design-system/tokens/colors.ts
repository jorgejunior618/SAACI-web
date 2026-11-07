const pair = (light: string, dark: string): { value: { base: string; _dark: string } } => ({
  value: { base: light, _dark: dark },
})

/**
 * Cores semânticas do design system, cada uma com a versão clara (`base`) e a escura (`_dark`).
 *
 * @remarks
 * O componente consome o nome semântico, nunca o valor cru. `gorro` e `redemoinho` são de
 * identidade: ficam restritos ao logo, à capa e ao indicador de carregamento grande.
 */
export const semanticColors = {
  surface: {
    DEFAULT: pair('#ffffff', '#1d1b17'),
    sunken: pair('#f6f2ea', '#14130f'),
    muted: pair('#f5f1e8', '#26241f'),
    raised: pair('#ffffff', '#28261f'),
  },
  ink: {
    DEFAULT: pair('#1f1d18', '#f2eee6'),
    // Único cinza de texto.
    muted: pair('#635d51', '#b8b1a3'),
    // Só ícone inativo, separador e placeholder. Nunca texto de leitura.
    subtle: pair('#8c8474', '#857f71'),
  },
  line: {
    DEFAULT: pair('#e6dfd2', '#34312a'),
    // Só contorno de controle, que precisa de 3:1.
    strong: pair('#8f8778', '#7a7466'),
  },
  brand: {
    DEFAULT: pair('#125a34', '#6fc98c'),
    pressed: pair('#0c4627', '#8ad6a2'),
    on: pair('#ffffff', '#0b2414'),
    text: pair('#125a34', '#8ad6a2'),
    // Único fundo tingido: opção marcada em lista de escolha.
    soft: pair('#e7eee3', '#1f3326'),
  },
  progress: {
    DEFAULT: pair('#2f9e41', '#4cbb66'),
    track: pair('#ebe5d9', '#2f2c25'),
  },
  warning: pair('#8a5a00', '#e9b85a'),
  danger: {
    DEFAULT: pair('#b5161b', '#ff8f85'),
    // Só fundo do botão destrutivo.
    fill: pair('#cd191e', '#ff8f85'),
    on: pair('#ffffff', '#2b0606'),
  },
  focus: { value: '{colors.brand}' },
  scrim: pair('rgba(31, 29, 24, 0.44)', 'rgba(0, 0, 0, 0.6)'),
  // Vermelho do gorro do Saci. Só logo e capa. Nunca em componente.
  gorro: pair('#d81e1e', '#e5393a'),
  // Cinza do redemoinho. Só capa e indicador de carregamento grande. Nunca em componente.
  redemoinho: pair('#6f6f6f', '#9a9a9a'),
}
