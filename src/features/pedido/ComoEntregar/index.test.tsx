import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Suspense } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { profileQueries } from '@/services/profile'
import { progressQueries } from '@/services/progress'
import { rulesQueries } from '@/services/rules'
import type { Course } from '@/services/rules'

import { ComoEntregar } from './index'

vi.mock('next/navigation', () => ({ usePathname: () => '/atividades/pedido/como-entregar' }))
vi.mock('@supabase/client', () => ({ createClient: vi.fn() }))

const COURSE: Course = {
  id: 'curso-1',
  name: 'Engenharia de Computação',
  degree: 'Bacharelado',
  campus: 'Fortaleza',
  targetHours: 120,
}

// Nada aqui fala com o Supabase: tudo entra pelo cache.
function renderGuide(): void {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  queryClient.setQueryData(profileQueries.detail().queryKey, {
    name: 'Ana Beatriz Moura',
    enrollmentId: '2023104501',
    startSemester: '2023-07-01',
    courseId: 'curso-1',
  })
  queryClient.setQueryData(progressQueries.summary().queryKey, {
    totalHours: 120,
    targetHours: 120,
    missingHours: 0,
    itemsSum: 120,
    categories: [],
  })
  queryClient.setQueryData(rulesQueries.course('curso-1').queryKey, COURSE)
  render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p>Carregando</p>}>
        <ComoEntregar />
      </Suspense>
    </QueryClientProvider>,
  )
}

describe('ComoEntregar', () => {
  it('mostra os quatro passos da entrega, todos abertos', () => {
    renderGuide()

    const steps = screen.getAllByRole('listitem')

    expect(steps).toHaveLength(4)
    expect(steps[0]).toHaveTextContent('Baixar o formulário e os comprovantes')
    expect(steps[1]).toHaveTextContent('Enviar o e-mail para o protocolo')
    expect(steps[1]).toHaveTextContent('protocolo.fortaleza@ifce.edu.br')
    expect(steps[2]).toHaveTextContent('Ir à recepção do IFCE')
    expect(steps[3]).toHaveTextContent('Acompanhar pelo e-mail')
    // Nenhum passo vem feito: o guia só orienta.
    expect(screen.queryByRole('img', { name: /feito/ })).not.toBeInTheDocument()
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
