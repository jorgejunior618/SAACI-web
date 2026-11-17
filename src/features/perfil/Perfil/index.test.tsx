import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Suspense } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { accountQueries } from '@/services/account'
import { activitiesKeys } from '@/services/activities'
import { getProfile, profileQueries, updateProfile } from '@/services/profile'
import { progressKeys } from '@/services/progress'
import { rulesQueries } from '@/services/rules'
import type { Course } from '@/services/rules'
import { formatHours } from '@/utils/format-hours'

import { Perfil } from './index'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/perfil',
}))
// O perfil mora no Supabase. Aqui ele é um objeto em memória, lido por `getProfile` e gravado por
// `updateProfile`, para a tela ver a escrita voltar na leitura.
const profileDb = vi.hoisted(() => ({
  profile: {
    name: 'Ana Beatriz Moura',
    enrollmentId: '2023104501' as string | null,
    startSemester: '2023-07-01' as string | null,
    courseId: 'curso-1' as string | null,
  },
}))

// Nada aqui fala com o Supabase: sessão e curso entram pelo cache, e o perfil vem do objeto acima.
vi.mock('@supabase/client', () => ({ createClient: vi.fn() }))
vi.mock('@/services/profile/profile.api', () => ({
  getProfile: () => Promise.resolve(structuredClone(profileDb.profile)),
}))
vi.mock('@/services/profile', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/profile')>()

  return {
    ...actual,
    updateProfile: vi.fn((changes: Partial<typeof profileDb.profile>) => {
      profileDb.profile = { ...profileDb.profile, ...changes }
      return Promise.resolve(structuredClone(profileDb.profile))
    }),
  }
})

const SESSION = { email: 'ana.moura07@aluno.ifce.edu.br', emailConfirmed: true }
const COURSE: Course = {
  id: 'curso-1',
  name: 'Engenharia de Computação',
  degree: 'Bacharelado',
  campus: 'Fortaleza',
  targetHours: 120,
}

function renderPerfil(): QueryClient {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  queryClient.setQueryData(accountQueries.session().queryKey, SESSION)
  queryClient.setQueryData(rulesQueries.course(COURSE.id).queryKey, COURSE)
  render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p>Carregando</p>}>
        <Perfil />
      </Suspense>
    </QueryClientProvider>,
  )
  return queryClient
}

async function openRow(user: ReturnType<typeof userEvent.setup>, label: RegExp): Promise<void> {
  await user.click(await screen.findByRole('button', { name: label }))
}

