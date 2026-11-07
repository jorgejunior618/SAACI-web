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
      render(<TopBar variant="inner" title="Certificados" />)

      expect(screen.queryByRole('link', { name: 'Voltar' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Voltar' })).not.toBeInTheDocument()
    })
  })

  describe('início', () => {
    it('mostra o nome do app, o Perfil com nome acessível e Sair escrito', () => {
      render(<TopBar variant="home" profileHref="/perfil" onSignOut={() => undefined} />)

      expect(screen.getByText('SAACI')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Perfil' })).toHaveAttribute('href', '/perfil')
      expect(screen.getByRole('button', { name: 'Sair' })).toHaveTextContent('Sair')
    })

    it('Sair chama onSignOut', async () => {
      const onSignOut = vi.fn()
      render(<TopBar variant="home" profileHref="/perfil" onSignOut={onSignOut} />)

      await userEvent.click(screen.getByRole('button', { name: 'Sair' }))

      expect(onSignOut).toHaveBeenCalledOnce()
    })

    it('não tem h1: o título da tela é do conteúdo', () => {
      render(<TopBar variant="home" profileHref="/perfil" onSignOut={() => undefined} />)

      expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    })
  })
})
