// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { ItemPicker } from '@design-system'
import type { ItemPickerItem } from '@design-system'

type Props = {
  /** Itens da lista, na ordem do formulário. */
  items: ItemPickerItem[]
  /** Texto da busca ao abrir. */
  initialQuery?: string
  /** Item marcado ao abrir. `null` deixa tudo desmarcado. */
  initialValue?: number | null
}

/** O `ItemPicker` controlado por estado local, para a galeria mostrar um estado e deixar mexer nele. */
export function Example({ items, initialQuery = '', initialValue = null }: Props): ReactNode {
  const [query, setQuery] = useState(initialQuery)
  const [value, setValue] = useState<number | null>(initialValue)

  return (
    <ItemPicker
      label="Em qual item do formulário essa atividade entra?"
      items={items}
      value={value}
      onChange={setValue}
      query={query}
      onQueryChange={setQuery}
      suggestions={['evento', 'curso']}
    />
  )
}
