import type { ReactNode } from 'react'

import * as S from './styles'

export type ItemListEntry = {
  id: string
  // Coluna estreita à esquerda: número do item.
  aside?: string
  title: string
  description?: string
}

type Props = {
  items: readonly ItemListEntry[]
  label: string
  // Com onSelect a lista vira listbox de escolha. Sem ela, é só leitura.
  onSelect?: (id: string) => void
  selectedId?: string | null
  isFlush?: boolean
}

export function ItemList({ items, label, onSelect, selectedId, isFlush }: Props): ReactNode {
  return (
    <S.List role={onSelect ? 'listbox' : undefined} aria-label={label} isFlush={isFlush}>
      {items.map((entry) => {
        const content = (
          <>
            <S.Aside>{entry.aside}</S.Aside>
            <span>
              <S.Title>{entry.title}</S.Title>
              {entry.description && <S.Description>{entry.description}</S.Description>}
            </span>
          </>
        )

        return (
          <li key={entry.id} role={onSelect ? 'presentation' : undefined}>
            {onSelect ? (
              <button
                type="button"
                role="option"
                aria-selected={selectedId === entry.id}
                className={S.row}
                onClick={() => onSelect(entry.id)}
              >
                {content}
              </button>
            ) : (
              <div className={S.row}>{content}</div>
            )}
          </li>
        )
      })}
    </S.List>
  )
}
