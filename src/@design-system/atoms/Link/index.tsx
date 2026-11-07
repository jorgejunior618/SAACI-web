import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

import * as S from './styles'

export type LinkProps = ComponentPropsWithoutRef<'a'> & {
  /**
   * Elemento ou componente que desenha o link. Padrão: `a`.
   * Para navegar sem recarregar, a feature passa o `Link` do `next/link`; o design system não importa o roteador.
   */
  as?: ElementType
  /** Link sozinho na linha: ganha altura de 48px para o toque. Dentro de frase, deixe desligado. */
  isStandalone?: boolean
  children: ReactNode
}

/**
 * Link de texto em `brand.text`, sublinhado e com peso 500.
 *
 * @remarks
 * Com `as`, as props continuam tipadas como as de `<a>`; o TypeScript não confere as do componente
 * passado. Link que leva a outra tela mantém o sublinhado: cor sozinha não basta para daltonismo.
 *
 * @example
 * ```tsx
 * import NextLink from 'next/link'
 *
 * <Link as={NextLink} href="/atividades" isStandalone>
 *   Ver meu progresso
 * </Link>
 * ```
 */
export function Link({ as, isStandalone = false, ...rest }: LinkProps): ReactNode {
  return <S.Root as={as} standalone={isStandalone} {...rest} />
}
