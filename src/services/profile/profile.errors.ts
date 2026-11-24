// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

/**
 * SQLSTATE que o gatilho `trava_troca_de_curso` lança quando o aluno troca de curso com atividades
 * (RF10). Está na migration `perfis`, e é por ele que o erro é reconhecido, não pelo texto.
 */
const COURSE_LOCKED_CODE = 'SA010'

/**
 * O aluno tem atividades registradas e tentou trocar de curso (RF10). A regra também vale no banco.
 * A tela mostra os dois caminhos: remover as atividades ou apagar a conta e começar de novo.
 */
export class CourseLockedError extends Error {
  constructor() {
    super('Com atividades registradas, o curso fica travado.')
    this.name = 'CursoTravadoError'
  }
}

/**
 * Traduz o erro do banco para o erro de domínio do perfil, quando conhece a causa.
 *
 * @remarks
 * Só traduz o que conhece. Erro de rede ou qualquer outro volta intacto, para uma falha de conexão
 * nunca virar "o curso está travado" na tela.
 *
 * @param error Erro devolvido pelo `supabase-js`.
 * @returns `CourseLockedError` para o SQLSTATE `SA010`, ou o próprio `error` nos demais casos.
 *
 * @example
 * if (error) throw toProfileError(error)
 */
export function toProfileError<E extends { code?: string }>(error: E): CourseLockedError | E {
  return error.code === COURSE_LOCKED_CODE ? new CourseLockedError() : error
}