describe('Perfil', () => {
  beforeEach(() => {
    profileDb.profile = {
      name: 'Ana Beatriz Moura',
      enrollmentId: '2023104501',
      startSemester: '2023-07-01',
      courseId: COURSE.id,
    }
    vi.mocked(updateProfile).mockClear()
  })

  it('mostra quem é o aluno, os dados, o semestre como ele digita e o curso com a meta', async () => {
    renderPerfil()

    expect(await screen.findByText('Ana Beatriz Moura')).toBeInTheDocument()
    expect(screen.getAllByText(SESSION.email)).not.toHaveLength(0)
    expect(screen.getByText('2023104501')).toBeInTheDocument()
    expect(screen.getByText('2023.2')).toBeInTheDocument()
    expect(screen.getByText(COURSE.name)).toBeInTheDocument()
    expect(
      screen.getByText(`${COURSE.degree} · meta de ${formatHours(120, { fractionDigits: 0 })}`),
    ).toBeInTheDocument()
  })

  it('sem curso escolhido, diz o que falta e leva a Seu curso em vez de quebrar', async () => {
    // Estado de partida sem curso: a tela é montada com o perfil já no cache.
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    queryClient.setQueryData(accountQueries.session().queryKey, SESSION)
    queryClient.setQueryData(profileQueries.detail().queryKey, {
      name: 'Ana Beatriz Moura',
      enrollmentId: null,
      startSemester: null,
      courseId: null,
    })
    render(
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<p>Carregando</p>}>
          <Perfil />
        </Suspense>
      </QueryClientProvider>,
    )

    expect(await screen.findByText('Falta escolher o seu curso')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Escolher meu curso' })).toHaveAttribute(
      'href',
      '/seu-curso',
    )
    expect(screen.queryByText('Seus dados')).not.toBeInTheDocument()
  })

  it('leva a Trocar curso, ao aviso de privacidade e a Excluir conta', async () => {
    renderPerfil()

    expect(await screen.findByRole('link', { name: /Trocar/ })).toHaveAttribute(
      'href',
      '/perfil/curso',
    )
    expect(screen.getByRole('link', { name: /Aviso de privacidade/ })).toHaveAttribute(
      'href',
      '/privacidade',
    )
    expect(screen.getByRole('link', { name: 'Apagar minha conta' })).toHaveAttribute(
      'href',
      '/excluir-conta',
    )
  })

  it('salva a matrícula nova, mostra o valor e avisa que ela já entra no formulário', async () => {
    const user = userEvent.setup()

    renderPerfil()
    await openRow(user, /^Matrícula/)
    await user.clear(screen.getByRole('textbox', { name: /Matrícula/ }))
    await user.type(screen.getByRole('textbox', { name: /Matrícula/ }), '2023999999')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(
      await screen.findByText('Matrícula salva. Ela já entra no seu formulário.'),
    ).toBeInTheDocument()
    expect(await screen.findByText('2023999999')).toBeInTheDocument()
    expect(await getProfile()).toMatchObject({ enrollmentId: '2023999999' })
  })

  it('apaga a matrícula quando o campo fica em branco', async () => {
    const user = userEvent.setup()

    renderPerfil()
    await openRow(user, /^Matrícula/)
    await user.clear(screen.getByRole('textbox', { name: /Matrícula/ }))
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Não informada')).toBeInTheDocument()
    expect(screen.getByText('Matrícula removida. O formulário vai sem ela.')).toBeInTheDocument()
    expect(screen.queryByText(/Ela já entra no seu formulário/)).not.toBeInTheDocument()
    expect(await getProfile()).toMatchObject({ enrollmentId: null })
  })

  it('cancela sem salvar e volta ao valor de antes', async () => {
    const user = userEvent.setup()

    renderPerfil()
    await openRow(user, /^Matrícula/)
    await user.type(screen.getByRole('textbox', { name: /Matrícula/ }), '9')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(await screen.findByText('2023104501')).toBeInTheDocument()
    expect(updateProfile).not.toHaveBeenCalled()
  })

  it('avisa antes de salvar que mudar o semestre muda o total de horas (RF11)', async () => {
    const user = userEvent.setup()

    renderPerfil()
    await openRow(user, /^Semestre de início/)

    expect(
      screen.getByText(/Mudar o semestre muda quais atividades contam e o seu total de horas/),
    ).toBeInTheDocument()
    expect(updateProfile).not.toHaveBeenCalled()
  })

  it('salva o semestre como data do perfil e derruba o progresso e as atividades', async () => {
    const user = userEvent.setup()
    const queryClient = renderPerfil()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await openRow(user, /^Semestre de início/)
    await user.clear(screen.getByRole('textbox', { name: /Semestre de início/ }))
    await user.type(screen.getByRole('textbox', { name: /Semestre de início/ }), '2024.1')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(
      await screen.findByText('Semestre salvo. Suas horas foram recalculadas.'),
    ).toBeInTheDocument()
    expect(await getProfile()).toMatchObject({ startSemester: '2024-01-01' })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: progressKeys.all })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: activitiesKeys.all })
  })

  it('recusa um semestre fora do formato e diz como digitar, sem salvar', async () => {
    const user = userEvent.setup()

    renderPerfil()
    await openRow(user, /^Semestre de início/)
    await user.clear(screen.getByRole('textbox', { name: /Semestre de início/ }))
    await user.type(screen.getByRole('textbox', { name: /Semestre de início/ }), 'abc')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(
      await screen.findByText('Use o ano, um ponto e o número 1 ou 2, como 2023.2.'),
    ).toBeInTheDocument()
    expect(updateProfile).not.toHaveBeenCalled()
  })

  it('mantém o que a pessoa digitou quando salvar falha (RNF24)', async () => {
    const user = userEvent.setup()

    vi.mocked(updateProfile).mockRejectedValueOnce(new Error('sem rede'))
    renderPerfil()
    await openRow(user, /^Matrícula/)
    await user.clear(screen.getByRole('textbox', { name: /Matrícula/ }))
    await user.type(screen.getByRole('textbox', { name: /Matrícula/ }), '2023555555')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText(/Não conseguimos salvar agora/)).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Matrícula/ })).toHaveValue('2023555555')
    expect(screen.queryByText(/Matrícula salva/)).not.toBeInTheDocument()
  })
})
