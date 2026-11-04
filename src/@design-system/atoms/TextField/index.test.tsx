import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TextField } from '.'

describe('TextField', () => {
  it('liga a dica e o erro ao campo', () => {
    render(
      <TextField
        label="Horas do certificado"
        hint="Confira no comprovante."
        error="Digite as horas que aparecem no certificado, por exemplo 40."
      />,
    )

    const campo = screen.getByLabelText('Horas do certificado')
    expect(campo).toHaveAccessibleDescription(
      'Confira no comprovante. Digite as horas que aparecem no certificado, por exemplo 40.',
    )
    expect(campo).toBeInvalid()
  })

  it('a ação interna não envia o formulário', () => {
    render(<TextField label="Senha" action={{ label: 'Mostrar', onClick: () => undefined }} />)

    expect(screen.getByRole('button', { name: 'Mostrar' })).toHaveAttribute('type', 'button')
  })
})
