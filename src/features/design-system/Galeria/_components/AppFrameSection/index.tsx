import type { ReactNode } from 'react'

import { AppFrame } from '@design-system'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import * as S from './styles'

const LINES = Array.from({ length: 24 }, (_, index) => `Linha ${index + 1} do conteúdo da tela.`)

function Lines(): ReactNode {
  return LINES.map((line) => <S.Paragraph key={line}>{line}</S.Paragraph>)
}

/** Página "AppFrame" da galeria: a moldura sem barras, só com a de topo e com as duas. */
export function AppFrameSection(): ReactNode {
  return (
    <Section
      title="AppFrame"
      description="Moldura de toda tela: coluna de até 480px, centralizada, no creme do fundo. Em tela larga é a mesma coluna. As barras ficam coladas ao rolar e respeitam a área segura do aparelho."
    >
      <S.Specimens>
        <Specimen label="sem barras">
          <S.Window>
            <AppFrame>
              <Lines />
            </AppFrame>
          </S.Window>
        </Specimen>
        <Specimen label="topBar">
          <S.Window>
            <AppFrame topBar={<S.Bar side="top">TopBar</S.Bar>}>
              <Lines />
            </AppFrame>
          </S.Window>
        </Specimen>
        <Specimen label="topBar e bottomNav">
          <S.Window>
            <AppFrame
              topBar={<S.Bar side="top">TopBar</S.Bar>}
              bottomNav={<S.Bar side="bottom">BottomNav</S.Bar>}
            >
              <Lines />
            </AppFrame>
          </S.Window>
        </Specimen>
      </S.Specimens>
    </Section>
  )
}
