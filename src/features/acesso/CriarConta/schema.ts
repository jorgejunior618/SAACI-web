import * as v from 'valibot'

import { PasswordSchema } from '@/features/acesso/_components/PasswordRules/utils'
import { StudentEmailSchema } from '@/services/account'

/** Campos do formulário de Criar conta: e-mail de aluno (RF02) e senha com as regras de `PasswordRules`. */
export const SignUpSchema = v.object({
  email: StudentEmailSchema,
  password: PasswordSchema,
})

export type SignUpInput = v.InferInput<typeof SignUpSchema>
export type SignUpOutput = v.InferOutput<typeof SignUpSchema>
