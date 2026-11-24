// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { ClipboardList } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { Button, StateScreen } from '@design-system'

import { SelectControl, SwitchControl } from '../../../Controls'
import { Playground } from '../../../Playground'
import * as S from './styles'

const VARIANTS = ['empty', 'success', 'connectionError', 'loading'] as const

const TEXTS = {
  empty: {
    title: 'Você precisa de 120h para se formar',
    description: 'Registre a primeira atividade quando quiser.',
  },
  success: {
    title: 'Atividade registrada',
    description: 'Ela contou 4,0h. Faltam 43h para completar suas horas.',
  },
  connectionError: {
    title: 'Não conseguimos carregar seu painel',
    description: 'Suas atividades continuam salvas. Confira sua internet e tente de novo.',
  },
} as const

/** Área de teste do `StateScreen`: escolhe a variante e liga ou desliga as ações. */
export function Demo(): ReactNode {
  const [variant, setVariant] = useState<(typeof VARIANTS)[number]>('empty')
  const [hasActions, setHasActions] = useState(true)

  return (
    <Playground
      controls={
        <>
          <SelectControl label="variant" value={variant} options={VARIANTS} onChange={setVariant} />
          <SwitchControl label="actions" checked={hasActions} onChange={setHasActions} />
        </>
      }
    >
      <S.Wrap>
        {variant === 'loading' ? (
          <StateScreen variant="loading" label="Calculando suas horas" />
        ) : variant === 'empty' ? (
          <StateScreen
            variant="empty"
            icon={ClipboardList}
            {...TEXTS.empty}
            actions={hasActions ? <Button block>Continuar</Button> : undefined}
          />
        ) : (
          <StateScreen
            variant={variant}
            {...TEXTS[variant]}
            actions={hasActions ? <Button block>Continuar</Button> : undefined}
          />
        )}
      </S.Wrap>
    </Playground>
  )
}
