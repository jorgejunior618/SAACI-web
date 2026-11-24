// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import * as S from './styles'

type Props = {
  /** Grupos já montados pelo servidor, só com título e id. Não recebe componente, para a lista não ir ao bundle do cliente. */
  groups: Array<{ title: string; items: Array<{ id: string; title: string }> }>
}

/** Navegação lateral da galeria. É client só para marcar a página aberta com `aria-current`. */
export function Sidebar({ groups }: Props): ReactNode {
  const pathname = usePathname()

  return (
    <S.Root aria-label="Seções do design system">
      <S.Brand>
        <S.BrandName>SAACI</S.BrandName>
        <S.BrandNote>Design system · só em desenvolvimento</S.BrandNote>
      </S.Brand>
      {groups.map(({ title, items }) => (
        <S.Group key={title}>
          <S.GroupTitle>{title}</S.GroupTitle>
          {items.map(({ id, title: itemTitle }) => {
            const href = `/design-system/${id}`

            return (
              <S.Item key={id} href={href} aria-current={pathname === href ? 'page' : undefined}>
                {itemTitle}
              </S.Item>
            )
          })}
        </S.Group>
      ))}
    </S.Root>
  )
}
