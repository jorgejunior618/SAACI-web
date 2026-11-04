import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { Icon, ProgressBar } from '@design-system'

import { ROUTES } from '@/constants/routes'
import type { ItemComProgresso } from '@/services/progresso'
import { formatHoras, formatHorasInteiras } from '@/utils/formatHoras'

import * as S from './styles'

function rodape({ isCheio, cabem, excedente }: ItemComProgresso): string {
  if (!isCheio) return `Ainda cabem ${formatHoras(cabem)}`
  if (excedente > 0) return `Completo. ${formatHoras(excedente)} registradas não contam`
  return 'Completo'
}

export function CartaoDoItem({ progresso }: { progresso: ItemComProgresso }): ReactNode {
  const { item, usado, isCheio } = progresso

  return (
    <Link href={`${ROUTES.atividades}#item-${item.numero}`} className={S.card}>
      <S.Head>
        <S.Titles>
          <S.Number>Item {item.numero}</S.Number>
          <S.Name>{item.nome}</S.Name>
        </S.Titles>
        <S.Chevron>
          <Icon icon={ChevronRight} size={16} />
        </S.Chevron>
      </S.Head>
      <S.Hours>
        <b className={S.hoursValue({ isCheio })}>{formatHoras(usado)}</b>
        <S.HoursLimit>de {formatHorasInteiras(item.limite)}</S.HoursLimit>
      </S.Hours>
      <S.Bar>
        <ProgressBar value={usado} max={item.limite} />
      </S.Bar>
      <span className={S.foot({ isCheio })}>{rodape(progresso)}</span>
    </Link>
  )
}
