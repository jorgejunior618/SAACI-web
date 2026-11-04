'use client'

import type { ReactNode } from 'react'

import { type Tema, useTema } from '@/providers/theme'

import * as S from './styles'

const OPCOES: readonly { value: Tema; label: string }[] = [
  { value: 'auto', label: 'Automático' },
  { value: 'claro', label: 'Claro' },
  { value: 'escuro', label: 'Escuro' },
]

// Controle segmentado com radios de verdade, escondidos.
export function Aparencia(): ReactNode {
  const [tema, setTema] = useTema()

  return (
    <S.Track aria-label="Aparência">
      {OPCOES.map((opcao) => (
        <label key={opcao.value} className={S.option}>
          <input
            type="radio"
            name="tema"
            value={opcao.value}
            checked={tema === opcao.value}
            onChange={() => setTema(opcao.value)}
            className={S.input}
          />
          {opcao.label}
        </label>
      ))}
    </S.Track>
  )
}
