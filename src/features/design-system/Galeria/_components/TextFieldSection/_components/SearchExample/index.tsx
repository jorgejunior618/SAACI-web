'use client'

import { Search } from 'lucide-react'
import type { ReactNode } from 'react'

import { TextField } from '@design-system'

/**
 * Busca com lupa. Fica num componente de cliente porque o ícone do Lucide é um objeto e não
 * atravessa a fronteira entre Server e Client Component: quem passa `icon` ao `TextField` precisa
 * estar no cliente, como já estão as telas com formulário.
 */
export function SearchExample(): ReactNode {
  return <TextField label="Buscar item" type="search" icon={Search} placeholder="ex.: palestra" />
}
