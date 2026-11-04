import type { ComponentProps, ReactNode } from 'react'

import { cx } from '@/styled-system/css'

import * as S from './styles'

export function Checkbox({
  className,
  ...props
}: Omit<ComponentProps<'input'>, 'type'>): ReactNode {
  return <input {...props} type="checkbox" className={cx(S.checkbox, className)} />
}
