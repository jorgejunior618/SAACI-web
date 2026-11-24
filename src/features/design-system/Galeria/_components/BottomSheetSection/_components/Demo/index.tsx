// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { BottomSheet, Button } from '@design-system'
import type { BottomSheetHandle } from '@design-system'

import * as S from './styles'

/** Área de teste do `BottomSheet`: um botão abre a confirmação e a página mostra o que foi escolhido. */
export function Demo(): ReactNode {
  const sheetRef = useRef<BottomSheetHandle>(null)
  const [result, setResult] = useState('Nada escolhido ainda.')

  return (
    <S.Root>
      <Button variant="secondary" onClick={() => sheetRef.current?.open()}>
        Remover atividade
      </Button>
      <S.Result role="status">{result}</S.Result>
      <BottomSheet
        ref={sheetRef}
        title="Remover esta atividade?"
        description="Palestra sobre computação quântica sai do seu total e o comprovante é apagado. Para corrigir um dado, remova e registre de novo."
        actions={
          <>
            <Button
              variant="danger"
              block
              onClick={() => {
                setResult('Atividade removida.')
                sheetRef.current?.close()
              }}
            >
              Remover atividade
            </Button>
            <Button
              variant="secondary"
              block
              onClick={() => {
                setResult('Mantida.')
                sheetRef.current?.close()
              }}
            >
              Manter
            </Button>
          </>
        }
      />
    </S.Root>
  )
}
