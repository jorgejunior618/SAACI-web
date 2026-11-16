import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, TopBar } from '@design-system'

import * as S from './styles'

/**
 * Tela Aviso de privacidade: o que o SAACI guarda do aluno e por quanto tempo.
 *
 * @remarks
 * TODO: o texto do aviso é da coordenação e ainda não existe. A tela aparece com o marcador
 * `[TEXTO DO AVISO DE PRIVACIDADE]` até a equipe entregá-lo. Abre a partir do Perfil, então o Voltar
 * leva para lá.
 *
 * @example
 * ```tsx
 * <AvisoDePrivacidade />
 * ```
 */
export function AvisoDePrivacidade(): ReactNode {
  return (
    <AppFrame
      topBar={
        <TopBar variant="inner" title="Aviso de privacidade" backHref="/perfil" linkAs={NextLink} />
      }
    >
      <S.Page>
        <S.Title>Como cuidamos dos seus dados</S.Title>
        <S.Text>[TEXTO DO AVISO DE PRIVACIDADE]</S.Text>
      </S.Page>
    </AppFrame>
  )
}
