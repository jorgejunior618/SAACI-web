import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Suspense } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  activitiesQueries,
  ActivityNotFoundError,
  InvalidActivityDatesError,
  removeActivity,
  StaleActivityError,
  updateActivity,
} from '@/services/activities'
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
// A lista e o total que a tela busca de novo depois de remover. O mock fica na fronteira do domínio:
// só a `queryFn` muda, e a chave continua a da factory. Cada teste decide quando a busca termina.
const { detailFetch, listFetch, progressFetch } = vi.hoisted(() => ({
  detailFetch: vi.fn<() => Promise<Activity | null>>(),
  listFetch: vi.fn<() => Promise<Activity[]>>(),
  progressFetch: vi.fn<() => Promise<Progress>>(),
}))

vi.mock('@/services/activities', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/services/activities')>()

  return {
    ...original,
    removeActivity: vi.fn(),
    updateActivity: vi.fn(),
    activitiesQueries: {
      ...original.activitiesQueries,
      list: () => ({ ...original.activitiesQueries.list(), queryFn: () => listFetch() }),
      detail: (id: string) => ({
        ...original.activitiesQueries.detail(id),
        queryFn: () => detailFetch(),
      }),
    },
  }
})
vi.mock('@/services/progress', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/services/progress')>()

  return {
    ...original,
    progressQueries: {
      ...original.progressQueries,
      summary: () => ({ ...original.progressQueries.summary(), queryFn: () => progressFetch() }),
    },
  }
})

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
    // O jsdom não rola a página; a volta ao topo depois de salvar não é o que se testa aqui.
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    vi.mocked(removeActivity).mockReset()
    vi.mocked(updateActivity).mockReset()
    detailFetch.mockReset().mockResolvedValue(PARTIAL)
    listFetch.mockReset().mockResolvedValue([EARLIER])
    progressFetch.mockReset().mockResolvedValue(PROGRESS)
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

  it('trata a atividade já removida como removida, sem aviso de falha na volta', async () => {
    vi.mocked(removeActivity).mockRejectedValue(new ActivityNotFoundError())
    let finishRefetch: (activities: Activity[]) => void = () => undefined

    // A lista nova só chega quando o teste mandar: é a janela entre a remoção e a volta.
    listFetch.mockReturnValue(
      new Promise<Activity[]>((resolve) => {
        finishRefetch = resolve
      }),
    )
    renderDetalhe(PARTIAL)

    await confirmRemoval()
    await waitFor(() => expect(listFetch).toHaveBeenCalled())

    expect(screen.queryByText('A atividade não foi removida')).not.toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()

    act(() => finishRefetch([EARLIER]))

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        `/atividades?removida=${encodeURIComponent('Palestra sobre segurança em redes')}`,
      ),
    )
    expect(screen.queryByText('A atividade não foi removida')).not.toBeInTheDocument()
  })

  it('mantém a frase da confirmação quando a lista e o total mudam com o sheet aberto', async () => {
    const queryClient = renderDetalhe(PARTIAL)

    await userEvent.click(screen.getByRole('button', { name: 'Remover atividade' }))

    const sheet = await screen.findByRole('dialog')
    const text = 'Palestra sobre segurança em redes sai da lista, e seu total continua em 30h.'

    expect(within(sheet).getByText(text, { exact: false })).toBeInTheDocument()

    // Como depois da remoção: a lista sem a atividade e o total novo chegam com o sheet aberto. O
    // Query avisa a tela num `setTimeout(0)`, então o `act` espera esse aviso antes de conferir.
    await act(async () => {
      queryClient.setQueryData(activitiesQueries.list().queryKey, [{ ...EARLIER, quantity: 5 }])
      queryClient.setQueryData(progressQueries.summary().queryKey, { ...PROGRESS, totalHours: 10 })
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(within(sheet).getByText(text, { exact: false })).toBeInTheDocument()
  })

  it('diz que nada foi removido e o que fazer quando a remoção falha', async () => {
    vi.mocked(removeActivity).mockRejectedValue(new Error('rede caiu'))
    renderDetalhe(PARTIAL)

    await confirmRemoval()

    expect(await screen.findByText('A atividade não foi removida')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
    expect(screen.getByText('Palestra sobre segurança em redes')).toBeInTheDocument()
  })

  describe('Corrigir dados', () => {
    async function openCorrection(): Promise<void> {
      await userEvent.click(screen.getByRole('button', { name: 'Corrigir dados' }))
    }

    async function typeQuantity(text: string): Promise<void> {
      const field = screen.getByLabelText(/Palestras|Quantas palestras/)

      await userEvent.clear(field)
      await userEvent.type(field, text)
    }

    it('mostra o antes e a prévia, grava só o que mudou e volta com o aviso', async () => {
      vi.mocked(updateActivity).mockResolvedValue({ ...PARTIAL, quantity: 2 })
      const queryClient = renderDetalhe(PARTIAL)
      const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

      await openCorrection()
      await typeQuantity('2')

      expect(screen.getByText('Antes: 1')).toBeInTheDocument()
      expect(screen.getByText('Vai contar (antes 1,0h)')).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Salvar correção' }))

      expect(await screen.findByText('Correção salva')).toBeInTheDocument()
      expect(updateActivity).toHaveBeenCalledWith(ID, PARTIAL.updatedAt, { quantity: 2 })
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['activities'] })
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['progress'] })
    })

    it('não grava quando nada mudou', async () => {
      renderDetalhe(PARTIAL)

      await openCorrection()
      await userEvent.click(screen.getByRole('button', { name: 'Salvar correção' }))

      expect(await screen.findByText('Correção salva')).toBeInTheDocument()
      expect(updateActivity).not.toHaveBeenCalled()
    })

    it('pede para abrir de novo quando a atividade mudou, sem perder o que foi digitado', async () => {
      vi.mocked(updateActivity).mockRejectedValueOnce(new StaleActivityError())
      vi.mocked(updateActivity).mockResolvedValueOnce({ ...PARTIAL, quantity: 3 })
      renderDetalhe(PARTIAL)
      const newer = '2026-11-01T12:00:00.000Z'

      await openCorrection()
      await typeQuantity('3')
      await userEvent.click(screen.getByRole('button', { name: 'Salvar correção' }))

      expect(
        await screen.findByText('Esta atividade mudou desde que você a abriu'),
      ).toBeInTheDocument()

      // Outra aba gravou antes: a busca de novo traz o `updatedAt` atual.
      detailFetch.mockResolvedValue({ ...PARTIAL, updatedAt: newer })
      await userEvent.click(screen.getByRole('button', { name: 'Abrir de novo' }))

      await waitFor(() =>
        expect(
          screen.queryByText('Esta atividade mudou desde que você a abriu'),
        ).not.toBeInTheDocument(),
      )
      expect(screen.getByLabelText(/Palestras|Quantas palestras/)).toHaveValue('3')

      await userEvent.click(screen.getByRole('button', { name: 'Salvar correção' }))

      await waitFor(() =>
        expect(updateActivity).toHaveBeenLastCalledWith(ID, newer, { quantity: 3 }),
      )
    })

    // Chega até o aviso de atividade desatualizada, com a quantidade 3 digitada.
    async function reachStaleNotice(): Promise<void> {
      vi.mocked(updateActivity).mockRejectedValue(new StaleActivityError())
      renderDetalhe(PARTIAL)

      await openCorrection()
      await typeQuantity('3')
      await userEvent.click(screen.getByRole('button', { name: 'Salvar correção' }))
      await screen.findByText('Esta atividade mudou desde que você a abriu')
    }

    const RELOAD_FAILED =
      'Não deu para abrir a atividade de novo. Confira a internet e toque em Abrir de novo.'

    it('mantém o aviso e diz o que fazer quando abrir de novo falha', async () => {
      await reachStaleNotice()
      detailFetch.mockRejectedValue(new Error('rede caiu'))

      await userEvent.click(screen.getByRole('button', { name: 'Abrir de novo' }))

      expect(await screen.findByText(RELOAD_FAILED)).toBeInTheDocument()
      expect(screen.getByText('Esta atividade mudou desde que você a abriu')).toBeInTheDocument()

      // O próximo envio continua com o `updatedAt` que a tela tinha, porque nada novo chegou.
      await userEvent.click(screen.getByRole('button', { name: 'Salvar correção' }))

      await waitFor(() =>
        expect(updateActivity).toHaveBeenLastCalledWith(ID, PARTIAL.updatedAt, { quantity: 3 }),
      )
    })

    it('mantém o aviso quando abrir de novo fica parado sem internet', async () => {
      await reachStaleNotice()
      onlineManager.setOnline(false)

      try {
        await userEvent.click(screen.getByRole('button', { name: 'Abrir de novo' }))

        expect(await screen.findByText(RELOAD_FAILED)).toBeInTheDocument()
        expect(screen.getByText('Esta atividade mudou desde que você a abriu')).toBeInTheDocument()
      } finally {
        onlineManager.setOnline(true)
      }
    })

    it('mostra a recusa das datas no campo do fim', async () => {
      vi.mocked(updateActivity).mockRejectedValue(new InvalidActivityDatesError())
      renderDetalhe(PARTIAL)

      await openCorrection()
      await typeQuantity('2')
      await userEvent.click(screen.getByRole('button', { name: 'Salvar correção' }))

      expect(
        await screen.findByText(
          'A data de fim é anterior à de início. Corrija uma das duas datas.',
        ),
      ).toBeInTheDocument()
    })

    it('mantém o que foi digitado e diz o que fazer quando a gravação falha', async () => {
      vi.mocked(updateActivity).mockRejectedValue(new Error('rede caiu'))
      renderDetalhe(PARTIAL)

      await openCorrection()
      await typeQuantity('2')
      await userEvent.click(screen.getByRole('button', { name: 'Salvar correção' }))

      expect(await screen.findByText('A correção não foi salva')).toBeInTheDocument()
      expect(screen.getByLabelText(/Palestras|Quantas palestras/)).toHaveValue('2')
    })

    it('volta ao detalhe sem gravar ao tocar em Voltar', async () => {
      renderDetalhe(PARTIAL)

      await openCorrection()
      await userEvent.click(screen.getByRole('button', { name: /Voltar/ }))

      expect(screen.getByRole('button', { name: 'Corrigir dados' })).toBeInTheDocument()
      expect(updateActivity).not.toHaveBeenCalled()
    })
  })
})
