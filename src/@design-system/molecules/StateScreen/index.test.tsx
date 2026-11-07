import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LoadingState, StateScreen } from './index'

describe('StateScreen', () => {
  it('no vazio mostra o símbolo do SAACI', () => {
    const { container } = render(
      <StateScreen
        variant="empty"
        title="Você precisa de 120h para se formar"
        description="Registre a primeira atividade quando quiser."
      />,
    )

    expect(container.querySelector('img')).toBeInTheDocument()
  })

  it('no erro de conexão o símbolo do Saci não aparece', () => {
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
    expect(screen.getAllByText('Calculando suas horas')).toHaveLength(1)
  })
})
