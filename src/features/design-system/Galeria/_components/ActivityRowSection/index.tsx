'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { ActivityRow, ActivityRowSkeleton } from '@design-system'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import * as S from './styles'

/** Página "ActivityRow" da galeria: os três estados, com seleção e o esqueleto. */
export function ActivityRowSection(): ReactNode {
  const [checked, setChecked] = useState([true, true, false])

  function toggle(index: number, value: boolean): void {
    setChecked((current) => current.map((item, i) => (i === index ? value : item)))
  }

  return (
    <Section
      title="ActivityRow"
      description="Linha de atividade: título em uma linha, metadados em cinza e o estado dito pela cor da duração. Sem badge. Fora da seleção, a linha inteira é o link, com a seta. Com selection, a linha inteira marca e desmarca, sem link e sem seta; com isDisabled, aparece mas não marca."
    >
      <S.Specimens>
        <Specimen label="counts · partial · doesNotCount" isPlain>
          <S.List>
            <ActivityRow
              status="counts"
              title="Palestra sobre computação quântica"
              countedHours={2}
              endDate="12/03/2025"
              href="#"
            />
            <ActivityRow
              status="partial"
              title="Palestra sobre inteligência artificial aplicada a sistemas embarcados de baixo consumo"
              countedHours={1}
              activityHours={2}
              endDate="20/09/2025"
              href="#"
            />
            <ActivityRow
              status="doesNotCount"
              title="Palestra de boas-vindas"
              reason="antes do seu ingresso"
              href="#"
            />
          </S.List>
        </Specimen>
        <Specimen label="selection (a linha inteira marca)" isPlain>
          <S.List>
            <ActivityRow
              status="counts"
              title="Palestra sobre computação quântica"
              countedHours={2}
              endDate="12/03/2025"
              selection={{
                checked: checked[0] ?? false,
                onChange: (value) => {
                  toggle(0, value)
                },
              }}
            />
            <ActivityRow
              status="partial"
              title="Palestra de IA aplicada"
              countedHours={1}
              activityHours={2}
              endDate="20/09/2025"
              selection={{
                checked: checked[1] ?? false,
                onChange: (value) => {
                  toggle(1, value)
                },
              }}
            />
            <ActivityRow
              status="doesNotCount"
              title="Palestra de boas-vindas"
              reason="antes do seu ingresso"
              selection={{
                checked: checked[2] ?? false,
                onChange: (value) => {
                  toggle(2, value)
                },
                isDisabled: true,
              }}
            />
          </S.List>
        </Specimen>
        <Specimen label="Skeleton" isPlain>
          <S.List>
            <ActivityRowSkeleton />
            <ActivityRowSkeleton />
          </S.List>
        </Specimen>
      </S.Specimens>
    </Section>
  )
}
