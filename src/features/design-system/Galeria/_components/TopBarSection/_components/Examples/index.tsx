'use client'

import type { ReactNode } from 'react'

import { TopBar } from '@design-system'

import { Specimen } from '../../../Specimen'
import * as S from '../../styles'

const LINES = Array.from({ length: 12 }, (_, index) => `Linha ${index + 1} do conteúdo da tela.`)

const noop = (): void => undefined

/**
 * Os exemplos da `TopBar`. Fica no cliente porque as barras recebem funções (`onBack`, `onSignOut`),
 * que a página, no servidor, não pode repassar.
 */
export function Examples(): ReactNode {
  return (
    <S.Specimens>
      <Specimen label='variant="home"'>
        <S.Frame>
          <TopBar variant="home" profileHref="#perfil" onSignOut={noop} />
        </S.Frame>
      </Specimen>
      <Specimen label='variant="inner" · com Voltar'>
        <S.Frame>
          <TopBar variant="inner" title="Registrar atividade" onBack={noop} />
        </S.Frame>
      </Specimen>
      <Specimen label='variant="inner" · sem Voltar (tela da barra inferior)'>
        <S.Frame>
          <TopBar variant="inner" title="Certificados" />
        </S.Frame>
      </Specimen>
      <Specimen label="título longo, corta com reticências">
        <S.Frame>
          <TopBar
            variant="inner"
            title="Certificado do curso de extensão em desenvolvimento de software"
            onBack={noop}
          />
        </S.Frame>
      </Specimen>
      <Specimen label="borda ao rolar (role a janela)">
        <S.Window>
          <S.Sticky>
            <TopBar variant="inner" title="Registrar atividade" onBack={noop} />
          </S.Sticky>
          {LINES.map((line) => (
            <S.Paragraph key={line}>{line}</S.Paragraph>
          ))}
        </S.Window>
      </Specimen>
    </S.Specimens>
  )
}
