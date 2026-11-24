// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { SuggestionCard } from '@design-system'

type Props = {
  /** Estado mostrado: a leitura em andamento ou o item sugerido. */
  status: 'reading' | 'suggested'
}

const ITEM = {
  number: 7,
  name: 'Curso na área de engenharia de computação',
  rule: '1h para cada 4h de curso, até 60h',
}

/** O `SuggestionCard` com os callbacks ligados a um aviso, para a galeria mostrar o que cada ação faz. */
export function Example({ status }: Props): ReactNode {
  const [last, setLast] = useState<string | null>(null)

  if (status === 'reading') return <SuggestionCard status="reading" />

  return (
    <div>
      <SuggestionCard
        status="suggested"
        item={ITEM}
        onConfirm={() => setLast('onConfirm: o item vira o valor do campo')}
        onChooseOther={() => setLast('onChooseOther: a tela abre o ItemPicker')}
      />
      {last ? <p role="status">{last}</p> : null}
    </div>
  )
}
