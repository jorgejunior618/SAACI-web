'use client'

import { Camera, File } from 'lucide-react'
import { type ReactNode, useRef } from 'react'

import { Button, Icon, TextLink } from '@design-system'

import { ROUTES } from '@/constants/routes'

import * as S from './styles'

type Props = {
  onArquivo: (arquivo: File) => void
}

const TIPOS = 'application/pdf,image/jpeg,image/png'

// Caixa tracejada: foto pela câmera ou arquivo do celular.
export function Upload({ onArquivo }: Props): ReactNode {
  const camera = useRef<HTMLInputElement>(null)
  const arquivo = useRef<HTMLInputElement>(null)

  const receber = (input: HTMLInputElement): void => {
    const escolhido = input.files?.[0]
    input.value = ''
    if (escolhido) onArquivo(escolhido)
  }

  return (
    <S.Box>
      <Button size="xl" isBlock onClick={() => camera.current?.click()}>
        <Icon icon={Camera} size={24} />
        Tirar foto do comprovante
      </Button>
      <Button variant="secondary" isBlock onClick={() => arquivo.current?.click()}>
        <Icon icon={File} />
        Escolher arquivo
      </Button>
      <S.Privacy>
        Um serviço de IA lê o seu comprovante.{' '}
        <TextLink href={ROUTES.privacidade}>Saiba o que guardamos</TextLink>
      </S.Privacy>
      <input
        ref={camera}
        type="file"
        accept="image/*"
        capture="environment"
        className={S.hidden}
        tabIndex={-1}
        aria-hidden
        onChange={(event) => receber(event.currentTarget)}
      />
      <input
        ref={arquivo}
        type="file"
        accept={TIPOS}
        className={S.hidden}
        tabIndex={-1}
        aria-hidden
        onChange={(event) => receber(event.currentTarget)}
      />
    </S.Box>
  )
}
