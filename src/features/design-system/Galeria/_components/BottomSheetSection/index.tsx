// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { Section } from '../Section'
import { Demo } from './_components/Demo'

/** Página "BottomSheet" da galeria: abre o sheet de confirmação e mostra o que a tela recebe. */
export function BottomSheetSection(): ReactNode {
  return (
    <Section
      title="BottomSheet"
      description="Confirmação que sobe da base antes de apagar algo. Foco no título ao abrir e de volta a quem abriu ao fechar; Esc e toque no véu fecham sem fazer nada. É o único componente com sombra."
    >
      <Demo />
    </Section>
  )
}
