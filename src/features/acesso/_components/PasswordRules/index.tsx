// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { Check } from 'lucide-react'
import type { ReactNode } from 'react'

import { Icon } from '@design-system'

import { getMissingPasswordLength, PASSWORD_RULES } from './utils'
import * as S from './styles'

export type PasswordRulesProps = {
  /** Id da lista. O campo de senha o liga por `aria-describedby`. */
  id: string
  /** Senha digitada até agora. A lista se atualiza a cada letra. */
  password: string
}

/**
 * Lista as regras da senha e mostra quais já valem.
 *
 * @remarks
 * Cumprida aparece em `brand.text` com check, pendente em `warning`. Fica abaixo do campo e é lida
 * com `aria-live="polite"`, porque o `hint` do `TextField` só aceita texto. As regras vêm de
 * `PASSWORD_RULES`, a mesma fonte do `PasswordSchema`.
 *
 * @example
 * ```tsx
 * <PasswordRules id="senha-regras" password={password} />
 * ```
 */
export function PasswordRules({ id, password }: PasswordRulesProps): ReactNode {
  const missing = getMissingPasswordLength(password)

  return (
    <S.List id={id} aria-live="polite">
      {PASSWORD_RULES.map((rule) => {
        const isMet = rule.isMet(password)
        const showMissing = rule.id === 'minLength' && missing > 0

        return (
          <S.Rule key={rule.id} met={isMet}>
            <S.Mark met={isMet}>{isMet ? <Icon icon={Check} size="sm" /> : null}</S.Mark>
            <span>
              <span className={S.hidden}>{isMet ? 'Cumprida: ' : 'Falta: '}</span>
              {rule.label}
              {showMissing ? `, ${missing === 1 ? 'falta 1' : `faltam ${missing}`}` : null}
            </span>
          </S.Rule>
        )
      })}
    </S.List>
  )
}
