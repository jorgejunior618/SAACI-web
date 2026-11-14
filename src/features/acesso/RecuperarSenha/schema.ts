import * as v from 'valibot'

import { StudentEmailSchema } from '@/services/account'

/** Campo do formulário de Recuperar senha: o e-mail de aluno (RF02). */
export const RecoverSchema = v.object({ email: StudentEmailSchema })

/** Valores do formulário de Recuperar senha como a pessoa digita, antes da validação. */
export type RecoverInput = v.InferInput<typeof RecoverSchema>
/** Valores do formulário de Recuperar senha depois da validação, já limpos pelo schema. */
export type RecoverOutput = v.InferOutput<typeof RecoverSchema>
