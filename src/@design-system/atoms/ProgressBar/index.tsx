import type { ReactNode } from 'react'

import * as S from './styles'

export type ProgressBarProps = {
  /** Valor atual, na mesma unidade de `max` (horas, por exemplo). Fora de 0 a `max`, é cortado. */
  value: number
  /** Valor que enche a barra. Com `max` zero ou negativo a barra fica vazia. */
  max: number
  /** Texto para leitor de tela que diz o que a barra mede ("Horas de Ensino"). Obrigatório. */
  label: string
}

/**
 * Mostra quanto de `max` já foi atingido, em uma barra de 4px com `role="progressbar"`.
 *
 * @remarks
 * Excesso não estoura o trilho: `value` acima de `max` enche a barra e `aria-valuenow` vale `max`.
 * O texto com o número ("4,0h de 20h") é de quem usa; a barra não escreve nada.
 *
 * @example
 * ```tsx
 * <ProgressBar value={12} max={20} label="Horas de Extensão" />
 * ```
 */
export function ProgressBar({ value, max, label }: ProgressBarProps): ReactNode {
  const safeMax = Math.max(max, 0)
  const clamped = Math.min(Math.max(value, 0), safeMax)
  const percent = safeMax > 0 ? (clamped / safeMax) * 100 : 0

  return (
    <S.Track
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={safeMax}
    >
      <S.Fill style={{ width: `${percent}%` }} />
    </S.Track>
  )
}
