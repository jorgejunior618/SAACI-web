// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ItemPickerItem } from '@design-system'

/** Itens de exemplo, na ordem do formulário do curso. */
export const items: ItemPickerItem[] = [
  { number: 6, name: 'Curso de línguas', rule: '1h para cada 4h de curso, até 60h' },
  {
    number: 7,
    name: 'Curso na área de engenharia de computação',
    rule: '1h para cada 4h de curso, até 60h',
  },
  {
    number: 8,
    name: 'Curso fora da área de engenharia de computação',
    rule: '1h para cada 6h de curso, até 40h',
  },
  {
    number: 9,
    name: 'Ministrar curso na área de engenharia da computação',
    rule: '2h para cada 1h de curso, até 60h',
  },
  { number: 12, name: 'Evento científico', rule: 'Congresso ou semana acadêmica, até 40h' },
  { number: 13, name: 'Palestra como ouvinte', rule: 'Cada palestra conta 2h, até 30h' },
]
