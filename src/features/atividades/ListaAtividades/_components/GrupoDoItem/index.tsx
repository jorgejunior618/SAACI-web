'use client'

import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { Checkbox, Disclosure, Icon } from '@design-system'

import { ROUTES } from '@/constants/routes'
import type { AtividadeComResultado, ItemComProgresso } from '@/services/progresso'
import { formatData } from '@/utils/datas'
import { formatHoras, formatHorasInteiras } from '@/utils/formatHoras'

import * as S from './styles'

function descreverMeta(atividade: AtividadeComResultado): string {
  const data = formatData(atividade.dataFim)
  if (atividade.status === 'nao_conta') {
    const motivo = atividade.motivo === 'antes_do_ingresso' ? 'antes do seu ingresso' : 'item cheio'
    return `Não conta · ${motivo} · fica fora do download`
  }
  if (atividade.status === 'parcial') {
    return `${formatHoras(atividade.contada)} de ${formatHoras(atividade.valor)} · ${data}`
  }
  return `${formatHoras(atividade.contada)} · ${data}`
}

type Props = {
  progresso: ItemComProgresso
  isOpen: boolean
  // Ids marcados no modo "Escolher quais". Null fora desse modo.
  selecionados: ReadonlySet<string> | null
  onAlternar: (id: string) => void
}

export function GrupoDoItem({ progresso, isOpen, selecionados, onAlternar }: Props): ReactNode {
  const { item, usado, atividades } = progresso

  return (
    <div id={`item-${item.numero}`}>
      <Disclosure
        isOpen={isOpen}
        summary={
          <S.Summary>
            <span>
              <S.Number>Item {item.numero}</S.Number>
              <S.Name>{item.nome}</S.Name>
            </span>
            <S.Hours>
              {formatHoras(usado)} de {formatHorasInteiras(item.limite)}
            </S.Hours>
          </S.Summary>
        }
      >
        <S.List isSelecting={selecionados !== null}>
          {atividades.map((atividade) => {
            const texto = (
              <>
                <S.ActName>{atividade.nome}</S.ActName>
                <span className={S.meta({ status: atividade.status })}>
                  {descreverMeta(atividade)}
                </span>
              </>
            )

            return (
              <li key={atividade.id}>
                {selecionados ? (
                  <S.Row>
                    <Checkbox
                      id={`escolher-${atividade.id}`}
                      checked={selecionados.has(atividade.id)}
                      onChange={() => onAlternar(atividade.id)}
                    />
                    <label htmlFor={`escolher-${atividade.id}`} className={S.label}>
                      {texto}
                    </label>
                  </S.Row>
                ) : (
                  <Link href={ROUTES.atividade(atividade.id)} className={S.rowLink}>
                    <S.Row>
                      <span className={S.rowLink}>{texto}</span>
                      <S.Chevron>
                        <Icon icon={ChevronRight} size={16} />
                      </S.Chevron>
                    </S.Row>
                  </Link>
                )}
              </li>
            )
          })}
        </S.List>
      </Disclosure>
    </div>
  )
}
