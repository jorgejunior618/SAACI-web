'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { BottomNav } from '@design-system'

import { SelectControl } from '../../../Controls'
import { Playground } from '../../../Playground'
import { action, itemIds, items } from '../../items'
import * as S from '../../styles'

/** Área de teste da `BottomNav`: troca a aba ativa. */
export function Demo(): ReactNode {
  const [activeId, setActiveId] = useState<(typeof itemIds)[number]>('inicio')

  return (
    <Playground
      controls={
        <SelectControl label="activeId" value={activeId} options={itemIds} onChange={setActiveId} />
      }
    >
      <S.Frame>
        <BottomNav items={items} action={action} activeId={activeId} />
      </S.Frame>
    </Playground>
  )
}
