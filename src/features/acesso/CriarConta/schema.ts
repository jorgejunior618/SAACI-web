// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import * as v from 'valibot'

import { PasswordSchema } from '@/features/acesso/_components/PasswordRules/utils'
import { StudentEmailSchema } from '@/services/account'

/** Campos do formulário de Criar conta: e-mail de aluno (RF02) e senha com as regras de `PasswordRules`. */
export const SignUpSchema = v.object({
  email: StudentEmailSchema,
  password: PasswordSchema,
})

/** Valores do formulário de Criar conta como a pessoa digita, antes da validação. */
export type SignUpInput = v.InferInput<typeof SignUpSchema>
/** Valores do formulário de Criar conta depois da validação, já limpos pelo schema. */
export type SignUpOutput = v.InferOutput<typeof SignUpSchema>
