import type { ReactNode } from 'react'

import * as S from './styles'

type Props = {
  value: number
  max: number
  size?: 'sm' | 'lg'
  // Com rótulo, a barra vira progressbar acessível. Sem rótulo, o número está escrito ao lado.
  label?: string
}

export function ProgressBar({ value, max, size, label }: Props): ReactNode {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const a11y = label
    ? {
        role: 'progressbar',
        'aria-valuemin': 0,
        'aria-valuemax': max,
        'aria-valuenow': Math.min(value, max),
        'aria-label': label,
      }
    : { 'aria-hidden': true }

  return (
    <span className={S.track({ size })} {...a11y}>
      {/* Largura calculada em runtime: não cabe em classe estática. */}
      <span className={S.fill} style={{ width: `${percent}%` }} />
    </span>
  )
}
