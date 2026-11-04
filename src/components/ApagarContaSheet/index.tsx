'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { type ReactNode, useState } from 'react'

import { Button, ConfirmSheet, TextField, TextLink } from '@design-system'

import { ROUTES } from '@/constants/routes'
import { useMostrarSenha } from '@/hooks/useMostrarSenha'
import { SenhaNaoConfereError, apagarConta } from '@/services/conta'

type Props = {
  isOpen: boolean
  onClose: () => void
  email: string
  // Conta não confirmada sai sem senha: ela ainda não tem nada guardado.
  isConfirmada: boolean
  totalAtividades: number
  // "Baixar meus 9 comprovantes antes, 6,8 MB".
  downloadSlot?: ReactNode
}

export function ApagarContaSheet({
  isOpen,
  onClose,
  email,
  isConfirmada,
  totalAtividades,
  downloadSlot,
}: Props): ReactNode {
  const router = useRouter()
  const queryClient = useQueryClient()
  const senhaInput = useMostrarSenha()
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => apagarConta(isConfirmada ? senha : undefined),
    onSuccess: () => {
      // A navegação sai da área logada antes de o cache esvaziar.
      router.replace(`${ROUTES.contaApagada}?email=${encodeURIComponent(email)}`)
      queryClient.clear()
    },
    onError: (error) => {
      setErro(
        error instanceof SenhaNaoConfereError
          ? 'A senha não confere. Confira se o Caps Lock está ligado e tente de novo.'
          : 'Não deu para apagar agora. Confira sua internet e tente de novo.',
      )
    },
  })

  const plural = totalAtividades === 1 ? 'a atividade' : `as ${totalAtividades} atividades`
  const comprovantes =
    totalAtividades === 1 ? 'o comprovante' : `os ${totalAtividades} comprovantes`

  return (
    <ConfirmSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Apagar sua conta?"
      actions={
        <>
          <Button
            variant="danger"
            isBlock
            isLoading={mutation.isPending}
            disabled={isConfirmada && senha.length === 0}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? 'Apagando' : 'Apagar minha conta'}
          </Button>
          <Button variant="secondary" isBlock onClick={onClose}>
            Manter minha conta
          </Button>
        </>
      }
    >
      <p>
        {totalAtividades > 0
          ? `Somem a conta, ${plural} e ${comprovantes}. Não dá para desfazer, e as horas não voltam.`
          : 'Some a conta e o que estiver nela. Não dá para desfazer.'}
      </p>
      {downloadSlot}
      {isConfirmada && (
        <TextField
          label="Digite sua senha para confirmar"
          labelAside={<TextLink href={ROUTES.recuperarSenha}>Esqueci</TextLink>}
          autoComplete="current-password"
          value={senha}
          onChange={(event) => {
            setSenha(event.target.value)
            setErro(null)
          }}
          error={erro ?? undefined}
          {...senhaInput}
        />
      )}
      {!isConfirmada && erro && <p role="alert">{erro}</p>}
    </ConfirmSheet>
  )
}
