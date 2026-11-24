// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { SubmitBar } from '@design-system'

import { SwitchControl } from '../../../Controls'
import { Playground } from '../../../Playground'

/** Área de teste do `SubmitBar`: liga o aviso, a gravação e a linha de horas. */
export function Demo(): ReactNode {
  const [isWarning, setIsWarning] = useState(false)
  const [busy, setBusy] = useState(false)
  const [hasHours, setHasHours] = useState(true)

  return (
    <Playground
      controls={
        <>
          <SwitchControl label="isWarning" checked={isWarning} onChange={setIsWarning} />
          <SwitchControl label="busy" checked={busy} onChange={setBusy} />
          <SwitchControl label="willCount" checked={hasHours} onChange={setHasHours} />
        </>
      }
    >
      <SubmitBar
        formId="demo"
        summaryLabel="Vai contar"
        willCount={hasHours ? 4 : null}
        isWarning={isWarning}
        busy={busy}
        busyLabel="Registrando"
      >
        Registrar
      </SubmitBar>
    </Playground>
  )
}
