import { Check } from 'lucide-react'
import type { ReactNode } from 'react'

import { avaliarSenha } from '@/utils/validacoes'

import * as S from './styles'

// Regras ao vivo, acima do campo. Pendente diz quanto falta.
export function PasswordRules({ password, id }: { password: string; id?: string }): ReactNode {
  const { faltamCaracteres, hasLetraENumero } = avaliarSenha(password)
  const rules = [
    { text: 'Uma letra e um número', isOk: hasLetraENumero },
    {
      text:
        faltamCaracteres === 0
          ? 'Pelo menos 8 caracteres'
          : `Pelo menos 8 caracteres, ${faltamCaracteres === 1 ? 'falta 1' : `faltam ${faltamCaracteres}`}`,
      isOk: faltamCaracteres === 0,
    },
  ]

  return (
    <S.List id={id} aria-live="polite">
      {rules.map(({ text, isOk }) => (
        <li key={text.slice(0, 12)} className={S.rule({ isOk })}>
          <span className={S.mark({ isOk })} aria-hidden>
            {isOk && <Check size={11} strokeWidth={2.5} />}
          </span>
          {text}
        </li>
      ))}
    </S.List>
  )
}
