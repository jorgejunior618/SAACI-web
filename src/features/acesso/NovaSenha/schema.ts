// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import * as v from 'valibot'

import { PasswordSchema } from '@/features/acesso/_components/PasswordRules/utils'

/** Campo do formulário de Nova senha: a senha, com as mesmas regras do cadastro. */
export const NewPasswordSchema = v.object({ password: PasswordSchema })

/** Valores do formulário de Nova senha como a pessoa digita, antes da validação. */
export type NewPasswordInput = v.InferInput<typeof NewPasswordSchema>
/** Valores do formulário de Nova senha depois da validação, já limpos pelo schema. */
export type NewPasswordOutput = v.InferOutput<typeof NewPasswordSchema>
