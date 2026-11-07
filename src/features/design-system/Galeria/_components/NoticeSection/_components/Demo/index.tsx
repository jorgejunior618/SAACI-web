'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { Link, Notice } from '@design-system'
import type { NoticeTone } from '@design-system'

import { SelectControl, SwitchControl } from '../../../Controls'
import { Playground } from '../../../Playground'
import * as S from './styles'

const FORMATS = ['inline', 'block'] as const
const TONES = ['neutral', 'warning', 'danger', 'success'] as const satisfies readonly NoticeTone[]

/** Área de teste do `Notice`: formato, tom e, no bloco, título, ação e fundo de cartão. */
export function Demo(): ReactNode {
  const [format, setFormat] = useState<(typeof FORMATS)[number]>('block')
  const [tone, setTone] = useState<NoticeTone>('danger')
  const [hasTitle, setHasTitle] = useState(true)
  const [hasAction, setHasAction] = useState(true)
  const [inCard, setInCard] = useState(false)

  return (
    <Playground
      controls={
        <>
          <SelectControl label="format" value={format} options={FORMATS} onChange={setFormat} />
          <SelectControl label="tone" value={tone} options={TONES} onChange={setTone} />
          <SwitchControl label="title (bloco)" checked={hasTitle} onChange={setHasTitle} />
          <SwitchControl label="actions (bloco)" checked={hasAction} onChange={setHasAction} />
          <SwitchControl label="inCard (bloco)" checked={inCard} onChange={setInCard} />
        </>
      }
    >
      <S.Wrap>
        {format === 'inline' ? (
          <Notice tone={tone}>Nada foi registrado. O que você preencheu continua aqui.</Notice>
        ) : (
          <Notice
            format="block"
            tone={tone}
            inCard={inCard}
            title={hasTitle ? 'O envio caiu no meio' : undefined}
            actions={
              hasAction ? (
                <Link as="button" type="button">
                  Tentar de novo
                </Link>
              ) : undefined
            }
          >
            Nada foi registrado. O que você preencheu continua aqui.
          </Notice>
        )}
      </S.Wrap>
    </Playground>
  )
}
