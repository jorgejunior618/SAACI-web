// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { TextField } from '@design-system'
import type { TextFieldStatusProps } from '@design-system'

import { SelectControl, SwitchControl } from '../../../Controls'
import { Playground } from '../../../Playground'
import * as S from './styles'

const STATUSES = ['nenhum', 'read', 'unread'] as const

/** Monta as props de `status`, já que `unread` exige a frase. */
function statusProps(status: (typeof STATUSES)[number]): TextFieldStatusProps {
  if (status === 'read') return { status: 'read' }
  if (status === 'unread') {
    return {
      status: 'unread',
      unreadMessage: 'Não conseguimos ler o nome. Digite o nome da atividade.',
    }
  }

  return {}
}

/** Área de teste do `TextField`: origem da leitura, erro, opcional e regra. */
export function Demo(): ReactNode {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('nenhum')
  const [hasError, setHasError] = useState(false)
  const [isOptional, setIsOptional] = useState(false)
  const [hasHint, setHasHint] = useState(true)

  return (
    <Playground
      controls={
        <>
          <SelectControl label="status" value={status} options={STATUSES} onChange={setStatus} />
          <SwitchControl label="error" checked={hasError} onChange={setHasError} />
          <SwitchControl label="optional" checked={isOptional} onChange={setIsOptional} />
          <SwitchControl label="hint" checked={hasHint} onChange={setHasHint} />
        </>
      }
    >
      <S.Wrap>
        <TextField
          label="Nome da atividade"
          hint={hasHint ? 'Escreva como está no certificado.' : undefined}
          error={hasError ? 'Preencha o nome da atividade para continuar.' : undefined}
          optional={isOptional}
          defaultValue={status === 'unread' ? '' : 'Semana de Engenharia 2025'}
          {...statusProps(status)}
        />
      </S.Wrap>
    </Playground>
  )
}
