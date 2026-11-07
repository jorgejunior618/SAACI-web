import { render, screen } from '@testing-library/react'
import { ClipboardList, File, House, Plus } from 'lucide-react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { BottomNav } from './index'
import type { BottomNavProps } from './index'

const items: BottomNavProps['items'] = [
  { id: 'inicio', label: 'Início', href: '/inicio', icon: House },
  { id: 'registrar', label: 'Registrar', href: '/registrar', icon: Plus },
  { id: 'certificados', label: 'Certificados', href: '/certificados', icon: File },
  { id: 'formulario', label: 'Formulário', href: '/formulario', icon: ClipboardList },
]

describe('BottomNav', () => {
  it('mostra os quatro destinos, cada um com o rótulo como nome acessível', () => {
    render(<BottomNav items={items} activeId="inicio" />)

    expect(screen.getAllByRole('link')).toHaveLength(4)
    for (const { label, href } of items) {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href)
    }
  })

  it('marca só o destino ativo com aria-current="page"', () => {
    const { container } = render(<BottomNav items={items} activeId="certificados" />)

    expect(container.querySelectorAll('[aria-current]')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Certificados' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('com um activeId que não existe, nenhum destino fica ativo', () => {
    const { container } = render(<BottomNav items={items} activeId="perfil" />)

    expect(container.querySelector('[aria-current]')).not.toBeInTheDocument()
  })

  it('a região se chama "Principal" e o nome pode ser trocado', () => {
    const { rerender } = render(<BottomNav items={items} activeId="inicio" />)

    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()

    rerender(<BottomNav items={items} activeId="inicio" aria-label="Menu do aluno" />)

    expect(screen.getByRole('navigation', { name: 'Menu do aluno' })).toBeInTheDocument()
  })

  it('desenha os links com o componente passado em linkAs', () => {
    function RouterLink({ children, ...rest }: ComponentPropsWithoutRef<'a'>): ReactNode {
      return (
        <a data-router {...rest}>
          {children}
        </a>
      )
    }

    const { container } = render(<BottomNav items={items} activeId="inicio" linkAs={RouterLink} />)

    expect(container.querySelectorAll('a[data-router]')).toHaveLength(4)
  })
})
