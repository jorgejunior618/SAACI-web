'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { BottomNav } from '@design-system'

import { SelectControl } from '../../../Controls'
import { Playground } from '../../../Playground'
import { itemIds, items } from '../../items'
import * as S from '../../styles'

/** Área de teste da `BottomNav`: troca o destino ativo. */
export function Demo(): ReactNode {
  const [activeId, setActiveId] = useState<(typeof itemIds)[number]>('inicio')

  return (
    <Playground
      controls={
        <SelectControl label="activeId" value={activeId} options={itemIds} onChange={setActiveId} />
      }
    >
      <S.Frame>
        <BottomNav items={items} activeId={activeId} />
      </S.Frame>
    </Playground>
  )
}
