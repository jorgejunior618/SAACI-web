import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { activitiesQueries } from '@/services/activities'
import type { Activity } from '@/services/activities'
import { profileQueries } from '@/services/profile'
import type { Profile } from '@/services/profile'
import { progressQueries } from '@/services/progress'
import type { Progress } from '@/services/progress'
import { rulesQueries } from '@/services/rules'
import type { Course, RuleItem } from '@/services/rules'

import { Pedido } from './index'

vi.mock('next/navigation', () => ({ usePathname: () => '/atividades/pedido' }))
vi.mock('@supabase/client', () => ({ createClient: vi.fn() }))

const COURSE: Course = {
  id: 'curso-1',
  name: 'Engenharia de Computação',
  degree: 'Bacharelado',
  campus: 'Fortaleza',
  targetHours: 120,
}
const RULE_ITEMS: RuleItem[] = [
  [1, 'Programa de iniciação científica'],
  [6, 'Curso de línguas'],
  [7, 'Curso na área de engenharia de computação'],
  [12, 'Participação em eventos técnicos'],
].map(([itemNumber, name]) => ({
  itemNumber: Number(itemNumber),
  name: String(name),
  rule: '',
  ratio: { hours: 1, per: 1, unit: 'hora' },
  maxHours: 60,
}))

const COMPLETE_PROFILE: Profile = {
  name: 'Ana Beatriz Moura',
  enrollmentId: '2023104501',
  startSemester: '2023-07-01',
  courseId: 'curso-1',
}
const COMPLETE_PROGRESS: Progress = {
  totalHours: 120,
  targetHours: 120,
  missingHours: 0,
  itemsSum: 124,
  categories: [
    { itemNumber: 1, name: 'Iniciação', countedHours: 40, maxHours: 60, hoursOverLimit: 0 },
    { itemNumber: 7, name: 'Curso', countedHours: 60, maxHours: 60, hoursOverLimit: 4 },
    { itemNumber: 12, name: 'Eventos', countedHours: 20, maxHours: 24, hoursOverLimit: 0 },
  ],
}
const INCOMPLETE_PROGRESS: Progress = {
  totalHours: 59,
  targetHours: 120,
  missingHours: 61,
  itemsSum: 59,
  categories: [
    { itemNumber: 6, name: 'Línguas', countedHours: 15, maxHours: 60, hoursOverLimit: 0 },
    { itemNumber: 7, name: 'Curso', countedHours: 18, maxHours: 60, hoursOverLimit: 0 },
  ],
}
const ACTIVITY: Activity = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Curso de inglês',
  itemNumber: 6,
  quantity: 60,
  startDate: '2025-01-01',
  endDate: '2025-02-01',
  registeredAt: '2025-02-02T12:00:00.000Z',
  updatedAt: '2025-02-02T12:00:00.000Z',
  activityHours: 15,
  countedHours: 15,
  status: 'conta',
  reason: null,
  proof: { fileName: 'comprovante.pdf', sizeBytes: 1000, type: 'pdf' },
}

type Scenario = { profile: Profile; progress: Progress; activities: Activity[] }

// Nada aqui fala com o Supabase: tudo entra pelo cache.
function renderPedido({ profile, progress, activities }: Scenario): void {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  queryClient.setQueryData(profileQueries.detail().queryKey, profile)
  queryClient.setQueryData(progressQueries.summary().queryKey, progress)
  queryClient.setQueryData(activitiesQueries.list().queryKey, activities)
  queryClient.setQueryData(rulesQueries.course('curso-1').queryKey, COURSE)
  queryClient.setQueryData(rulesQueries.items('curso-1').queryKey, RULE_ITEMS)
  render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p>Carregando</p>}>
        <Pedido />
      </Suspense>
    </QueryClientProvider>,
  )
}

describe('Pedido', () => {
  it('mostra tudo pronto, as horas de cada item e o total do progresso', () => {
    renderPedido({
      profile: COMPLETE_PROFILE,
      progress: COMPLETE_PROGRESS,
      activities: [ACTIVITY],
    })

    expect(screen.getByRole('heading', { name: 'Tudo pronto' })).toBeInTheDocument()
    expect(screen.getByText('120h completas')).toBeInTheDocument()
    expect(screen.getByText('Matrícula 2023104501')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pré-visualizar e baixar' })).toBeInTheDocument()

    expect(screen.getByText('Programa de iniciação científica')).toBeInTheDocument()
    expect(screen.getByText('40,0h')).toBeInTheDocument()
    expect(screen.getByText('20,0h')).toBeInTheDocument()
    expect(screen.queryByText('Curso de línguas')).not.toBeInTheDocument()
    expect(screen.getByText('1 item sem horas fica com traço')).toBeInTheDocument()
    expect(screen.getByText('Total').nextElementSibling).toHaveTextContent('120h')
    expect(
      screen.getByText('Seus itens somam 124h. O que passa de 120h não entra no pedido.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Modelo da coordenação de Engenharia de Computação/),
    ).toBeInTheDocument()
  })

  it('lista o que falta, com um atalho para cada coisa', () => {
    renderPedido({
      profile: { ...COMPLETE_PROFILE, name: null, enrollmentId: null },
      progress: INCOMPLETE_PROGRESS,
      activities: [ACTIVITY],
    })

    expect(screen.getByRole('heading', { name: 'Faltam 3 coisas' })).toBeInTheDocument()
    expect(screen.getByText('Toque em cada uma para resolver.', { exact: false })).toBeVisible()
    expect(screen.getByRole('link', { name: /Faltam 61h para a meta de 120h/ })).toHaveAttribute(
      'href',
      '/registrar',
    )
    expect(screen.getByRole('link', { name: /Seu nome completo/ })).toHaveAttribute(
      'href',
      '/perfil',
    )
    expect(screen.getByRole('link', { name: /Informe uma vez no Perfil/ })).toHaveAttribute(
      'href',
      '/perfil',
    )
    expect(screen.getByRole('link', { name: /1 comprovante separado/ })).toHaveAttribute(
      'href',
      '/atividades',
    )
    expect(screen.getByRole('button', { name: 'Pré-visualizar como está' })).toBeInTheDocument()
    expect(
      screen.getByText('Dá para baixar antes de completar, se a coordenação aceitar.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Total').nextElementSibling).toHaveTextContent('59h')
  })

  it('usa o singular quando falta uma coisa só', () => {
    renderPedido({
      profile: { ...COMPLETE_PROFILE, enrollmentId: null },
      progress: COMPLETE_PROGRESS,
      activities: [ACTIVITY],
    })

    expect(screen.getByRole('heading', { name: 'Falta 1 coisa' })).toBeInTheDocument()
    expect(screen.getByText('Toque nela para resolver.', { exact: false })).toBeInTheDocument()
  })

  it('sem atividade, leva ao registro em vez de listar o que falta', () => {
    renderPedido({ profile: COMPLETE_PROFILE, progress: COMPLETE_PROGRESS, activities: [] })

    expect(screen.getByText('Seu formulário começa na primeira atividade')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Registrar a primeira atividade' })).toHaveAttribute(
      'href',
      '/registrar',
    )
    expect(screen.queryByText('Tudo pronto')).not.toBeInTheDocument()
  })
})
