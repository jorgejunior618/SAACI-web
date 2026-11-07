'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { Link } from '@design-system'

import { SwitchControl } from '../../../Controls'
import { Playground } from '../../../Playground'

/** Área de teste do `Link`: alvo de toque de link sozinho na linha. */
export function Demo(): ReactNode {
  const [isStandalone, setIsStandalone] = useState(true)

  return (
    <Playground
      controls={
        <SwitchControl label="isStandalone" checked={isStandalone} onChange={setIsStandalone} />
      }
    >
      <Link href="#exemplo" isStandalone={isStandalone}>
        Ver meu progresso
      </Link>
    </Playground>
  )
}
