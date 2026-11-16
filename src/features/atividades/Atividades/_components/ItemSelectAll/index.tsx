import type { ReactNode } from 'react'

import { Link } from '@design-system'

import * as S from './styles'

/** Props de {@link ItemSelectAll}. */
export type ItemSelectAllProps = {
  /** Número do item, para o nome acessível distinguir um item do outro. */
  itemNumber: number
  /** Todas as atividades que contam do item já estão marcadas. */
  isAllSelected: boolean
  /** Marca todas, ou desmarca todas quando já estão marcadas. */
  onToggle: () => void
}

/**
 * Linha "Marcar todos do item" do modo de seleção, a primeira dentro de cada item aberto.
 *
 * @remarks
 * É um `li`, para entrar no corpo do `Disclosure` junto com os `ActivityRow`. Com tudo marcado, vira
 * "Desmarcar todos do item". O nome acessível leva o número ("Marcar todos do item 7"), porque o
 * leitor de tela lê as linhas de vários itens sem o cabeçalho ao lado.
 *
 * @example
 * ```tsx
 * <ItemSelectAll itemNumber={7} isAllSelected={false} onToggle={() => toggleItem(7)} />
 * ```
 */
export function ItemSelectAll({
  itemNumber,
  isAllSelected,
  onToggle,
}: ItemSelectAllProps): ReactNode {
  const label = isAllSelected ? 'Desmarcar todos do item' : 'Marcar todos do item'

  return (
    <S.Root>
      <Link
        as="button"
        type="button"
        isStandalone
        aria-label={`${label} ${itemNumber}`}
        onClick={onToggle}
      >
        {label}
      </Link>
    </S.Root>
  )
}
