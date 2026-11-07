'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { Spinner } from '@design-system'
import type { SpinnerSize } from '@design-system'

import { SelectControl } from '../../../Controls'
import { Playground } from '../../../Playground'

const SIZES = ['sm', 'lg'] as const satisfies readonly SpinnerSize[]

/** Área de teste do `Spinner`: escolhe o tamanho. */
export function Demo(): ReactNode {
  const [size, setSize] = useState<SpinnerSize>('lg')

  return (
    <Playground
      controls={<SelectControl label="size" value={size} options={SIZES} onChange={setSize} />}
    >
      <Spinner size={size} />
    </Playground>
  )
}
