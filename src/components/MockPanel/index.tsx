'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'

import { ROUTES } from '@/constants/routes'
import { apagarTudo, definirFalhaNoDownload, medirUsoDoStorage, onMudanca } from '@/services/_mock'
import { confirmarEmail } from '@/services/conta'
import { formatTamanho } from '@/utils/formatTamanho'

import * as S from './styles'

// Só em desenvolvimento: o que o mock não consegue fazer pela tela (o clique no link do e-mail) e
// atalhos para conferir estados de erro.
export function MockPanel(): ReactNode {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const [uso, setUso] = useState(0)

  useEffect(() => onMudanca(() => queryClient.resetQueries()), [queryClient])

  const executar = async (acao: () => void | Promise<void>, texto: string): Promise<void> => {
    try {
      await acao()
      await queryClient.resetQueries()
      setAviso(texto)
    } catch (error) {
      setAviso(error instanceof Error ? error.message : 'Não deu certo.')
    }
    setUso(medirUsoDoStorage())
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        className={S.trigger}
        onClick={() => {
          setUso(medirUsoDoStorage())
          setIsOpen(true)
        }}
      >
        Mock
      </button>
    )
  }

  return (
    <S.Panel role="dialog" aria-label="Ferramentas do mock">
      <S.Title>Ferramentas do mock (só em dev)</S.Title>
      <S.Hint>
        Os dados nascem do que você cria no app e ficam no localStorage deste navegador. Em uso
        agora: {formatTamanho(uso)} de cerca de 5 MB.
      </S.Hint>
      <button
        type="button"
        className={S.option}
        onClick={() => executar(confirmarEmail, 'E-mail confirmado. Agora escolha o curso.')}
      >
        Simular clique no link de confirmação
      </button>
      <button
        type="button"
        className={S.option}
        onClick={() =>
          executar(() => definirFalhaNoDownload(true), 'O próximo download vai falhar.')
        }
      >
        Fazer o próximo download falhar
      </button>
      <button
        type="button"
        className={S.option}
        onClick={() => router.push(`${ROUTES.redefinirSenha}?link=expirado`)}
      >
        Abrir um link de senha vencido
      </button>
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
      <S.Hint>
        Na leitura do comprovante, &quot;palestra&quot;, &quot;evento&quot; ou &quot;ingles&quot; no
        nome do arquivo mudam o item sugerido, e &quot;ilegivel&quot; simula leitura falha.
      </S.Hint>
      {aviso && <S.Hint role="status">{aviso}</S.Hint>}
      <button type="button" className={S.option} onClick={() => setIsOpen(false)}>
        Fechar
      </button>
    </S.Panel>
  )
}
