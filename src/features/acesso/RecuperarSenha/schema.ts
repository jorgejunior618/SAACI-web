import * as v from 'valibot'

import { StudentEmailSchema } from '@/services/account'

/** Campo do formulário de Recuperar senha: o e-mail de aluno (RF02). */
export const RecoverSchema = v.object({ email: StudentEmailSchema })

export type RecoverInput = v.InferInput<typeof RecoverSchema>
export type RecoverOutput = v.InferOutput<typeof RecoverSchema>
