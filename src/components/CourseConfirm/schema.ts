// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import * as v from 'valibot'

import { StartSemesterFormSchema } from '@/utils/start-semester'

/** Campos do formulário de confirmação do curso: só o semestre em que a pessoa entrou. */
export const CourseConfirmSchema = v.object({ startSemester: StartSemesterFormSchema })

/** Valores do formulário de confirmação como a pessoa digita, antes da validação. */
export type CourseConfirmInput = v.InferInput<typeof CourseConfirmSchema>
/** Valores do formulário de confirmação depois da validação, já limpos pelo schema. */
export type CourseConfirmOutput = v.InferOutput<typeof CourseConfirmSchema>
