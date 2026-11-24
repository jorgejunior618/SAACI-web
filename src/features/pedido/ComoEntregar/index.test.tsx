// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Suspense } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { activitiesQueries, getProofFile } from '@/services/activities'
import type { Activity } from '@/services/activities'
import { profileQueries } from '@/services/profile'
import type { Profile } from '@/services/profile'
import { progressQueries } from '@/services/progress'
import { rulesQueries } from '@/services/rules'
import type { Course, RuleItem } from '@/services/rules'
import { buildFormPdf, PdfCharacterError } from '@/utils/coordination-form'
import { saveFile } from '@/utils/save-file'

import { ComoEntregar } from './index'

vi.mock('next/navigation', () => ({ usePathname: () => '/atividades/pedido/como-entregar' }))
vi.mock('@supabase/client', () => ({ createClient: vi.fn() }))
// O PDF de verdade é testado em `coordination-form.test.ts`. Aqui só interessa o que a tela faz com ele.
vi.mock('@/utils/coordination-form', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/coordination-form')>()),
  buildFormPdf: vi.fn(),
}))
vi.mock('@/utils/save-file', () => ({ saveFile: vi.fn() }))
vi.mock('@/services/activities', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/activities')>()),
  getProofFile: vi.fn(),
}))

const COURSE: Course = {
  id: 'curso-1',
  name: 'Engenharia de Computação',
  degree: 'Bacharelado',
  campus: 'Fortaleza',
  targetHours: 120,
  checkedAt: null,
}
const RULE_ITEMS: RuleItem[] = [
  {
    itemNumber: 6,
    name: 'Curso de línguas',
    rule: '',
    ratio: { hours: 1, per: 1, unit: 'hora' },
    maxHours: 60,
  },
]
const PROFILE: Profile = {
  name: 'Ana Beatriz Moura',
  enrollmentId: '2023104501',
  startSemester: '2023-07-01',
  courseId: 'curso-1',
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
const NOT_COUNTING: Activity = { ...ACTIVITY, status: 'nao_conta', reason: 'item_cheio' }

beforeEach(() => {
  vi.mocked(buildFormPdf).mockReset()
  vi.mocked(saveFile).mockReset()
  vi.mocked(getProofFile).mockReset()
})

// Nada aqui fala com o Supabase: tudo entra pelo cache.
function renderGuide(activities: Activity[] = [ACTIVITY], profile: Profile = PROFILE): void {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  queryClient.setQueryData(profileQueries.detail().queryKey, profile)
  queryClient.setQueryData(activitiesQueries.list().queryKey, activities)
  queryClient.setQueryData(progressQueries.summary().queryKey, {
    totalHours: 120,
    targetHours: 120,
    missingHours: 0,
    itemsSum: 120,
    categories: [],
  })
  queryClient.setQueryData(rulesQueries.course('curso-1').queryKey, COURSE)
  queryClient.setQueryData(rulesQueries.items('curso-1').queryKey, RULE_ITEMS)
  render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p>Carregando</p>}>
        <ComoEntregar />
      </Suspense>
    </QueryClientProvider>,
  )
}

const stepDone = (n: number) => screen.queryByRole('img', { name: `Passo ${n} feito` })

