import type { LucideIcon } from 'lucide-react'
import type { ElementType, ReactNode } from 'react'

import { Icon } from '../../atoms/Icon'
import * as S from './styles'

export type BottomNavItem = {
  /** Identificador do destino, comparado com `activeId` (`inicio`, `registrar`). */
  id: string
  /** Texto do destino, sempre visível e usado como nome acessível. */
  label: string
  /** Endereço do destino. */
  href: string
  /** Ícone do `lucide-react`, importado por quem usa (`House`, `Plus`, `File`, `ClipboardList`). */
  icon: LucideIcon
}

export type BottomNavProps = {
  /**
   * Os quatro destinos, na ordem da barra: Início, Registrar, Certificados e Formulário. O tipo é uma
   * tupla de quatro: não existe quinto destino.
   */
  items: readonly [BottomNavItem, BottomNavItem, BottomNavItem, BottomNavItem]
  /** `id` do destino da tela atual. Quem usa calcula (por exemplo, com `usePathname`); o design system não importa o roteador. */
  activeId: string
  /**
   * Elemento ou componente que desenha os links. Padrão: `a`. Para navegar sem recarregar e com
   * prefetch, a feature passa o `Link` do `next/link`.
   */
  linkAs?: ElementType
  /** Nome da região de navegação para leitor de tela. Padrão: "Principal". */
  'aria-label'?: string
}

/**
 * Barra inferior com os quatro destinos do produto, cada um com ícone e rótulo.
 *
 * @remarks
 * O destino ativo leva `aria-current="page"`, cor `brand.text`, rótulo em peso 600 e traço do ícone em
 * 2, sem pílula de fundo. A altura é de 60px mais a área segura de baixo. Não há quinto destino nem
 * botão flutuante, e em tela larga ela continua embaixo, na mesma coluna. Entrar, Criar conta,
 * Recuperação, Seu curso e Confirme seu e-mail não a mostram: isso é decisão da tela. Use no
 * `bottomNav` do `AppFrame`.
 *
 * @example
 * ```tsx
 * <BottomNav
 *   items={[
 *     { id: 'inicio', label: 'Início', href: '/inicio', icon: House },
 *     { id: 'registrar', label: 'Registrar', href: '/registrar', icon: Plus },
 *     { id: 'certificados', label: 'Certificados', href: '/certificados', icon: File },
 *     { id: 'formulario', label: 'Formulário', href: '/formulario', icon: ClipboardList },
 *   ]}
 *   activeId="inicio"
 *   linkAs={NextLink}
 * />
 * ```
 */
export function BottomNav({
  items,
  activeId,
  linkAs,
  'aria-label': ariaLabel = 'Principal',
}: BottomNavProps): ReactNode {
  return (
    <S.Root aria-label={ariaLabel}>
      {items.map(({ id, label, href, icon }) => (
        <S.Item
          key={id}
          as={linkAs}
          href={href}
          aria-current={id === activeId ? 'page' : undefined}
        >
          <S.IconSlot>
            <Icon icon={icon} size="lg" />
          </S.IconSlot>
          {label}
        </S.Item>
      ))}
    </S.Root>
  )
}
