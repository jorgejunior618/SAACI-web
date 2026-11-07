import type { ReactNode } from 'react'

import { Colors } from './_components/Colors'
import { Layout } from './_components/Layout'
import { TextStyles } from './_components/TextStyles'

/** Grupo da sidebar em que a seção aparece. */
export type SectionGroup = 'Fundamentos' | 'Atoms'

/** Uma página da galeria, aberta em `/design-system/<id>`. */
export type GallerySection = {
  /** Trecho da URL e âncora da seção, em minúsculas (`cores`, `button`). */
  id: string
  /** Nome exibido na sidebar. */
  title: string
  group: SectionGroup
  /** Página renderizada na área de conteúdo. */
  Component: () => ReactNode
}

/** Ordem dos grupos na sidebar. */
export const sectionGroups: SectionGroup[] = ['Fundamentos', 'Atoms']

/**
 * Páginas da galeria, na ordem em que aparecem.
 *
 * @remarks
 * Componente novo em `@design-system` entra aqui com a sua página, no mesmo commit do
 * `DS_REFERENCE.md`. A rota `[secao]` e a sidebar leem esta lista, então nada mais muda.
 */
export const sections: GallerySection[] = [
  { id: 'cores', title: 'Cores', group: 'Fundamentos', Component: Colors },
  { id: 'texto', title: 'Texto', group: 'Fundamentos', Component: TextStyles },
  { id: 'espaco', title: 'Espaço e forma', group: 'Fundamentos', Component: Layout },
]

/**
 * Procura uma seção pelo trecho da URL.
 *
 * @param id Valor de `[secao]` na rota.
 * @returns A seção, ou `undefined` quando o id não existe.
 */
export function findSection(id: string): GallerySection | undefined {
  return sections.find((section) => section.id === id)
}
