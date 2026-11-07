'use client'

import { Camera } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { Button } from '@design-system'
import type { ButtonVariant } from '@design-system'

import { SelectControl, SwitchControl } from '../../../Controls'
import { Playground } from '../../../Playground'
import * as S from './styles'

const VARIANTS = [
  'primary',
  'secondary',
  'tertiary',
  'danger',
] as const satisfies readonly ButtonVariant[]

/** Área de teste do `Button`: papel, largura, envio, desabilitado e ícone. */
export function Demo(): ReactNode {
  const [variant, setVariant] = useState<ButtonVariant>('primary')
  const [block, setBlock] = useState(false)
  const [busy, setBusy] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [hasIcon, setHasIcon] = useState(false)

  return (
    <Playground
      controls={
        <>
          <SelectControl label="variant" value={variant} options={VARIANTS} onChange={setVariant} />
          <SwitchControl label="block" checked={block} onChange={setBlock} />
          <SwitchControl label="busy" checked={busy} onChange={setBusy} />
          <SwitchControl label="disabled" checked={disabled} onChange={setDisabled} />
          <SwitchControl label="icon" checked={hasIcon} onChange={setHasIcon} />
        </>
      }
    >
      <S.Wrap>
        <Button
          variant={variant}
          block={block}
          busy={busy}
          busyLabel="Registrando"
          disabled={disabled}
          icon={hasIcon ? Camera : undefined}
        >
          Registrar atividade
        </Button>
      </S.Wrap>
    </Playground>
  )
}
