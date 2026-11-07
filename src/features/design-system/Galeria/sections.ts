import type { ReactNode } from 'react'

import { BadgeSection } from './_components/BadgeSection'
import { ButtonSection } from './_components/ButtonSection'
import { CardSection } from './_components/CardSection'
import { ChoiceGroupSection } from './_components/ChoiceGroupSection'
import { Colors } from './_components/Colors'
import { FileUploadSection } from './_components/FileUploadSection'
import { IconSection } from './_components/IconSection'
import { Layout } from './_components/Layout'
import { LinkSection } from './_components/LinkSection'
import { NoticeSection } from './_components/NoticeSection'
import { ProgressBarSection } from './_components/ProgressBarSection'
import { SpinnerSection } from './_components/SpinnerSection'
import { TextFieldSection } from './_components/TextFieldSection'
import { TextStyles } from './_components/TextStyles'

/** Grupo da sidebar em que a seção aparece. */
export type SectionGroup = 'Fundamentos' | 'Atoms' | 'Molecules'

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
export const sectionGroups: SectionGroup[] = ['Fundamentos', 'Atoms', 'Molecules']

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
  { id: 'badge', title: 'Badge', group: 'Atoms', Component: BadgeSection },
  { id: 'button', title: 'Button', group: 'Atoms', Component: ButtonSection },
  { id: 'link', title: 'Link', group: 'Atoms', Component: LinkSection },
  { id: 'card', title: 'Card', group: 'Atoms', Component: CardSection },
  { id: 'icon', title: 'Icon', group: 'Atoms', Component: IconSection },
  { id: 'spinner', title: 'Spinner', group: 'Atoms', Component: SpinnerSection },
  { id: 'progress-bar', title: 'ProgressBar', group: 'Atoms', Component: ProgressBarSection },
  { id: 'text-field', title: 'TextField', group: 'Molecules', Component: TextFieldSection },
  { id: 'choice-group', title: 'ChoiceGroup', group: 'Molecules', Component: ChoiceGroupSection },
  { id: 'file-upload', title: 'FileUpload', group: 'Molecules', Component: FileUploadSection },
  { id: 'notice', title: 'Notice', group: 'Molecules', Component: NoticeSection },
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
