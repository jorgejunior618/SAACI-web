// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { Badge } from '@design-system'
import type { BadgeTone } from '@design-system'

import { SelectControl } from '../../../Controls'
import { Playground } from '../../../Playground'

const TONES = [
  'neutral',
  'counts',
  'partial',
  'doesNotCount',
] as const satisfies readonly BadgeTone[]

const TEXTS: Record<BadgeTone, string> = {
  neutral: 'Opcional',
  counts: 'Conta',
  partial: 'Conta em parte',
  doesNotCount: 'Não conta',
}

/** Área de teste do `Badge`: escolhe o tom e mostra o texto que combina com ele. */
export function Demo(): ReactNode {
  const [tone, setTone] = useState<BadgeTone>('counts')

  return (
    <Playground
      controls={<SelectControl label="tone" value={tone} options={TONES} onChange={setTone} />}
    >
      <Badge tone={tone}>{TEXTS[tone]}</Badge>
    </Playground>
  )
}
