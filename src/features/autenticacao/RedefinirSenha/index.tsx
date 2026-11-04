'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link2Off } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { type ReactNode, useSyncExternalStore } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import {
  Button,
  ButtonLink,
  LogoCompleto,
  Notice,
  PageHeader,
  PasswordRules,
  Screen,
  StateScreen,
  TextField,
} from '@design-system'

import { ROUTES } from '@/constants/routes'
import { useMostrarSenha } from '@/hooks/useMostrarSenha'
import { getEmailDoLink, salvarNovaSenha } from '@/services/conta'
import { avaliarSenha } from '@/utils/validacoes'

import { Loading } from './Loading'
import { type RedefinirSenhaForm, RedefinirSenhaSchema } from './schema'
import * as S from './styles'

const noop = (): (() => void) => () => undefined

function LinkExpirado(): ReactNode {
  return (
    <Screen isCentered>
      <StateScreen
        icon={Link2Off}
        title="Este link não vale mais"
        headingLevel="h1"
        actions={
          <>
            <ButtonLink href={ROUTES.recuperarSenha} isBlock>
              Pedir um novo link
            </ButtonLink>
            <ButtonLink href={ROUTES.login} variant="secondary" isBlock>
              Voltar para Entrar
            </ButtonLink>
          </>
        }
      >
        <p>
          Ele venceu ou já foi trocado por um mais novo. Isso é normal. Peça outro, que chega em
          instantes.
        </p>
      </StateScreen>
    </Screen>
  )
}

export function RedefinirSenha(): ReactNode {
  const searchParams = useSearchParams()
  const isMounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
  // Tela aberta pelo link do e-mail, sem sessão: o e-mail vem do link, lido só no navegador.
  const link = useQuery({
    queryKey: ['link-nova-senha'],
    queryFn: getEmailDoLink,
    enabled: isMounted,
  })

  if (searchParams.get('link') === 'expirado') return <LinkExpirado />
  if (!link.isSuccess) return <Loading />
  if (!link.data) return <LinkExpirado />

  return <FormularioNovaSenha email={link.data} />
}

function FormularioNovaSenha({ email }: { email: string }): ReactNode {
  const router = useRouter()
  const queryClient = useQueryClient()
  const senhaInput = useMostrarSenha()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RedefinirSenhaForm>({
    resolver: valibotResolver(RedefinirSenhaSchema),
    defaultValues: { senha: '' },
  })
  const senha = useWatch({ control, name: 'senha' })

  const mutation = useMutation({
    mutationFn: ({ senha }: RedefinirSenhaForm) => salvarNovaSenha(senha),
    onSuccess: () => {
      queryClient.clear()
      router.replace(`${ROUTES.login}?senha=nova`)
    },
  })

  return (
    <Screen>
      <S.Header>
        <LogoCompleto width={144} />
        <PageHeader title="Escolha a senha nova" lead={`Para ${email}`} />
      </S.Header>

      {mutation.isError && (
        <Notice title="A senha não foi salva" tone="danger" role="alert">
          Confira sua internet e tente de novo. A senha antiga continua valendo até lá.
        </Notice>
      )}

      <S.Form noValidate onSubmit={handleSubmit((dados) => mutation.mutate(dados))}>
        <TextField
          label="Senha nova"
          hint={<PasswordRules password={senha} />}
          autoComplete="new-password"
          error={errors.senha?.message}
          {...senhaInput}
          {...register('senha')}
        />
        <Button
          type="submit"
          isBlock
          disabled={!avaliarSenha(senha).isValida}
          isLoading={mutation.isPending}
        >
          {mutation.isPending ? 'Salvando' : 'Salvar senha nova'}
        </Button>
        <S.Note>Ao salvar, você sai dos outros aparelhos onde estava conectado.</S.Note>
      </S.Form>
    </Screen>
  )
}
