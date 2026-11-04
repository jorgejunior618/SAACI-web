import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = {
  icon: LucideIcon
  size?: 16 | 20 | 22 | 24 | 28 | 32
  strokeWidth?: number
}

// Traço de 1.5px, como o design. Decorativo: o texto ao lado ou o aria-label do botão dá o nome.
export function Icon({ icon: IconComponent, size = 20, strokeWidth = 1.5 }: Props): ReactNode {
  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden
      focusable={false}
      style={{ flex: 'none' }}
    />
  )
}
