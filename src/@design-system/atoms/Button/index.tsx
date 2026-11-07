import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

import { cx } from '@/styled-system/css'

import { Spinner } from '../Spinner'
import { buttonRecipe, type ButtonVariants } from './recipe'

type ButtonProps = ComponentProps<'button'> &
  ButtonVariants & {
    isLoading?: boolean
  }

// Enquanto envia, o botão fica desabilitado e visível, com o verbo no gerúndio: nunca some.
export function Button({
  variant,
  size,
  isBlock,
  isLoading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps): ReactNode {
  return (
    <button
      {...props}
      type={type}
      className={cx(buttonRecipe({ variant, size, isBlock }), className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  )
}

type ButtonLinkProps = ComponentProps<typeof Link> & ButtonVariants

// Navegação com cara de botão. Vira <a>, como deve ser.
export function ButtonLink({
  variant,
  size,
  isBlock,
  className,
  ...props
}: ButtonLinkProps): ReactNode {
  return <Link {...props} className={cx(buttonRecipe({ variant, size, isBlock }), className)} />
}

export { buttonRecipe }
