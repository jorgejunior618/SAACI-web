import { render, screen } from '@testing-library/react'
import { CalendarCheck } from 'lucide-react'
import { describe, expect, it } from 'vitest'

import { LoadingState, StateScreen } from './index'

describe('StateScreen', () => {
  it('no vazio mostra o ícone da tela, sem imagem', () => {
    const { container } = render(
      <StateScreen
        variant="empty"
        icon={CalendarCheck}
        title="Você precisa de 120h para se formar"
        description="Registre a primeira atividade quando quiser."
      />,
    )

    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  it('no erro de conexão mostra um ícone e nunca imagem', () => {
    const { container } = render(
      <StateScreen
        variant="connectionError"
        title="Não conseguimos carregar seu painel"
        description="Suas atividades continuam salvas."
      />,
    )

    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('o selo aparece antes do título e some quando não é passado', () => {
    const { rerender } = render(
      <StateScreen
        variant="success"
        eyebrow="Em construção"
        title="Eventos está chegando"
        description="Em breve."
      />,
    )

    const eyebrow = screen.getByText('Em construção')
    const title = screen.getByRole('heading', { name: 'Eventos está chegando' })

    expect(eyebrow.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    rerender(
      <StateScreen variant="success" title="Eventos está chegando" description="Em breve." />,
    )

    expect(screen.queryByText('Em construção')).not.toBeInTheDocument()
  })

  it('mostra título, texto e as ações da tela', () => {
    render(
      <StateScreen
        variant="success"
        title="Atividade registrada"
        description="Ela contou 4,0h."
        actions={<button type="button">Registrar outra</button>}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Atividade registrada' })).toBeInTheDocument()
    expect(screen.getByText('Ela contou 4,0h.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Registrar outra' })).toBeInTheDocument()
  })

  it('sem actions não renderiza a área de ações', () => {
    render(<StateScreen variant="success" title="Pronto" description="Tudo certo." />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('o carregamento anuncia o label uma vez, como status', () => {
    render(<LoadingState label="Calculando suas horas" />)

    expect(screen.getByRole('status')).toHaveTextContent('Calculando suas horas')
    // getAllByText não ignora aria-hidden: conta só as cópias que o leitor de tela alcança.
    const lidas = screen
      .getAllByText('Calculando suas horas')
      .filter((element) => !element.closest('[aria-hidden="true"]'))

    expect(lidas).toHaveLength(1)
  })
})
