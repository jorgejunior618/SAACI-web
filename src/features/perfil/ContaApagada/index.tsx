'use client'

import { Check } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'

import { ButtonLink, Screen, StateScreen } from '@design-system'

import { ROUTES } from '@/constants/routes'

export function ContaApagada(): ReactNode {
  const email = useSearchParams().get('email')

  return (
    <Screen isCentered label="Conta apagada">
      <StateScreen
        icon={Check}
        title="Sua conta foi apagada"
        headingLevel="h1"
        actions={
          <ButtonLink href={ROUTES.login} variant="secondary" isBlock>
            Voltar ao início
          </ButtonLink>
        }
      >
        <p>
          As atividades e os comprovantes saem de todos os sistemas, inclusive das cópias de
          segurança, em até [PRAZO DO RNF05].
        </p>
        {email && <p>Mandamos uma confirmação para {email}.</p>}
      </StateScreen>
    </Screen>
  )
}
