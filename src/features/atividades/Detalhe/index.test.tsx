import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Suspense } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { activitiesQueries, ActivityNotFoundError, removeActivity } from '@/services/activities'
import type { Activity } from '@/services/activities'
import { profileQueries } from '@/services/profile'
import type { Profile } from '@/services/profile'
import { progressQueries } from '@/services/progress'
import type { Progress } from '@/services/progress'
import { rulesQueries } from '@/services/rules'
import type { RuleItem } from '@/services/rules'

import { Detalhe } from './index'

const replace = vi.fn()
const NOT_FOUND = 'NEXT_NOT_FOUND'

vi.mock('next/navigation', () => ({
  usePathname: () => '/atividades/1',
  useRouter: () => ({ replace }),
  notFound: () => {
    throw new Error(NOT_FOUND)
  },
}))
vi.mock('@supabase/client', () => ({ createClient: vi.fn() }))
vi.mock('@/services/activities', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/activities')>()),
  removeActivity: vi.fn(),
}))

const ID = '00000000-0000-4000-8000-000000000001'
const PROFILE: Profile = {
  name: 'Ana Beatriz Moura',
  enrollmentId: '2023104501',
  startSemester: '2023-07-01',
  courseId: 'curso-1',
}
const RULE_ITEMS: RuleItem[] = [
  {
    itemNumber: 13,
    name: 'Palestra como ouvinte',
    rule: '2h por palestra, até 30h',
    ratio: { hours: 2, per: 1, unit: 'palestra' },
    maxHours: 30,
  },
]
const EARLIER: Activity = {
  id: '00000000-0000-4000-8000-000000000002',
  name: 'Ciclo de Palestras Tech IFCE',
  itemNumber: 13,
  quantity: 15,
  startDate: '2026-03-01',
  endDate: '2026-03-01',
  registeredAt: '2026-03-02T12:00:00.000Z',
  updatedAt: '2026-03-02T12:00:00.000Z',
  activityHours: 30,
  countedHours: 29,
  status: 'conta',
  reason: null,
  proof: { fileName: 'ciclo.pdf', sizeBytes: 1000, type: 'pdf' },
}
const PARTIAL: Activity = {
  id: ID,
  name: 'Palestra sobre segurança em redes',
  itemNumber: 13,
  quantity: 1,
  startDate: '2026-10-18',
  endDate: '2026-10-18',
  registeredAt: '2026-10-20T12:00:00.000Z',
  updatedAt: '2026-10-20T12:00:00.000Z',
  activityHours: 2,
  countedHours: 1,
  status: 'parcial',
  reason: null,
  proof: { fileName: 'declaracao-palestra.pdf', sizeBytes: 860 * 1024, type: 'pdf' },
}
const PROGRESS: Progress = {
  totalHours: 30,
  targetHours: 120,
  missingHours: 90,
  itemsSum: 30,
  categories: [
    {
      itemNumber: 13,
      name: 'Palestra como ouvinte',
      countedHours: 30,
      maxHours: 30,
      hoursOverLimit: 1,
    },
  ],
}

// Nada aqui fala com o Supabase: detalhe, lista, progresso, perfil e regras entram pelo cache.
function renderDetalhe(activity: Activity | null): QueryClient {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  queryClient.setQueryData(activitiesQueries.detail(ID).queryKey, activity)
  queryClient.setQueryData(
    activitiesQueries.list().queryKey,
    activity ? [EARLIER, activity] : [EARLIER],
  )
  queryClient.setQueryData(progressQueries.summary().queryKey, PROGRESS)
  queryClient.setQueryData(profileQueries.detail().queryKey, PROFILE)
  queryClient.setQueryData(rulesQueries.items('curso-1').queryKey, RULE_ITEMS)
  render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p>Carregando</p>}>
        <Detalhe id={ID} />
      </Suspense>
    </QueryClientProvider>,
  )
  return queryClient
}

async function confirmRemoval(): Promise<void> {
  await userEvent.click(screen.getByRole('button', { name: 'Remover atividade' }))

  const sheet = await screen.findByRole('dialog')

  await userEvent.click(within(sheet).getByRole('button', { name: 'Remover atividade' }))
}

describe('Detalhe', () => {
  beforeEach(() => {
    replace.mockReset()
    vi.mocked(removeActivity).mockReset()
  })

  it('mostra quanto conta, por quê e como foi calculado', () => {
    renderDetalhe(PARTIAL)

    expect(screen.getByText('Conta em parte')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Palestra sobre segurança em redes' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Item 13 · Palestra como ouvinte')).toBeInTheDocument()
    expect(screen.getByText('de 2,0h contam no seu total')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Ficou 1,0h de fora porque o item 13 chegou ao limite de 30h. As atividades registradas antes contam primeiro.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: '1 palestra × 2,0h' })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: 'Cabia no item 13' })).toBeInTheDocument()
    expect(screen.getByText('Palestras')).toBeInTheDocument()
    expect(screen.getByText('20/10/2026')).toBeInTheDocument()
    expect(screen.getByText('declaracao-palestra.pdf')).toBeInTheDocument()
    expect(screen.getByText('860 KB')).toBeInTheDocument()
  })

  it('chama o não encontrado quando a atividade não existe', () => {
    // O erro do `notFound()` sobe até o React, que o registra no console antes do teste pegar.
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(() => renderDetalhe(null)).toThrow(NOT_FOUND)
  })

  it('remove depois da confirmação, sem derrubar o detalhe, e volta para a lista', async () => {
    vi.mocked(removeActivity).mockResolvedValue()
    const queryClient = renderDetalhe(PARTIAL)
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await confirmRemoval()

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        `/atividades?removida=${encodeURIComponent('Palestra sobre segurança em redes')}`,
      ),
    )
    expect(removeActivity).toHaveBeenCalledWith(ID)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['activities', 'list'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['progress'] })
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ['activities'] })
  })

  it('volta para a lista quando a atividade já tinha sido removida', async () => {
    vi.mocked(removeActivity).mockRejectedValue(new ActivityNotFoundError())
    renderDetalhe(PARTIAL)

    await confirmRemoval()

    await waitFor(() => expect(replace).toHaveBeenCalled())
  })

  it('diz que nada foi removido e o que fazer quando a remoção falha', async () => {
    vi.mocked(removeActivity).mockRejectedValue(new Error('rede caiu'))
    renderDetalhe(PARTIAL)

    await confirmRemoval()

    expect(await screen.findByText('A atividade não foi removida')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
    expect(screen.getByText('Palestra sobre segurança em redes')).toBeInTheDocument()
  })
})
