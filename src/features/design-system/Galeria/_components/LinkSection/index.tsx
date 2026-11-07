import type { ReactNode } from 'react'

import { Link } from '@design-system'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import { Demo } from './_components/Demo'
import * as S from './styles'

/** Página "Link" da galeria: dentro de frase, sozinho na linha e a área de teste. */
export function LinkSection(): ReactNode {
  return (
    <Section
      title="Link"
      description="Texto em brand.text com sublinhado. Renderiza um <a>; para navegar sem recarregar, a feature passa o Link do next/link na prop as."
    >
      <S.Specimens>
        <Specimen label="dentro de frase">
          <S.Paragraph>
            Não achou o certificado? <Link href="#exemplo">Veja como baixar</Link>.
          </S.Paragraph>
        </Specimen>
        <Specimen label="isStandalone · alvo de 48px">
          <Link href="#exemplo" isStandalone>
            Ver meu progresso
          </Link>
        </Specimen>
      </S.Specimens>
      <Demo />
    </Section>
  )
}
