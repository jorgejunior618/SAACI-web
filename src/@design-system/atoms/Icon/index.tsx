import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import * as S from './styles'

/** Tamanho do ícone: `sm` em linha de texto, `md` em botão, `lg` na barra inferior. */
export type IconSize = 'sm' | 'md' | 'lg'

const PIXELS: Record<IconSize, number> = { sm: 16, md: 20, lg: 22 }

export type IconProps = {
  /** Ícone do `lucide-react`, importado por quem usa (`Camera`, `ArrowLeft`). */
  icon: LucideIcon
  /** Tamanho em pixels: 16 (`sm`), 20 (`md`) ou 22 (`lg`). Padrão: `md`. */
  size?: IconSize
}

/**
 * Desenha um ícone do Lucide com o traço de 1,5px do design e a cor do texto ao redor.
 *
 * @remarks
 * Fica escondido de leitor de tela (`aria-hidden`), porque o ícone nunca aparece sozinho: o texto do
 * botão ou do link carrega o significado. Ícone sem texto precisa de `aria-label` no elemento pai.
 */
export function Icon({ icon: Glyph, size = 'md' }: IconProps): ReactNode {
  return (
    <Glyph
      className={S.icon}
      size={PIXELS[size]}
      strokeWidth={1.5}
      absoluteStrokeWidth={false}
      aria-hidden="true"
    />
  )
}
