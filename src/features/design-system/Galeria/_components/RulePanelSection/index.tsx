import type { ReactNode } from 'react'

import { RulePanel } from '@design-system'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import * as S from './styles'

const RULE = 'Cada palestra conta 2h, não importa quantas horas ela durou.'

/** Página "RulePanel" da galeria: normal, com aviso e item cheio. */
export function RulePanelSection(): ReactNode {
  return (
    <Section
      title="RulePanel"
      description="A regra do item, quanto ainda cabe e quanto a atividade vai contar, visíveis antes do envio. Cartão neutro, sem fundo verde: a ênfase está só no título. A tabela anuncia o resultado enquanto o aluno digita, e o aviso não bloqueia."
    >
      <S.Specimens>
        <Specimen label="normal" isPlain>
          <S.Wrap>
            <RulePanel
              itemNumber={13}
              itemName="Palestra como ouvinte"
              rule={RULE}
              usedHours={20}
              maxHours={30}
              calcRows={[{ label: '3 palestras × 2h', value: 6 }]}
              willCount={6}
            />
          </S.Wrap>
        </Specimen>
        <Specimen label="warning" isPlain>
          <S.Wrap>
            <RulePanel
              itemNumber={13}
              itemName="Palestra como ouvinte"
              rule={RULE}
              usedHours={26}
              maxHours={30}
              calcRows={[
                { label: '3 palestras × 2h', value: 6 },
                { label: 'Cabem neste item', value: 4 },
              ]}
              willCount={4}
              warning="Essa atividade vale 6,0h, mas só cabem mais 4,0h neste item."
            />
          </S.Wrap>
        </Specimen>
        <Specimen label="usedHours=maxHours · item cheio" isPlain>
          <S.Wrap>
            <RulePanel
              itemNumber={13}
              itemName="Palestra como ouvinte"
              rule={RULE}
              usedHours={30}
              maxHours={30}
              calcRows={[
                { label: '2 palestras × 2h', value: 4 },
                { label: 'Cabem neste item', value: 0 },
              ]}
              willCount={0}
              warning="Esse item já chegou a 30,0h. Você pode registrar, mas a atividade não vai contar."
            />
          </S.Wrap>
        </Specimen>
      </S.Specimens>
    </Section>
  )
}
