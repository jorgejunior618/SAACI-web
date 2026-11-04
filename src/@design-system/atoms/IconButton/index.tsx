import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

import { cx } from '@/styled-system/css'

import * as S from './styles'

// Botão de 48×48, sem fundo. Só com ícone, precisa de aria-label.
export function IconButton({
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'>): ReactNode {
  return <button {...props} type={type} className={cx(S.iconButton, className)} />
}

export function IconLink({ className, ...props }: ComponentProps<typeof Link>): ReactNode {
  return <Link {...props} className={cx(S.iconButton, className)} />
}
