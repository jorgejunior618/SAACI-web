import type { ReactNode } from 'react'

import { Disclosure } from '@design-system'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import * as S from './styles'

/** Página "Disclosure" da galeria: aberta, fechada e com rótulo e texto à direita. */
export function DisclosureSection(): ReactNode {
  return (
    <Section
      title="Disclosure"
      description="Seção de consulta feita com details e summary: funciona sem JavaScript. A seta gira ao abrir. Um nível só, e nunca para esconder passo obrigatório. No painel vazio, vem aberta."
    >
      <S.Specimens>
        <Specimen label="defaultOpen" isPlain>
          <S.Wrap>
            <Disclosure title="Outras atividades que contam" count={3} defaultOpen>
              <Disclosure.Row
                itemNumber={1}
                name="Programa de iniciação científica ou tecnológica"
                rule="40h a cada período letivo, até 80h"
              />
              <Disclosure.Row
                itemNumber={3}
                name="Programa de monitoria"
                rule="40h por disciplina como monitor, até 80h"
              />
              <Disclosure.Row
                itemNumber={12}
                name="Participação em eventos na área do curso"
                rule="4h por dia de evento, até 40h"
              />
            </Disclosure>
          </S.Wrap>
        </Specimen>
        <Specimen label="eyebrow e aside (por item)" isPlain>
          <S.Wrap>
            <Disclosure eyebrow="Item 7" title="Curso na área de engenharia" aside="18,0h de 60h">
              <Disclosure.Row itemNumber={7} name="Curso de Git e GitHub" />
            </Disclosure>
          </S.Wrap>
        </Specimen>
        <Specimen label="fechada (padrão)" isPlain>
          <S.Wrap>
            <Disclosure title="Outras atividades que contam" count={3}>
              <Disclosure.Row
                itemNumber={1}
                name="Programa de iniciação científica ou tecnológica"
              />
            </Disclosure>
          </S.Wrap>
        </Specimen>
      </S.Specimens>
    </Section>
  )
}
