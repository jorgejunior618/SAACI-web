// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { ArrowLeft, Camera, Search, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { Icon } from '@design-system'
import type { IconSize } from '@design-system'

import { SelectControl } from '../../../Controls'
import { Playground } from '../../../Playground'
import * as S from './styles'

const ICONS = { Camera, ArrowLeft, User, Search } satisfies Record<string, LucideIcon>
const NAMES = ['Camera', 'ArrowLeft', 'User', 'Search'] as const
const SIZES = ['sm', 'md', 'lg', 'xl'] as const satisfies readonly IconSize[]

/** Área de teste do `Icon`: escolhe o ícone do Lucide e o tamanho. */
export function Demo(): ReactNode {
  const [name, setName] = useState<(typeof NAMES)[number]>('Camera')
  const [size, setSize] = useState<IconSize>('md')

  return (
    <Playground
      controls={
        <>
          <SelectControl label="icon" value={name} options={NAMES} onChange={setName} />
          <SelectControl label="size" value={size} options={SIZES} onChange={setSize} />
        </>
      }
    >
      {/* Ícone nunca aparece sozinho: o texto carrega o significado. */}
      <S.Line>
        <Icon icon={ICONS[name]} size={size} />
        Tirar foto
      </S.Line>
    </Playground>
  )
}
