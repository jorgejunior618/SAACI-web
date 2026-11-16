import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FileUpload } from './index'

const ACCEPT = ['application/pdf', 'image/jpeg', 'image/png']

function makeFile(name: string, type: string, size: number): File {
  const file = new File(['x'], name, { type })

  Object.defineProperty(file, 'size', { value: size })

  return file
}

function setup(props: Partial<React.ComponentProps<typeof FileUpload>> = {}) {
  const onSelect = vi.fn()
  const onReplace = vi.fn()
  // `applyAccept: false` deixa o teste enviar um tipo recusado, como o navegador pode fazer.
  const user = userEvent.setup({ applyAccept: false })
  const view = render(
    <FileUpload
      label="Comprovante"
      hint="PDF, JPG ou PNG, até 10 MB."
      accept={ACCEPT}
      maxSizeMb={10}
      notice="Um serviço de IA lê o seu comprovante."
      privacyLinkLabel="Saiba o que guardamos"
      privacyHref="/privacidade"
      onSelect={onSelect}
      onReplace={onReplace}
      {...props}
    />,
  )
  const fileInput = view.container.querySelector<HTMLInputElement>(
    'input[type="file"]:not([capture])',
  )

  if (!fileInput) throw new Error('input de arquivo não encontrado')

  return { onSelect, onReplace, user, fileInput }
}

describe('FileUpload', () => {
  it('vazio mostra a dica, os dois botões e o link de privacidade', () => {
    setup()

    expect(screen.getByText('PDF, JPG ou PNG, até 10 MB.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tirar foto do comprovante' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Escolher arquivo' })).toBeInTheDocument()
    expect(screen.getByText(/Um serviço de IA lê o seu comprovante/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Saiba o que guardamos' })).toHaveAttribute(
      'href',
      '/privacidade',
    )
    expect(screen.getByRole('group', { name: 'Comprovante' })).toBeInTheDocument()
  })

  it('entrega o arquivo válido e não mostra erro', async () => {
    const { onSelect, user, fileInput } = setup()
    const file = makeFile('certificado.pdf', 'application/pdf', 1024)

    await user.upload(fileInput, file)

    expect(onSelect).toHaveBeenCalledWith(file)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('rejeita tipo não aceito, mostra a frase e não entrega o arquivo', async () => {
    const { onSelect, user, fileInput } = setup()

    await user.upload(fileInput, makeFile('animacao.gif', 'image/gif', 1024))

    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Esse tipo de arquivo não funciona aqui. Envie em PDF, JPG ou PNG.',
    )
  })

  it('rejeita arquivo acima do limite e diz o limite', async () => {
    const { onSelect, user, fileInput } = setup({ maxSizeMb: 10 })

    await user.upload(fileInput, makeFile('grande.pdf', 'application/pdf', 11 * 1024 * 1024))

    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('o limite é 10 MB')
  })

  it('rejeita arquivo vazio', async () => {
    const { onSelect, user, fileInput } = setup()

    await user.upload(fileInput, makeFile('vazio.pdf', 'application/pdf', 0))

    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('vazio')
  })

  it('apaga o erro quando a pessoa escolhe um arquivo válido em seguida', async () => {
    const { onSelect, user, fileInput } = setup()

    await user.upload(fileInput, makeFile('animacao.gif', 'image/gif', 1024))
    expect(screen.getByRole('alert')).toBeInTheDocument()

    await user.upload(fileInput, makeFile('certificado.pdf', 'application/pdf', 1024))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('com arquivo mostra nome inteiro, tamanho e Trocar no lugar dos botões', async () => {
    const { onReplace, user } = setup({
      file: makeFile(
        'certificado-semana-engenharia-2025.pdf',
        'application/pdf',
        1.2 * 1024 * 1024,
      ),
    })

    expect(screen.getByText('certificado-semana-engenharia-2025.pdf')).toHaveAttribute(
      'title',
      'certificado-semana-engenharia-2025.pdf',
    )
    expect(screen.getByText('1,2 MB')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Tirar foto do comprovante' }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Trocar' }))

    expect(onReplace).toHaveBeenCalledTimes(1)
  })

  it('o erro da tela vence e mantém o arquivo anexado', () => {
    setup({
      file: makeFile('certificado.pdf', 'application/pdf', 1024),
      error: 'A conexão caiu. O arquivo continua anexado; toque em Registrar de novo.',
    })

    expect(screen.getByText('certificado.pdf')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('O arquivo continua anexado')
  })
})
