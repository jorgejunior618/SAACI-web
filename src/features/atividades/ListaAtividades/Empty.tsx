import { ListChecks } from 'lucide-react'
import type { ReactNode } from 'react'

import { ButtonLink, StateScreen } from '@design-system'

import { ROUTES } from '@/constants/routes'

export function Empty(): ReactNode {
  return (
    <StateScreen
      icon={ListChecks}
      title="Suas atividades vão aparecer aqui"
      actions={
        <>
          <ButtonLink href={ROUTES.novaAtividade} isBlock>
            Registrar a primeira atividade
          </ButtonLink>
          <ButtonLink href={ROUTES.formulario} variant="secondary" isBlock>
            Ver meu pedido
          </ButtonLink>
        </>
      }
    >
      <p>
        Organizadas por item, cada uma com o comprovante pronto para baixar e entregar na
        coordenação.
      </p>
    </StateScreen>
  )
}
