'use client'

import { Moon, Sun } from 'lucide-react'
import type { ReactNode } from 'react'

import { useTema, useTemaAplicado } from '@/providers/theme'

import { Icon } from '../Icon'
import { IconButton } from '../IconButton'
import * as S from './styles'

// Liga e desliga o modo escuro. Troca a preferência para Claro ou Escuro; o Automático continua no
// Perfil. Só ícone, então o nome vai no aria-label.
export function ThemeToggle(): ReactNode {
  const [, setTema] = useTema()
  const isEscuro = useTemaAplicado() === 'escuro'

  return (
    <IconButton
      className={S.position}
      aria-label={isEscuro ? 'Desativar modo escuro' : 'Ativar modo escuro'}
      aria-pressed={isEscuro}
      onClick={() => setTema(isEscuro ? 'claro' : 'escuro')}
    >
      <Icon icon={isEscuro ? Sun : Moon} />
    </IconButton>
  )
}
