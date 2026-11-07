import type { ReactNode } from 'react'

import { CategoryCard, CategoryCardSkeleton } from '@design-system'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import { Demo } from './_components/Demo'
import * as S from './styles'

/** Página "CategoryCard" da galeria: com espaço, completo, esqueleto e a área de teste. */
export function CategoryCardSection(): ReactNode {
  return (
    <Section
      title="CategoryCard"
      description="Um cartão por item com horas: o que conta, o máximo e quanto ainda cabe. O cartão inteiro é link. Completo, número e rodapé ficam em brand.text, sem check e sem badge."
    >
      <S.Specimens>
        <Specimen label="countedHours=18 maxHours=60" isPlain>
          <S.Wrap>
            <CategoryCard
              itemNumber={7}
              name="Curso na área de engenharia de computação"
              countedHours={18}
              maxHours={60}
              href="#"
            />
          </S.Wrap>
        </Specimen>
        <Specimen label="countedHours=30 maxHours=30 · full" isPlain>
          <S.Wrap>
            <CategoryCard
              itemNumber={13}
              name="Participação como ouvinte em palestras relacionadas com a área do curso"
              countedHours={30}
              maxHours={30}
              overflowHours={4}
              href="#"
            />
          </S.Wrap>
        </Specimen>
        <Specimen label="Skeleton" isPlain>
          <S.Wrap>
            <CategoryCardSkeleton />
          </S.Wrap>
        </Specimen>
      </S.Specimens>
      <Demo />
    </Section>
  )
}
