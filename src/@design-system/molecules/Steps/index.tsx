import { Flag } from 'lucide-react'
import type { ReactNode } from 'react'

import * as S from './styles'

export type Step = {
  title?: string
  description: string
  isCurrent?: boolean
  // Último passo com bandeira, em vez de número.
  isGoal?: boolean
  // Conteúdo próprio do passo atual (cartão com ação).
  content?: ReactNode
}

type Props = {
  steps: readonly Step[]
  // Numeração do primeiro passo, para listas que continuam outra ("2", "3").
  start?: number
  size?: 'md' | 'sm'
}

export function Steps({ steps, start = 1, size = 'md' }: Props): ReactNode {
  return (
    <S.List start={start}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1

        return (
          <li key={step.title ?? step.description} className={S.step({ size })}>
            <S.Rail>
              <span className={S.dot({ size, isCurrent: step.isCurrent })} aria-hidden>
                {step.isGoal ? <Flag size={16} strokeWidth={1.5} /> : start + index}
              </span>
              {size === 'md' && !isLast && <S.Line />}
            </S.Rail>
            {step.content ?? (
              <S.Body>
                {step.title && <S.Title>{step.title}</S.Title>}
                <S.Description>{step.description}</S.Description>
              </S.Body>
            )}
          </li>
        )
      })}
    </S.List>
  )
}
