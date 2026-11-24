// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ChoiceOption } from '@design-system'

/** Opções de autoria usadas nos exemplos da galeria. */
export const AUTHOR_OPTIONS: ChoiceOption[] = [
  { value: 'primeiro', label: '1º autor', effect: 'Conta a carga completa' },
  { value: 'segundo', label: '2º autor', effect: 'Conta metade' },
  { value: 'outro', label: 'Outro', effect: 'Conta 1/3' },
]
