// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Suspense } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { activitiesQueries } from '@/services/activities'
import type { Activity } from '@/services/activities'
import { CourseLockedError, profileQueries, updateProfile } from '@/services/profile'
import type { Profile } from '@/services/profile'
import { rulesQueries } from '@/services/rules'
import type { Course } from '@/services/rules'

import { TrocarCurso } from './index'

const replace = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => '/perfil/curso',
  useRouter: () => ({ replace }),
}))
vi.mock('@supabase/client', () => ({ createClient: vi.fn() }))
vi.mock('@/services/profile', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/profile')>()

  return { ...actual, updateProfile: vi.fn() }
})

const COURSE: Course = {
  id: 'curso-1',
  name: 'Engenharia de Computação',
  degree: 'Bacharelado',
  campus: 'Fortaleza',
  targetHours: 120,
  checkedAt: null,
}
const OTHER_COURSE: Course = {
  id: 'curso-2',
  name: 'Ciência da Computação',
  degree: 'Bacharelado',
  campus: 'Fortaleza',
  targetHours: 100,
  checkedAt: null,
}
const PROFILE: Profile = {
  name: 'Ana Beatriz Moura',
  enrollmentId: '2023104501',
  startSemester: '2023-07-01',
  courseId: COURSE.id,
}

function fakeActivity(index: number): Activity {
  return {
    id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
    name: `Atividade ${index}`,
    itemNumber: 1,
    quantity: 10,
    startDate: '2025-01-10',
    endDate: '2025-01-20',
    registeredAt: '2025-01-21T10:00:00.000Z',
    updatedAt: '2025-01-21T10:00:00.000Z',
    activityHours: 10,
    countedHours: 10,
    status: 'conta',
    reason: null,
    proof: { fileName: 'certificado.pdf', sizeBytes: 1000, type: 'pdf' },
  }
}

// Nada aqui fala com o Supabase: perfil, curso e atividades entram pelo cache.
function renderTrocarCurso(totalActivities: number): void {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  queryClient.setQueryData(profileQueries.detail().queryKey, PROFILE)
  queryClient.setQueryData(rulesQueries.course(COURSE.id).queryKey, COURSE)
  queryClient.setQueryData(rulesQueries.courses().queryKey, [COURSE, OTHER_COURSE])
  queryClient.setQueryData(rulesQueries.courses('').queryKey, [COURSE, OTHER_COURSE])
  queryClient.setQueryData(rulesQueries.items(OTHER_COURSE.id).queryKey, [])
  queryClient.setQueryData(
    activitiesQueries.list().queryKey,
    Array.from({ length: totalActivities }, (_, index) => fakeActivity(index + 1)),
  )
  render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p>Carregando</p>}>
        <TrocarCurso />
      </Suspense>
    </QueryClientProvider>,
  )
}

describe('TrocarCurso', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('com atividades, mostra o curso travado e quantas atividades prendem a troca', async () => {
    renderTrocarCurso(9)

    expect(await screen.findByText(COURSE.name)).toBeInTheDocument()
    expect(screen.getByText('Seu curso')).toBeInTheDocument()
    expect(screen.getByText('Com atividades lançadas, o curso fica travado')).toBeInTheDocument()
    expect(screen.getByText(/Você tem 9 atividades registradas/)).toBeInTheDocument()
    expect(screen.getByText(/remova as 9 em Atividades/)).toBeInTheDocument()
  })

  it('usa o singular quando há uma atividade só', async () => {
    renderTrocarCurso(1)

    expect(await screen.findByText(/Você tem 1 atividade registrada,/)).toBeInTheDocument()
    expect(screen.getByText(/remova a atividade em Atividades/)).toBeInTheDocument()
  })

  it('oferece apagar a conta como o segundo caminho', async () => {
    renderTrocarCurso(9)

    expect(
      await screen.findByRole('link', { name: /Apagar a conta e começar de novo/ }),
    ).toHaveAttribute('href', '/excluir-conta')
  })

  it('pede confirmação antes de levar a Atividades e não navega sozinho', async () => {
    const user = userEvent.setup()

    renderTrocarCurso(9)
    await user.click(await screen.findByRole('button', { name: /^Remover as atividades/ }))

    const sheet = screen.getByRole('dialog', { name: 'Ir remover as atividades?' })

    expect(sheet).toHaveTextContent('não voltam')
    expect(screen.getByRole('link', { name: 'Ir para Atividades' })).toHaveAttribute(
      'href',
      '/atividades',
    )
  })

  it('fecha a confirmação em "Manter meu curso"', async () => {
    const user = userEvent.setup()

    renderTrocarCurso(9)
    await user.click(await screen.findByRole('button', { name: /^Remover as atividades/ }))
    await user.click(screen.getByRole('button', { name: 'Manter meu curso' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('sem atividades, mostra a busca de curso e não a trava', async () => {
    renderTrocarCurso(0)

    expect(await screen.findByText('Qual é o seu curso?')).toBeInTheDocument()
    expect(
      screen.queryByText('Com atividades lançadas, o curso fica travado'),
    ).not.toBeInTheDocument()
  })

  it('sem atividades, troca o curso com o semestre já preenchido e volta ao Perfil', async () => {
    const user = userEvent.setup()

    vi.mocked(updateProfile).mockResolvedValueOnce({ ...PROFILE, courseId: OTHER_COURSE.id })
    renderTrocarCurso(0)
    await user.click(await screen.findByText(OTHER_COURSE.name))

    expect(await screen.findByLabelText(/Em que semestre/)).toHaveValue('2023.2')
    await user.click(screen.getByRole('button', { name: 'Trocar curso' }))

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/perfil'))
    expect(updateProfile).toHaveBeenCalledWith({
      courseId: OTHER_COURSE.id,
      startSemester: '2023-07-01',
    })
  })

  it('avisa que o curso travou quando o banco recusa a troca e não sai da tela', async () => {
    const user = userEvent.setup()

    vi.mocked(updateProfile).mockRejectedValueOnce(new CourseLockedError())
    renderTrocarCurso(0)
    await user.click(await screen.findByText(OTHER_COURSE.name))
    await user.click(await screen.findByRole('button', { name: 'Trocar curso' }))

    expect(await screen.findByText(/o curso não pode mudar/)).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })
})
