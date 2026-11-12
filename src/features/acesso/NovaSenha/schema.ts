import * as v from 'valibot'

import { PasswordSchema } from '@/features/acesso/_components/PasswordRules/utils'

/** Campo do formulário de Nova senha: a senha, com as mesmas regras do cadastro. */
export const NewPasswordSchema = v.object({ password: PasswordSchema })

export type NewPasswordInput = v.InferInput<typeof NewPasswordSchema>
export type NewPasswordOutput = v.InferOutput<typeof NewPasswordSchema>
