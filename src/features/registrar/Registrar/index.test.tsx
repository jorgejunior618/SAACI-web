import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Suspense } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { activitiesQueries, createActivity, readProof } from '@/services/activities'
import type { Activity } from '@/services/activities'
import { profileQueries } from '@/services/profile'
import type { Profile } from '@/services/profile'
import { progressQueries } from '@/services/progress'
import type { Progress } from '@/services/progress'
import { rulesQueries } from '@/services/rules'
import type { RuleItem } from '@/services/rules'

import { Registrar } from './index'

vi.mock('next/navigation', () => ({ usePathname: () => '/registrar' }))
vi.mock('@supabase/client', () => ({ createClient: vi.fn() }))
vi.mock('@/services/activities', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/activities')>()),
  readProof: vi.fn(),
  createActivity: vi.fn(),
}))

const PROFILE: Profile = {
  name: 'Ana Beatriz Moura',
  enrollmentId: '2023104501',
  startSemester: '2023-07-01',
  courseId: 'curso-1',
}
const RULE_ITEMS: RuleItem[] = [
  {
    itemNumber: 7,
    name: 'Curso na área de engenharia de computação',
    rule: '1h a cada 4h de curso, até 60h',
    ratio: { hours: 1, per: 4, unit: 'hora' },
    maxHours: 60,
  },
]
const PROGRESS: Progress = {
  totalHours: 0,
  targetHours: 120,
  missingHours: 120,
  itemsSum: 0,
  categories: [],
}
const SAVED: Activity = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Curso de React com TypeScript',
  itemNumber: 7,
  quantity: 40,
  startDate: '2026-08-03',
  endDate: '2026-09-12',
  registeredAt: '2026-11-16T10:00:00.000Z',
  updatedAt: '2026-11-16T10:00:00.000Z',
  activityHours: 10,
  countedHours: 10,
  status: 'conta',
  reason: null,
  proof: { fileName: 'certificado.pdf', sizeBytes: 1000, type: 'pdf' },
}

// Nada aqui fala com o Supabase: perfil, regras, atividades e progresso entram pelo cache.
function renderRegistrar(): QueryClient {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  queryClient.setQueryData(profileQueries.detail().queryKey, PROFILE)
  queryClient.setQueryData(rulesQueries.items('curso-1').queryKey, RULE_ITEMS)
  queryClient.setQueryData(activitiesQueries.list().queryKey, [])
  queryClient.setQueryData(progressQueries.summary().queryKey, PROGRESS)
  render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p>Carregando</p>}>
        <Registrar />
      </Suspense>
    </QueryClientProvider>,
  )
  return queryClient
}

// Anexa o PDF, espera a sugestão do item 7 e confirma. O campo de arquivo fica escondido atrás dos
// botões, então o anexo entra direto nele.
async function attachAndConfirm(): Promise<void> {
  const proof = new File(['%PDF'], 'certificado.pdf', { type: 'application/pdf' })
  const input = document.querySelector<HTMLInputElement>('input[type="file"]:not([capture])')

  if (!input) throw new Error('O campo de arquivo não foi desenhado.')
  fireEvent.change(input, { target: { files: [proof] } })
  await userEvent.click(await screen.findByRole('button', { name: 'É esse' }))
}

describe('Registrar', () => {
  beforeEach(() => {
    vi.mocked(readProof).mockResolvedValue({
      itemNumber: 7,
      name: 'Curso de React com TypeScript',
      quantity: 40,
      startDate: '2026-08-03',
      endDate: '2026-09-12',
    })
    vi.mocked(createActivity).mockReset()
  })

  it('mantém o que foi digitado e o comprovante quando o envio falha (RNF24)', async () => {
    vi.mocked(createActivity).mockRejectedValue(new Error('rede caiu'))
    renderRegistrar()
    await attachAndConfirm()

    const name = screen.getByLabelText(/Nome da atividade/)

    await userEvent.clear(name)
    await userEvent.type(name, 'Curso de React avançado')
    await userEvent.click(screen.getByRole('button', { name: 'Registrar' }))

    expect(await screen.findByText('A atividade não foi registrada')).toBeInTheDocument()
    expect(screen.getByLabelText(/Nome da atividade/)).toHaveValue('Curso de React avançado')
    expect(screen.getByLabelText(/Horas do certificado/)).toHaveValue('40')
    expect(screen.getByText('certificado.pdf')).toBeInTheDocument()
  })

  it('grava com o item e o comprovante e derruba atividades e progresso do cache', async () => {
    vi.mocked(createActivity).mockResolvedValue(SAVED)
    const queryClient = renderRegistrar()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await attachAndConfirm()
    await userEvent.click(screen.getByRole('button', { name: 'Registrar' }))

    expect(await screen.findByText('Atividade registrada')).toBeInTheDocument()
    expect(vi.mocked(createActivity).mock.calls[0]?.[0]).toMatchObject({
      name: 'Curso de React com TypeScript',
      itemNumber: 7,
      quantity: 40,
      startDate: '2026-08-03',
      endDate: '2026-09-12',
      proof: expect.any(File),
    })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['activities'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['progress'] })
  })

  it('mostra o resumo de erros e não grava quando falta um campo', async () => {
    renderRegistrar()
    await attachAndConfirm()
    await userEvent.clear(screen.getByLabelText(/Horas do certificado/))
    await userEvent.click(screen.getByRole('button', { name: 'Registrar' }))

    expect(await screen.findByText('Falta corrigir 1 coisa')).toBeInTheDocument()
    expect(createActivity).not.toHaveBeenCalled()
  })
})
