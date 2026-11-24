// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { redirect } from 'next/navigation'

// A raiz leva ao painel. O SessionGate de `(aluno)` manda quem está sem sessão para /entrar.
export default function Page(): never {
  redirect('/inicio')
}
