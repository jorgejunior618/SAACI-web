import { ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'

import { Screen, StateScreen, TopBar } from '@design-system'

// O texto legal ainda não existe: o marcador fica visível em vez de um texto inventado.
export function AvisoPrivacidade(): ReactNode {
  return (
    <Screen
      topBar={
        <TopBar variant="back" title="Aviso de privacidade" backHref="/" backLabel="Voltar" />
      }
    >
      <StateScreen icon={ShieldCheck} title="Aviso de privacidade">
        <p>
          [TEXTO DO AVISO DE PRIVACIDADE: o que o SAACI guarda, por quanto tempo e quem lê o
          comprovante]
        </p>
      </StateScreen>
    </Screen>
  )
}
