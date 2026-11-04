'use client'

import { useState } from 'react'

type MostrarSenha = {
  type: 'password' | 'text'
  action: { label: string; onClick: () => void }
}

// Ação "Mostrar"/"Ocultar" dos campos de senha.
export function useMostrarSenha(): MostrarSenha {
  const [isVisivel, setIsVisivel] = useState(false)

  return {
    type: isVisivel ? 'text' : 'password',
    action: { label: isVisivel ? 'Ocultar' : 'Mostrar', onClick: () => setIsVisivel((v) => !v) },
  }
}
