'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

export type Tema = 'auto' | 'claro' | 'escuro'

const STORAGE_KEY = 'saaci:tema'
const EVENTO = 'saaci:tema-mudou'
const MEDIA_ESCURO = '(prefers-color-scheme: dark)'

// Roda no <head> antes da primeira pintura, para a tela não piscar no tema errado.
export const themeInitScript = `(function(){try{var p=localStorage.getItem('${STORAGE_KEY}')||'auto';var d=p==='escuro'||(p==='auto'&&window.matchMedia('${MEDIA_ESCURO}').matches);document.documentElement.dataset.theme=d?'dark':'light'}catch(e){}})()`

function lerTema(): Tema {
  const salvo = window.localStorage.getItem(STORAGE_KEY)
  return salvo === 'claro' || salvo === 'escuro' ? salvo : 'auto'
}

function aplicarTema(tema: Tema): void {
  const isEscuro = tema === 'escuro' || (tema === 'auto' && window.matchMedia(MEDIA_ESCURO).matches)
  document.documentElement.dataset.theme = isEscuro ? 'dark' : 'light'
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(EVENTO, callback)
  return () => window.removeEventListener(EVENTO, callback)
}

function lerTemaAplicado(): 'claro' | 'escuro' {
  return document.documentElement.dataset.theme === 'dark' ? 'escuro' : 'claro'
}

// O tema que está na tela agora, já resolvido: no automático, depende do sistema.
export function useTemaAplicado(): 'claro' | 'escuro' {
  return useSyncExternalStore(subscribe, lerTemaAplicado, () => 'claro' as const)
}

export function useTema(): [Tema, (tema: Tema) => void] {
  const tema = useSyncExternalStore(subscribe, lerTema, () => 'auto' as const)

  const setTema = useCallback((novo: Tema) => {
    window.localStorage.setItem(STORAGE_KEY, novo)
    aplicarTema(novo)
    window.dispatchEvent(new Event(EVENTO))
  }, [])

  return [tema, setTema]
}

// No automático, acompanha a troca de tema do celular com o app aberto.
export function useSincronizarTemaDoSistema(): void {
  useEffect(() => {
    const media = window.matchMedia(MEDIA_ESCURO)
    const onChange = (): void => {
      if (lerTema() !== 'auto') return
      aplicarTema('auto')
      window.dispatchEvent(new Event(EVENTO))
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
}
