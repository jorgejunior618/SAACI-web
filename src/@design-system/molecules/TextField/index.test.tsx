// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Search } from 'lucide-react'
import { describe, expect, it } from 'vitest'

import { TextField } from './index'

describe('TextField', () => {
  it('liga o rótulo ao campo e a regra ao aria-describedby', () => {
    render(<TextField label="Semestre de início" hint="Só contam atividades a partir daqui." />)

    const input = screen.getByLabelText('Semestre de início')

    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).toHaveAccessibleDescription('Só contam atividades a partir daqui.')
  })

  it('com erro marca aria-invalid e liga a mensagem ao campo', () => {
    render(
      <TextField
        label="E-mail de aluno"
        hint="Use o e-mail do IFCE."
        error="Use o e-mail que termina em @aluno.ifce.edu.br"
      />,
    )

    const input = screen.getByLabelText('E-mail de aluno')

    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription(
      'Use o e-mail do IFCE. Use o e-mail que termina em @aluno.ifce.edu.br',
    )
  })

  it('põe o erro entre o rótulo e o campo', () => {
    render(<TextField label="E-mail de aluno" error="Confira o e-mail." />)

    const label = screen.getByText('E-mail de aluno')
    const error = screen.getByText('Confira o e-mail.')
    const input = screen.getByLabelText('E-mail de aluno')

    expect(label.compareDocumentPosition(error) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(error.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('não limpa o valor depois de um erro', () => {
    render(<TextField label="E-mail" error="Confira o e-mail." defaultValue="maria@gmail.com" />)

    expect(screen.getByLabelText('E-mail')).toHaveValue('maria@gmail.com')
  })

  it('escreve (opcional) no rótulo', () => {
    render(<TextField label="Observação" optional />)

    expect(screen.getByLabelText('Observação (opcional)')).toBeInTheDocument()
  })

  it('no estado read mostra o selo e o liga ao campo', () => {
    render(<TextField label="Nome da atividade" status="read" defaultValue="Semana 2025" />)

    expect(screen.getByLabelText('Nome da atividade')).toHaveAccessibleDescription(
      'Lido do certificado, confira',
    )
  })

  it('no estado unread mostra a frase e o campo vazio', () => {
    render(
      <TextField
        label="Data de término"
        status="unread"
        unreadMessage="Não conseguimos ler a data. Digite-a."
      />,
    )

    const input = screen.getByLabelText('Data de término')

    expect(input).toHaveValue('')
    expect(input).toHaveAccessibleDescription('Não conseguimos ler a data. Digite-a.')
  })

  it('com erro o selo de leitura sai de cena e só o erro descreve o campo', () => {
    render(<TextField label="Nome" status="read" error="Preencha o nome." defaultValue="x" />)

    expect(screen.queryByText('Lido do certificado, confira')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveAccessibleDescription('Preencha o nome.')
  })

  it('Mostrar/Ocultar troca o type e o aria-pressed', async () => {
    render(<TextField label="Senha" type="password" defaultValue="senhaforte" />)

    const input = screen.getByLabelText('Senha')
    const toggle = screen.getByRole('button', { name: 'Mostrar' })

    expect(input).toHaveAttribute('type', 'password')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(toggle)

    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Ocultar' })).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(screen.getByRole('button', { name: 'Ocultar' }))

    expect(input).toHaveAttribute('type', 'password')
  })

  it('com icon desenha o ícone escondido do leitor de tela e mantém o rótulo como nome', () => {
    const { container } = render(<TextField label="Buscar" type="search" icon={Search} />)

    expect(screen.getByLabelText('Buscar')).toBeInTheDocument()
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('sem icon não desenha ícone', () => {
    const { container } = render(<TextField label="Buscar" />)

    expect(container.querySelector('svg')).toBeNull()
  })

  it('sem type="password" não mostra o botão', () => {
    render(<TextField label="Nome" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
