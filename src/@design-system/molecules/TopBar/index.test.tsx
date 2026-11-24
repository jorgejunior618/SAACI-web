// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TopBar } from './index'

describe('TopBar', () => {
  describe('interna', () => {
    it('tem um único h1 com o título', () => {
      render(<TopBar variant="inner" title="Registrar atividade" />)

      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Registrar atividade')
    })

    it('com backHref, o Voltar é um link com nome acessível', () => {
      render(<TopBar variant="inner" title="Registrar" backHref="/inicio" />)

      expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute('href', '/inicio')
    })

    it('com onBack, o Voltar é um botão que chama a ação', async () => {
      const onBack = vi.fn()
      render(<TopBar variant="inner" title="Registrar" onBack={onBack} />)

      await userEvent.click(screen.getByRole('button', { name: 'Voltar' }))

      expect(onBack).toHaveBeenCalledOnce()
    })

    it('sem backHref nem onBack não há Voltar', () => {
      render(<TopBar variant="inner" title="Detalhe" />)

      expect(screen.queryByRole('link', { name: 'Voltar' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Voltar' })).not.toBeInTheDocument()
    })
  })

  describe('aba', () => {
    it('tem um único h1 com o título da aba', () => {
      render(<TopBar variant="root" title="Atividades" />)

      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Atividades')
    })

    it('não tem Voltar', () => {
      render(<TopBar variant="root" title="Perfil" />)

      expect(screen.queryByRole('link', { name: 'Voltar' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Voltar' })).not.toBeInTheDocument()
    })
  })

  describe('início', () => {
    it('mostra só o nome do app, sem Perfil nem Sair', () => {
      render(<TopBar variant="home" />)

      expect(screen.getByText('SAACI')).toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('não tem h1: o título da tela é do conteúdo', () => {
      render(<TopBar variant="home" />)

      expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    })
  })
})
