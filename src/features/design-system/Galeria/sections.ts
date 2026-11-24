// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { ActivityRowSection } from './_components/ActivityRowSection'
import { AppFrameSection } from './_components/AppFrameSection'
import { BadgeSection } from './_components/BadgeSection'
import { BottomNavSection } from './_components/BottomNavSection'
import { BottomSheetSection } from './_components/BottomSheetSection'
import { ButtonSection } from './_components/ButtonSection'
import { CardSection } from './_components/CardSection'
import { CategoryCardSection } from './_components/CategoryCardSection'
import { ChoiceGroupSection } from './_components/ChoiceGroupSection'
import { Colors } from './_components/Colors'
import { DisclosureSection } from './_components/DisclosureSection'
import { FileUploadSection } from './_components/FileUploadSection'
import { IconSection } from './_components/IconSection'
import { ItemPickerSection } from './_components/ItemPickerSection'
import { Layout } from './_components/Layout'
import { LinkSection } from './_components/LinkSection'
import { NoticeSection } from './_components/NoticeSection'
import { ProgressBarSection } from './_components/ProgressBarSection'
import { RulePanelSection } from './_components/RulePanelSection'
import { SpinnerSection } from './_components/SpinnerSection'
import { StateScreenSection } from './_components/StateScreenSection'
import { SubmitBarSection } from './_components/SubmitBarSection'
import { SuggestionCardSection } from './_components/SuggestionCardSection'
import { TextFieldSection } from './_components/TextFieldSection'
import { TextStyles } from './_components/TextStyles'
import { TopBarSection } from './_components/TopBarSection'
import { TotalProgressSection } from './_components/TotalProgressSection'

/** Grupo da sidebar em que a seção aparece. */
export type SectionGroup = 'Fundamentos' | 'Atoms' | 'Molecules' | 'Organisms' | 'Templates'

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
export const sectionGroups: SectionGroup[] = [
  'Fundamentos',
  'Atoms',
  'Molecules',
  'Organisms',
  'Templates',
]

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
  { id: 'bottom-sheet', title: 'BottomSheet', group: 'Molecules', Component: BottomSheetSection },
  { id: 'state-screen', title: 'StateScreen', group: 'Molecules', Component: StateScreenSection },
  { id: 'top-bar', title: 'TopBar', group: 'Molecules', Component: TopBarSection },
  { id: 'bottom-nav', title: 'BottomNav', group: 'Molecules', Component: BottomNavSection },
  {
    id: 'total-progress',
    title: 'TotalProgress',
    group: 'Molecules',
    Component: TotalProgressSection,
  },
  {
    id: 'category-card',
    title: 'CategoryCard',
    group: 'Molecules',
    Component: CategoryCardSection,
  },
  { id: 'disclosure', title: 'Disclosure', group: 'Molecules', Component: DisclosureSection },
  { id: 'activity-row', title: 'ActivityRow', group: 'Molecules', Component: ActivityRowSection },
  { id: 'submit-bar', title: 'SubmitBar', group: 'Molecules', Component: SubmitBarSection },
  {
    id: 'suggestion-card',
    title: 'SuggestionCard',
    group: 'Molecules',
    Component: SuggestionCardSection,
  },
  { id: 'item-picker', title: 'ItemPicker', group: 'Organisms', Component: ItemPickerSection },
  { id: 'rule-panel', title: 'RulePanel', group: 'Organisms', Component: RulePanelSection },
  { id: 'app-frame', title: 'AppFrame', group: 'Templates', Component: AppFrameSection },
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
