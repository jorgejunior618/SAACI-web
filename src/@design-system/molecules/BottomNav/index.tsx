// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { LucideIcon } from 'lucide-react'
import type { ElementType, ReactNode } from 'react'

import { Icon } from '../../atoms/Icon'
import * as S from './styles'

export type BottomNavItem = {
  /** Identificador do destino, comparado com `activeId` (`inicio`, `atividades`). */
  id: string
  /** Texto do destino, sempre visível e usado como nome acessível. */
  label: string
  /** Endereço do destino. */
  href: string
  /** Ícone do `lucide-react`, importado por quem usa (`House`, `ListChecks`, `CalendarCheck`, `User`). */
  icon: LucideIcon
}

export type BottomNavAction = {
  /** Texto da ação, sempre visível e usado como nome acessível. */
  label: string
  /** Endereço do fluxo que a ação abre. */
  href: string
  /** Ícone do `lucide-react` dentro do círculo, importado por quem usa (`Plus`). */
  icon: LucideIcon
}

export type BottomNavProps = {
  /**
   * As quatro abas, na ordem da barra: Início, Atividades, Eventos e Perfil. O tipo é uma tupla de
   * quatro: não existe quinta aba. A ação central não entra aqui, vai em `action`.
   */
  items: readonly [BottomNavItem, BottomNavItem, BottomNavItem, BottomNavItem]
  /** Ação central, desenhada entre a segunda e a terceira aba (Registrar). Nunca fica ativa. */
  action: BottomNavAction
  /**
   * `id` da aba da tela atual. Quem usa calcula (por exemplo, com `usePathname`); o design system não
   * importa o roteador. Um `id` que não existe deixa todas as abas inativas.
   */
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
 * Barra inferior com quatro abas e uma ação central, cada uma com ícone e rótulo.
 *
 * @remarks
 * A ação (Registrar) é um círculo de 48px em `brand` que sobe 22px acima da barra, com borda de 4px
 * em `surface`. Ela abre um fluxo, não é uma aba: nunca recebe `aria-current` e a tela do fluxo não
 * mostra a barra. A aba ativa leva `aria-current="page"`, cor `brand.text`, rótulo em peso 600 e
 * traço do ícone em 2, sem pílula de fundo. A altura é de 60px mais a área segura de baixo. Em tela
 * larga ela continua embaixo, na mesma coluna. Entrar, Criar conta, Recuperação, Seu curso e Confirme
 * seu e-mail não a mostram: isso é decisão da tela. Use no `bottomNav` do `AppFrame`.
 *
 * @example
 * ```tsx
 * <BottomNav
 *   items={[
 *     { id: 'inicio', label: 'Início', href: '/inicio', icon: House },
 *     { id: 'atividades', label: 'Atividades', href: '/atividades', icon: ListChecks },
 *     { id: 'eventos', label: 'Eventos', href: '/eventos', icon: CalendarCheck },
 *     { id: 'perfil', label: 'Perfil', href: '/perfil', icon: User },
 *   ]}
 *   action={{ label: 'Registrar', href: '/registrar', icon: Plus }}
 *   activeId="inicio"
 *   linkAs={NextLink}
 * />
 * ```
 */
export function BottomNav({
  items,
  action,
  activeId,
  linkAs,
  'aria-label': ariaLabel = 'Principal',
}: BottomNavProps): ReactNode {
  const [first, second, third, fourth] = items

  const renderItem = ({ id, label, href, icon }: BottomNavItem): ReactNode => (
    <S.Item key={id} as={linkAs} href={href} aria-current={id === activeId ? 'page' : undefined}>
      <S.IconSlot>
        <Icon icon={icon} size="lg" />
      </S.IconSlot>
      {label}
    </S.Item>
  )

  return (
    <S.Root aria-label={ariaLabel}>
      {renderItem(first)}
      {renderItem(second)}
      <S.Item as={linkAs} href={action.href}>
        <S.ActionDisc>
          <Icon icon={action.icon} size="lg" />
        </S.ActionDisc>
        {action.label}
      </S.Item>
      {renderItem(third)}
      {renderItem(fourth)}
    </S.Root>
  )
}
