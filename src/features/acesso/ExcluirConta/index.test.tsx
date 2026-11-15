import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Suspense } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { clearSessionCache, deleteAccount, InvalidCredentialsError } from '@/services/account'
import { profileQueries } from '@/services/profile'
import type { Profile } from '@/services/profile'

import { ExcluirConta } from './index'

const replace = vi.fn()

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }))
vi.mock('@supabase/client', () => ({ createClient: vi.fn() }))
vi.mock('@/services/account', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/account')>()

  return { ...actual, deleteAccount: vi.fn(), clearSessionCache: vi.fn() }
})

const WITH_COURSE: Profile = {
  name: 'Ana Beatriz Moura',
  enrollmentId: null,
  startSemester: '2023-07-01',
  courseId: 'curso-1',
}
const WITHOUT_COURSE: Profile = { ...WITH_COURSE, startSemester: null, courseId: null }

function renderExcluirConta(profile: Profile): void {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  queryClient.setQueryData(profileQueries.detail().queryKey, profile)
  render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p>Carregando</p>}>
        <ExcluirConta />
      </Suspense>
    </QueryClientProvider>,
  )
}

describe('ExcluirConta', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('volta ao Perfil, no Voltar e em "Manter minha conta", quando o aluno já tem curso', async () => {
    renderExcluirConta(WITH_COURSE)

    expect(await screen.findByRole('link', { name: 'Voltar' })).toHaveAttribute('href', '/perfil')
    expect(screen.getByRole('link', { name: 'Manter minha conta' })).toHaveAttribute(
      'href',
      '/perfil',
    )
  })

  it('volta a Seu curso quando o aluno ainda não escolheu o curso', async () => {
    renderExcluirConta(WITHOUT_COURSE)

    expect(await screen.findByRole('link', { name: 'Voltar' })).toHaveAttribute(
      'href',
      '/seu-curso',
    )
    expect(screen.getByRole('link', { name: 'Manter minha conta' })).toHaveAttribute(
      'href',
      '/seu-curso',
    )
  })

  it('avisa que os comprovantes devem ser baixados antes, com o marcador do download', async () => {
    renderExcluirConta(WITH_COURSE)

    expect(await screen.findByText(/\[DOWNLOAD DOS COMPROVANTES\]/)).toBeInTheDocument()
  })

  it('apaga com a senha, esvazia o cache e leva a Conta apagada', async () => {
    const user = userEvent.setup()

    vi.mocked(deleteAccount).mockResolvedValueOnce(undefined)
    renderExcluirConta(WITH_COURSE)
    await user.type(await screen.findByLabelText('Confirme com sua senha'), 'senha-certa')
    await user.click(screen.getByRole('button', { name: 'Excluir minha conta' }))

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/conta-apagada'))
    expect(deleteAccount).toHaveBeenCalledWith('senha-certa')
    expect(clearSessionCache).toHaveBeenCalledTimes(1)
  })

  it('mostra a senha errada no campo e não sai da tela nem limpa o cache', async () => {
    const user = userEvent.setup()

    vi.mocked(deleteAccount).mockRejectedValueOnce(new InvalidCredentialsError())
    renderExcluirConta(WITH_COURSE)
    await user.type(await screen.findByLabelText('Confirme com sua senha'), 'senha-errada')
    await user.click(screen.getByRole('button', { name: 'Excluir minha conta' }))

    expect(
      await screen.findByText('A senha não confere. Confira o Caps Lock e tente de novo.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Confirme com sua senha')).toHaveValue('senha-errada')
    expect(replace).not.toHaveBeenCalled()
    expect(clearSessionCache).not.toHaveBeenCalled()
  })

  it('pede a senha quando o campo está vazio, sem tentar apagar', async () => {
    const user = userEvent.setup()

    renderExcluirConta(WITH_COURSE)
    await user.click(await screen.findByRole('button', { name: 'Excluir minha conta' }))

    expect(await screen.findByText('Digite sua senha para confirmar.')).toBeInTheDocument()
    expect(deleteAccount).not.toHaveBeenCalled()
  })

  it('diz que a conta continua como estava quando a falha não é de senha', async () => {
    const user = userEvent.setup()

    vi.mocked(deleteAccount).mockRejectedValueOnce(new Error('sem rede'))
    renderExcluirConta(WITH_COURSE)
    await user.type(await screen.findByLabelText('Confirme com sua senha'), 'senha-certa')
    await user.click(screen.getByRole('button', { name: 'Excluir minha conta' }))

    expect(await screen.findByText(/Sua conta continua como estava/)).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })
})
