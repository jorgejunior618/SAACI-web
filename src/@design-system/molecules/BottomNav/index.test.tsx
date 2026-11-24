// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { render, screen } from '@testing-library/react'
import { CalendarCheck, House, ListChecks, Plus, User } from 'lucide-react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { BottomNav } from './index'
import type { BottomNavProps } from './index'

const items: BottomNavProps['items'] = [
  { id: 'inicio', label: 'Início', href: '/inicio', icon: House },
  { id: 'atividades', label: 'Atividades', href: '/atividades', icon: ListChecks },
  { id: 'eventos', label: 'Eventos', href: '/eventos', icon: CalendarCheck },
  { id: 'perfil', label: 'Perfil', href: '/perfil', icon: User },
]

const action: BottomNavProps['action'] = { label: 'Registrar', href: '/registrar', icon: Plus }

describe('BottomNav', () => {
  it('mostra as quatro abas e a ação, cada uma com o rótulo como nome acessível', () => {
    render(<BottomNav items={items} action={action} activeId="inicio" />)

    expect(screen.getAllByRole('link')).toHaveLength(5)
    for (const { label, href } of [...items, action]) {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href)
    }
  })

  it('põe a ação entre a segunda e a terceira aba', () => {
    render(<BottomNav items={items} action={action} activeId="inicio" />)

    const labels = screen.getAllByRole('link').map((link) => link.textContent)

    expect(labels).toEqual(['Início', 'Atividades', 'Registrar', 'Eventos', 'Perfil'])
  })

  it('marca só a aba ativa com aria-current="page"', () => {
    const { container } = render(<BottomNav items={items} action={action} activeId="eventos" />)

    expect(container.querySelectorAll('[aria-current]')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Eventos' })).toHaveAttribute('aria-current', 'page')
  })

  it('a ação nunca fica ativa, mesmo com o activeId igual ao rótulo dela', () => {
    render(<BottomNav items={items} action={action} activeId="registrar" />)

    expect(screen.getByRole('link', { name: 'Registrar' })).not.toHaveAttribute('aria-current')
  })

  it('com um activeId que não existe, nenhuma aba fica ativa', () => {
    const { container } = render(<BottomNav items={items} action={action} activeId="mapa" />)

    expect(container.querySelector('[aria-current]')).not.toBeInTheDocument()
  })

  it('a região se chama "Principal" e o nome pode ser trocado', () => {
    const { rerender } = render(<BottomNav items={items} action={action} activeId="inicio" />)

    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()

    rerender(
      <BottomNav items={items} action={action} activeId="inicio" aria-label="Menu do aluno" />,
    )

    expect(screen.getByRole('navigation', { name: 'Menu do aluno' })).toBeInTheDocument()
  })

  it('desenha os links, ação incluída, com o componente passado em linkAs', () => {
    function RouterLink({ children, ...rest }: ComponentPropsWithoutRef<'a'>): ReactNode {
      return (
        <a data-router {...rest}>
          {children}
        </a>
      )
    }

    const { container } = render(
      <BottomNav items={items} action={action} activeId="inicio" linkAs={RouterLink} />,
    )

    expect(container.querySelectorAll('a[data-router]')).toHaveLength(5)
  })
})
