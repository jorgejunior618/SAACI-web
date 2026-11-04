import type { ReactNode } from 'react'

import { TelaNaoEncontrada } from '@/components/TelaNaoEncontrada'
import { ROUTES } from '@/constants/routes'

export default function NotFound(): ReactNode {
  return (
    <TelaNaoEncontrada
      title="Essa atividade não está mais aqui"
      text="Ela pode ter sido removida. As outras continuam em Atividades."
      href={ROUTES.atividades}
      linkLabel="Ver minhas atividades"
    />
  )
}
