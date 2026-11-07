import type { ReactNode } from 'react'

import { Sidebar } from './_components/Sidebar'
import { sectionGroups, sections } from './sections'
import * as S from './styles'

export { findSection, sections } from './sections'

// Só título e id seguem para o Sidebar (client): os componentes das páginas ficam no servidor.
const groups = sectionGroups.map((title) => ({
  title,
  items: sections
    .filter((section) => section.group === title)
    .map(({ id, title: sectionTitle }) => ({ id, title: sectionTitle })),
}))

type Props = {
  /** Página da seção aberta, entregue pela rota `[secao]`. */
  children: ReactNode
}

/**
 * Moldura da galeria do design system: sidebar com as seções e a área de conteúdo.
 *
 * @remarks
 * Só existe em desenvolvimento: o `layout.tsx` da rota `/design-system` responde 404 em produção.
 * Componente novo ou alterado em `@design-system` ganha ou atualiza a sua página em `sections.ts`
 * no mesmo commit do `DS_REFERENCE.md`. No desktop a sidebar fica ao lado; no celular, acima.
 */
export function Galeria({ children }: Props): ReactNode {
  return (
    <S.Root>
      <Sidebar groups={groups} />
      <S.Content>{children}</S.Content>
    </S.Root>
  )
}
