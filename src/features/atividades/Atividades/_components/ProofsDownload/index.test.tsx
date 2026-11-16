import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { unzipSync } from 'fflate'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getProofFile, ProofDownloadError } from '@/services/activities'
import type { Activity } from '@/services/activities'
import type { RuleItem } from '@/services/rules'

import { ProofsDownload } from './index'

vi.mock('@/services/activities', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/activities')>()),
  getProofFile: vi.fn(),
}))

const getProofFileMock = vi.mocked(getProofFile)

let seq = 0

function activity(over: Partial<Activity>): Activity {
  seq += 1
  return {
    id: `00000000-0000-4000-8000-${String(seq).padStart(12, '0')}`,
    name: `Atividade ${seq}`,
    itemNumber: 6,
    quantity: 4,
    startDate: '2025-01-01',
    endDate: '2025-01-02',
    registeredAt: '2025-01-02T12:00:00.000Z',
    updatedAt: '2025-01-02T12:00:00.000Z',
    activityHours: 1,
    countedHours: 1,
    status: 'conta',
    reason: null,
    proof: { fileName: `comprovante-${seq}.pdf`, sizeBytes: 1024 * 1024, type: 'pdf' },
    ...over,
  }
}

const RULE_ITEMS: RuleItem[] = [6, 13].map((itemNumber) => ({
  itemNumber,
  name: itemNumber === 6 ? 'Curso de línguas' : 'Palestras',
  rule: '',
  ratio: { hours: 1, per: 1, unit: 'hora' },
  maxHours: 60,
}))

const ACTIVITIES = [
  activity({ itemNumber: 6, name: 'Curso de inglês' }),
  activity({ itemNumber: 13, name: 'Palestra de IA' }),
  activity({ itemNumber: 13, name: 'Boas-vindas', status: 'nao_conta' }),
]

function renderDownload(selectedIds?: ReadonlySet<string>) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })

  return render(
    <QueryClientProvider client={queryClient}>
      <ProofsDownload activities={ACTIVITIES} ruleItems={RULE_ITEMS} selectedIds={selectedIds} />
    </QueryClientProvider>,
  )
}

// O arquivo salvo passa por `URL.createObjectURL`, que o jsdom não tem.
const createObjectURL = vi.fn((_file: Blob) => 'blob:comprovantes')

beforeEach(() => {
  getProofFileMock.mockReset()
  createObjectURL.mockClear()
  URL.createObjectURL = createObjectURL
  URL.revokeObjectURL = vi.fn()
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ProofsDownload', () => {
  it('anuncia quantos arquivos entram e quem fica de fora', () => {
    renderDownload()

    expect(screen.getByText(/2 arquivos, cerca de 2,0 MB/)).toBeInTheDocument()
    expect(
      screen.getByText('1 comprovante não conta e fica de fora: Boas-vindas.'),
    ).toBeInTheDocument()
  })

  it('salva um arquivo compactado com uma pasta por item, só com os que contam', async () => {
    getProofFileMock.mockImplementation((id) => Promise.resolve(new Blob([`arquivo ${id}`])))
    renderDownload()

    fireEvent.click(screen.getByRole('button', { name: 'Baixar os que contam' }))

    await waitFor(() => expect(createObjectURL).toHaveBeenCalledOnce())
    const zip = createObjectURL.mock.calls[0]?.[0]

    if (!zip) throw new Error('O arquivo não foi salvo.')
    expect(zip.type).toBe('application/zip')
    expect(Object.keys(unzipSync(new Uint8Array(await zip.arrayBuffer())))).toEqual([
      'Item 06 - Curso de línguas/Curso de inglês.pdf',
      'Item 13 - Palestras/Palestra de IA.pdf',
    ])
    expect(getProofFileMock).toHaveBeenCalledTimes(2)
  })

  it('mostra o erro com o próximo passo e tenta de novo', async () => {
    getProofFileMock.mockRejectedValueOnce(new ProofDownloadError())
    renderDownload()

    fireEvent.click(screen.getByRole('button', { name: 'Baixar os que contam' }))

    expect(await screen.findByText('O download parou no meio')).toBeInTheDocument()
    expect(screen.getByText(/Nada foi salvo no celular/)).toBeInTheDocument()
    expect(createObjectURL).not.toHaveBeenCalled()

    getProofFileMock.mockResolvedValue(new Blob(['ok']))
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    await waitFor(() => expect(createObjectURL).toHaveBeenCalledOnce())
  })

  it('cancela sem salvar e volta ao botão', async () => {
    getProofFileMock.mockImplementation(
      (_id, signal) =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () => reject(signal.reason))
        }),
    )
    renderDownload()

    fireEvent.click(screen.getByRole('button', { name: 'Baixar os que contam' }))
    expect(await screen.findByText('0 de 2 arquivos')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar download' }))

    expect(await screen.findByRole('button', { name: 'Baixar os que contam' })).toBeInTheDocument()
    expect(screen.queryByText('O download parou no meio')).not.toBeInTheDocument()
    expect(createObjectURL).not.toHaveBeenCalled()
  })

  describe('escolher quais', () => {
    it('baixa só os marcados e diz quantos no botão', async () => {
      getProofFileMock.mockResolvedValue(new Blob(['ok']))
      const [english] = ACTIVITIES

      if (!english) throw new Error('Faltou a atividade de exemplo.')
      renderDownload(new Set([english.id]))

      expect(screen.getByText(/1 arquivo, cerca de 1,0 MB/)).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Baixar 1 selecionado' }))

      await waitFor(() => expect(createObjectURL).toHaveBeenCalledOnce())
      const zip = createObjectURL.mock.calls[0]?.[0]

      if (!zip) throw new Error('O arquivo não foi salvo.')
      expect(Object.keys(unzipSync(new Uint8Array(await zip.arrayBuffer())))).toEqual([
        'Item 06 - Curso de línguas/Curso de inglês.pdf',
      ])
      expect(getProofFileMock).toHaveBeenCalledExactlyOnceWith(english.id, expect.anything())
    })

    it('com nada marcado, explica o que fazer em vez de baixar', () => {
      renderDownload(new Set())

      fireEvent.click(screen.getByRole('button', { name: 'Baixar 0 selecionados' }))

      expect(screen.getByRole('alert')).toHaveTextContent('Nenhum comprovante marcado')
      expect(getProofFileMock).not.toHaveBeenCalled()
    })
  })
})
