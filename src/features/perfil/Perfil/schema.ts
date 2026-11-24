// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import * as v from 'valibot'

/**
 * Campo de matrícula do Perfil. É opcional: o campo em branco vira `null`, que apaga a matrícula.
 *
 * @remarks
 * Não confere formato, porque o número que entra no formulário da coordenação é o que a pessoa
 * digitar. Espaços nas pontas saem.
 */
export const EnrollmentFormSchema = v.pipe(
  v.string(),
  v.trim(),
  v.transform((text) => (text === '' ? null : text)),
)

/** Matrícula como a pessoa digita, antes da validação. */
export type EnrollmentInput = v.InferInput<typeof EnrollmentFormSchema>
/** Matrícula depois da validação: o texto limpo, ou `null` quando o campo ficou em branco. */
export type EnrollmentOutput = v.InferOutput<typeof EnrollmentFormSchema>

/** Tamanho máximo do nome no formulário da coordenação. Cabe numa linha do PDF. */
export const NAME_MAX_LENGTH = 120

/**
 * Campo de nome completo do Perfil. É obrigatório: o formulário da coordenação pede o nome.
 *
 * @remarks
 * Espaços nas pontas saem e os do meio se juntam em um só, para o nome do arquivo e o do formulário
 * não saírem com vão. Não confere o formato do nome. O PDF só aceita letras do alfabeto latino, com
 * ou sem acento, e quem barra o resto é a geração do PDF, com uma frase que manda conferir o nome.
 */
export const NameFormSchema = v.pipe(
  v.string(),
  v.trim(),
  v.transform((text) => text.replace(/\s+/g, ' ')),
  v.nonEmpty('Escreva o seu nome completo, como está nos seus documentos.'),
  v.maxLength(
    NAME_MAX_LENGTH,
    `Use até ${NAME_MAX_LENGTH} letras. Escreva o nome como está no documento.`,
  ),
)

/** Nome como a pessoa digita, antes da validação. */
export type NameInput = v.InferInput<typeof NameFormSchema>
/** Nome depois da validação: o texto limpo, nunca vazio. */
export type NameOutput = v.InferOutput<typeof NameFormSchema>
