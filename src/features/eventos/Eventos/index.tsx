import { CalendarCheck } from 'lucide-react'
import type { ReactNode } from 'react'

import { ButtonLink, Screen, StateScreen, TopBar } from '@design-system'

import { ROUTES } from '@/constants/routes'

// Aba prevista no design, fora do MVP (Marco 2).
export function Eventos(): ReactNode {
  return (
    <Screen topBar={<TopBar variant="tab" title="Eventos" />} isCentered>
      <StateScreen
        icon={CalendarCheck}
        iconTone="brand"
        caption="Em construção"
        title="Eventos está chegando"
        actions={
          <ButtonLink href={ROUTES.painel} variant="secondary" isBlock>
            Voltar ao Início
          </ButtonLink>
        }
      >
        <p>
          Em breve você vai ver aqui palestras, cursos e eventos que contam horas, com o item e
          quanto cada um vale.
        </p>
      </StateScreen>
    </Screen>
  )
}
