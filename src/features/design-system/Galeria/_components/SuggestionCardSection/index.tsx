import type { ReactNode } from 'react'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import { Example } from './_components/Example'
import * as S from './styles'

/** Página "SuggestionCard" da galeria: a leitura em andamento e o item sugerido. */
export function SuggestionCardSection(): ReactNode {
  return (
    <Section
      title="SuggestionCard"
      description="O item que a leitura do certificado sugeriu, separado do campo. Só vale quando o aluno confirma: o campo de item nunca começa marcado. Sem cor própria. Sem sugestão, a tela pula o cartão e abre o ItemPicker."
    >
      <S.Specimens>
        <Specimen label='status="reading"' isPlain>
          <S.Wrap>
            <Example status="reading" />
          </S.Wrap>
        </Specimen>
        <Specimen label='status="suggested" · toque nas ações' isPlain>
          <S.Wrap>
            <Example status="suggested" />
          </S.Wrap>
        </Specimen>
      </S.Specimens>
    </Section>
  )
}
