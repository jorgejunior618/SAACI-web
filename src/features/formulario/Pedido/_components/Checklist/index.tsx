import { Check, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { GroupedList, Icon } from '@design-system'

import * as S from './styles'

export type Pendencia = {
  id: string
  isOk: boolean
  title: string
  sub: string
  action: string
  href: string
}

// Cada linha leva ao lugar onde a pendência se resolve.
export function Checklist({ items }: { items: readonly Pendencia[] }): ReactNode {
  return (
    <GroupedList inset="number" aria-label="O que o pedido precisa">
      {items.map((item) => (
        <li key={item.id}>
          <Link href={item.href} className={S.row}>
            {item.isOk ? (
              <S.Ok aria-label="Pronto">
                <Check size={14} strokeWidth={2.5} aria-hidden />
              </S.Ok>
            ) : (
              <S.Todo aria-label="Falta" />
            )}
            <span>
              <S.Title>{item.title}</S.Title>
              <S.Sub>{item.sub}</S.Sub>
            </span>
            <S.Go>
              {item.action}
              <Icon icon={ChevronRight} size={16} />
            </S.Go>
          </Link>
        </li>
      ))}
    </GroupedList>
  )
}
