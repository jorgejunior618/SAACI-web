import type { ReactNode } from 'react'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import { Example } from './_components/Example'
import { items } from './items'
import * as S from './styles'

/** Página "ItemPicker" da galeria: lista, busca, item escolhido e busca sem resultado. */
export function ItemPickerSection(): ReactNode {
  return (
    <Section
      title="ItemPicker"
      description="Campo de busca que abre uma lista flutuante com os itens do formulário do curso, na ordem do formulário, com busca por palavra no nome e na regra. A lista fica sobre o conteúdo e não empurra o que vem depois. Nenhum item vem marcado e não existe 'Não sei'. O número fica sempre visível, sem cor. Toque no campo, ou use as setas, Enter e Esc."
    >
      <S.Specimens>
        <Specimen label="fechado · toque para abrir" isPlain>
          <S.Wrap>
            <Example items={items} />
          </S.Wrap>
        </Specimen>
        <Specimen label="value=7 · item escolhido (fechado)" isPlain>
          <S.Wrap>
            <Example items={items} initialValue={7} />
          </S.Wrap>
        </Specimen>
        <Specimen label="query='hackathon' · toque para ver a frase" isPlain>
          <S.Wrap>
            <Example items={items} initialQuery="hackathon" />
          </S.Wrap>
        </Specimen>
      </S.Specimens>
    </Section>
  )
}