describe('ComoEntregar', () => {
  it('mostra os quatro passos da entrega, nenhum feito de início', () => {
    renderGuide()

    const steps = screen.getAllByRole('listitem')

    expect(steps).toHaveLength(4)
    expect(steps[0]).toHaveTextContent('Baixar o formulário e os comprovantes')
    expect(steps[1]).toHaveTextContent('Enviar o e-mail para o protocolo')
    expect(steps[2]).toHaveTextContent('Ir à recepção do IFCE')
    expect(steps[3]).toHaveTextContent('Acompanhar pelo e-mail')
    expect(screen.queryByRole('img', { name: /feito/ })).not.toBeInTheDocument()
  })

  it('baixa o formulário e marca só ele: o passo 1 espera também os comprovantes', async () => {
    vi.mocked(buildFormPdf).mockResolvedValue(new Blob(['%PDF'], { type: 'application/pdf' }))
    renderGuide()

    await userEvent.click(screen.getByRole('button', { name: 'Baixar formulário em PDF' }))

    expect(await screen.findByText('Baixado')).toBeInTheDocument()
    expect(buildFormPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        studentName: 'Ana Beatriz Moura',
        enrollmentId: '2023104501',
        totalHours: 120,
        isBlank: false,
      }),
    )
    expect(saveFile).toHaveBeenCalledWith(
      expect.any(Blob),
      'formulario-atividades-complementares-ana-moura.pdf',
    )
    expect(stepDone(1)).not.toBeInTheDocument()
  })

  it('só dá o passo 1 por feito quando os comprovantes também foram baixados', async () => {
    vi.mocked(buildFormPdf).mockResolvedValue(new Blob(['%PDF']))
    vi.mocked(getProofFile).mockResolvedValue(new Blob(['ok']))
    renderGuide()

    await userEvent.click(screen.getByRole('button', { name: 'Baixar formulário em PDF' }))
    await screen.findByText('Baixado')
    expect(stepDone(1)).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Baixar os que contam' }))

    expect(await screen.findByText('Baixados')).toBeInTheDocument()
    expect(stepDone(1)).toBeInTheDocument()
  })

  it('não marca o formulário quando o que baixou foi a versão em branco', async () => {
    vi.mocked(buildFormPdf).mockResolvedValue(new Blob(['%PDF']))
    renderGuide()

    await userEvent.click(screen.getByRole('button', { name: 'Baixar em branco' }))

    expect(await screen.findByText(/está nos downloads do aparelho/)).toBeInTheDocument()
    expect(buildFormPdf).toHaveBeenCalledWith(expect.objectContaining({ isBlank: true }))
    expect(saveFile).toHaveBeenCalledWith(
      expect.any(Blob),
      'formulario-atividades-complementares-em-branco.pdf',
    )
    expect(screen.queryByText('Baixado')).not.toBeInTheDocument()
  })

  it('deixa marcar à mão o que já foi baixado em outro momento, e desmarcar', async () => {
    renderGuide()

    await userEvent.click(screen.getByRole('button', { name: 'Já baixei o formulário' }))
    expect(stepDone(1)).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Já baixei os comprovantes' }))
    expect(stepDone(1)).toBeInTheDocument()
    expect(buildFormPdf).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Desmarcar comprovantes baixados' }))
    expect(stepDone(1)).not.toBeInTheDocument()
  })

  it('marca e desmarca os passos 2 a 4 à mão', async () => {
    renderGuide()

    await userEvent.click(screen.getByRole('button', { name: 'Já enviei o e-mail' }))
    await userEvent.click(screen.getByRole('button', { name: 'Já fui à recepção' }))
    await userEvent.click(screen.getByRole('button', { name: 'Já recebi a resposta' }))

    expect(stepDone(2)).toBeInTheDocument()
    expect(stepDone(3)).toBeInTheDocument()
    expect(stepDone(4)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Desmarcar ida à recepção' }))
    expect(stepDone(3)).not.toBeInTheDocument()
    expect(stepDone(2)).toBeInTheDocument()
  })

  it('se o PDF falha, não baixa nada, diz o próximo passo e deixa tentar de novo', async () => {
    vi.mocked(buildFormPdf).mockRejectedValueOnce(new Error('falhou'))
    renderGuide()

    await userEvent.click(screen.getByRole('button', { name: 'Baixar formulário em PDF' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não deu para gerar o PDF. Nada foi baixado. Toque em Baixar de novo.',
    )
    expect(saveFile).not.toHaveBeenCalled()
    expect(screen.queryByText('Baixado')).not.toBeInTheDocument()

    vi.mocked(buildFormPdf).mockResolvedValue(new Blob(['%PDF']))
    await userEvent.click(screen.getByRole('button', { name: 'Baixar formulário em PDF' }))
    expect(await screen.findByText('Baixado')).toBeInTheDocument()
  })

  it('manda conferir o nome no Perfil quando ele tem caractere que o PDF não aceita', async () => {
    vi.mocked(buildFormPdf).mockRejectedValue(new PdfCharacterError())
    renderGuide()

    await userEvent.click(screen.getByRole('button', { name: 'Baixar formulário em PDF' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O nome tem um caractere que o PDF não aceita',
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Confira o nome no Perfil')
  })

  it('sem comprovante que conte, o passo 1 depende só do formulário', async () => {
    vi.mocked(buildFormPdf).mockResolvedValue(new Blob(['%PDF']))
    renderGuide([NOT_COUNTING])

    expect(screen.getByText(/Nenhum comprovante conta ainda/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Já baixei os comprovantes' })).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Baixar formulário em PDF' }))

    expect(await screen.findByText('Baixado')).toBeInTheDocument()
    expect(stepDone(1)).toBeInTheDocument()
  })

  it('baixa o formulário sem nome com o nome de arquivo sem "em branco"', async () => {
    vi.mocked(buildFormPdf).mockResolvedValue(new Blob(['%PDF']))
    renderGuide([ACTIVITY], { ...PROFILE, name: null, enrollmentId: null })

    await userEvent.click(screen.getByRole('button', { name: 'Baixar formulário em PDF' }))

    await screen.findByText('Baixado')
    expect(saveFile).toHaveBeenCalledWith(
      expect.any(Blob),
      'formulario-atividades-complementares.pdf',
    )
  })

  it('avisa que o e-mail abre sem anexo e traz o texto pronto com os dados do aluno', () => {
    renderGuide()

    expect(screen.getByText(/O e-mail abre sem anexo/)).toBeInTheDocument()

    const href = screen.getByRole('link', { name: 'Escrever o e-mail' }).getAttribute('href') ?? ''
    const url = new URL(href)

    expect(url.searchParams.get('subject')).toBe(
      'Solicitação de atividades complementares - Ana Beatriz Moura - 2023104501',
    )
    expect(url.searchParams.get('body')).toContain('Carga horária solicitada: 120h')
  })

  it('copia o texto do e-mail e confirma', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    renderGuide()

    await userEvent.click(screen.getByRole('button', { name: 'Copiar texto' }))

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('Para: protocolo.fortaleza@ifce.edu.br'),
    )
    expect(await screen.findByText('Texto copiado. Cole no seu e-mail.')).toBeInTheDocument()
  })

  it('diz o que fazer quando não dá para copiar', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('negado')) },
      configurable: true,
    })
    renderGuide()

    await userEvent.click(screen.getByRole('button', { name: 'Copiar texto' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Não deu para copiar')
  })

  it('volta ao pedido', () => {
    renderGuide()

    expect(screen.getByRole('link', { name: 'Voltar ao meu pedido' })).toHaveAttribute(
      'href',
      '/atividades/pedido',
    )
  })
})
