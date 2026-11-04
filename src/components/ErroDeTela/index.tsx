'use client'

import { CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button, StateScreen } from '@design-system'

type Props = {
  reset: () => void
}

export function ErroDeTela({ reset }: Props): ReactNode {
  return (
    <StateScreen
      icon={CircleAlert}
      iconTone="danger"
      title="Não deu para abrir esta tela"
      headingLevel="h1"
      actions={
        <Button isBlock onClick={reset}>
          Tentar de novo
        </Button>
      }
    >
      <p>
        Pode ser a sua internet. Confira a conexão e tente de novo. Nada do que você salvou se
        perdeu.
      </p>
    </StateScreen>
  )
}
