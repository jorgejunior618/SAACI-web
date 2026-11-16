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
      description="Topo do painel: o total que falta, em inteiro arredondado para baixo, com barra e linha de meta. O número tem 56px e a barra 6px. Completo, o número vira a meta, uma frase avisa o excedente, aparece o botão ao guia e a barra some. Com 0h o cartão aparece com a barra vazia. O compacto põe o número em 20px ao lado do rótulo, para telas que já têm outro número grande."
    >
      <S.Specimens>
        <Specimen label="doneHours=73 goalHours=120" isPlain>
          <S.Wrap>
            <TotalProgress doneHours={73} goalHours={120} />
          </S.Wrap>
        </Specimen>
        <Specimen label="doneHours=0 · vazio" isPlain>
          <S.Wrap>
            <TotalProgress doneHours={0} goalHours={120} />
          </S.Wrap>
        </Specimen>
        <Specimen label="doneHours=124 · done com excedente" isPlain>
          <S.Wrap>
            <TotalProgress doneHours={124} goalHours={120} guideHref="#" />
          </S.Wrap>
        </Specimen>
        <Specimen label="doneHours=120 · done" isPlain>
          <S.Wrap>
            <TotalProgress doneHours={120} goalHours={120} guideHref="#" />
          </S.Wrap>
        </Specimen>
        <Specimen label='size="compact" · doneHours=69' isPlain>
          <S.Wrap>
            <TotalProgress doneHours={69} goalHours={120} size="compact" />
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
