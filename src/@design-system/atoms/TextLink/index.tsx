import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

import { cx } from '@/styled-system/css'

import { textLink } from './styles'

type Tone = 'brand' | 'muted' | 'danger'

export function TextLink({
  tone,
  className,
  ...props
}: ComponentProps<typeof Link> & { tone?: Tone }): ReactNode {
  return <Link {...props} className={cx(textLink({ tone }), className)} />
}

// Mesmo visual, para ação que não navega.
export function TextButton({
  tone,
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'> & { tone?: Tone }): ReactNode {
  return <button {...props} type={type} className={cx(textLink({ tone }), className)} />
}
