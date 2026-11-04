'use client'

import { useEffect, useState } from 'react'

// Relógio que atualiza a cada intervalo, para contagens regressivas na tela.
export function useAgora(intervaloMs = 1000): number {
  const [agora, setAgora] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setAgora(Date.now()), intervaloMs)
    return () => clearInterval(timer)
  }, [intervaloMs])

  return agora
}
