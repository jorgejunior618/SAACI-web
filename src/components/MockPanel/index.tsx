'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'

import { ROUTES } from '@/constants/routes'
import { apagarTudo, onMudanca } from '@/services/_mock'

import * as S from './styles'

// Só em desenvolvimento: o que o mock não consegue fazer pela tela.
export function MockPanel(): ReactNode {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  useEffect(() => onMudanca(() => queryClient.resetQueries()), [queryClient])

  const executar = async (acao: () => void | Promise<void>, texto: string): Promise<void> => {
    try {
      await acao()
      await queryClient.resetQueries()
      setAviso(texto)
    } catch (error) {
      setAviso(error instanceof Error ? error.message : 'Não deu certo.')
    }
  }

  if (!isOpen) {
    return (
      <button type="button" className={S.trigger} onClick={() => setIsOpen(true)}>
        Mock
      </button>
    )
  }

  return (
    <S.Panel role="dialog" aria-label="Ferramentas do mock">
      <S.Title>Ferramentas do mock (só em dev)</S.Title>
      <S.Hint>Os dados ficam no localStorage deste navegador.</S.Hint>
      <button
        type="button"
        className={S.option}
        onClick={() =>
          executar(() => {
            apagarTudo()
            router.replace(ROUTES.login)
          }, 'Dados apagados. O app voltou ao começo.')
        }
      >
        Apagar todos os dados do mock
      </button>
      {aviso && <S.Hint role="status">{aviso}</S.Hint>}
      <button type="button" className={S.option} onClick={() => setIsOpen(false)}>
        Fechar
      </button>
    </S.Panel>
  )
}
