// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { redirect } from 'next/navigation'

import { sections } from '@/features/design-system/Galeria'

export default function Page(): never {
  redirect(`/design-system/${sections[0].id}`)
}
