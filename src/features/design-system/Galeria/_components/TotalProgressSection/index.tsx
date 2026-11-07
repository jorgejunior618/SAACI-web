import type { ReactNode } from 'react'

import { TotalProgress, TotalProgressSkeleton } from '@design-system'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import { Demo } from './_components/Demo'
import * as S from './styles'

/** Página "TotalProgress" da galeria: em andamento, completo, esqueleto e a área de teste. */
export function TotalProgressSection(): ReactNode {
  return (
    <Section
      title="TotalProgress"
      description="Topo do painel: o total que falta, em inteiro arredondado para baixo, com barra e linha de meta. Completo, o número vira a meta, aparece o link ao guia e a barra some. Com 0h a tela usa StateScreen empty."
    >
      <S.Specimens>
        <Specimen label="doneHours=73 goalHours=120" isPlain>
          <S.Wrap>
            <TotalProgress doneHours={73} goalHours={120} />
          </S.Wrap>
        </Specimen>
        <Specimen label="doneHours=120 · done" isPlain>
          <S.Wrap>
            <TotalProgress doneHours={120} goalHours={120} guideHref="#" />
          </S.Wrap>
        </Specimen>
        <Specimen label="Skeleton" isPlain>
          <S.Wrap>
            <TotalProgressSkeleton />
          </S.Wrap>
        </Specimen>
      </S.Specimens>
      <Demo />
    </Section>
  )
}
