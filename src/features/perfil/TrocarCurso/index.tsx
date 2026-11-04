'use client'

import { useSuspenseQueries } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'

import { GroupedList, Icon, InlineMessage, Notice, Screen, TextField, TopBar } from '@design-system'

import { ApagarContaSheet } from '@/components/ApagarContaSheet'
import { ROUTES } from '@/constants/routes'
import { contaQueries } from '@/services/conta'
import { progressoQueries } from '@/services/progresso'

import * as S from './styles'

export function TrocarCurso(): ReactNode {
  const router = useRouter()
  const [{ data: sessao }, { data: progresso }] = useSuspenseQueries({
    queries: [contaQueries.sessao(), progressoQueries.resumo()],
  })
  const [isApagando, setIsApagando] = useState(false)
  const total = progresso.itens.reduce((soma, i) => soma + i.atividades.length, 0)

  // Sem atividades, trocar é só escolher de novo.
  useEffect(() => {
    if (total === 0) router.replace(`${ROUTES.curso}?trocar=1`)
  }, [router, total])

  if (!sessao || total === 0) return null
  const plural = total === 1 ? '1 atividade registrada' : `${total} atividades registradas`

  return (
    <Screen
      topBar={
        <TopBar
          variant="back"
          title="Trocar curso"
          backHref={ROUTES.perfil}
          backLabel="Voltar para Perfil"
        />
      }
    >
      <TextField label="Seu curso" value={progresso.curso.nome} disabled readOnly />

      <Notice title="Com atividades lançadas, o curso fica travado" tone="warning">
        Você tem {plural}, e cada curso tem itens e regras diferentes. Para não misturar as horas, o
        SAACI só troca o curso sem atividades.
      </Notice>

      <S.Section aria-labelledby="titulo-caminhos">
        <S.SectionTitle id="titulo-caminhos">Para trocar, escolha um caminho</S.SectionTitle>
        <GroupedList>
          <li>
            <Link href={ROUTES.atividades} className={S.row}>
              <S.Text>
                Remover as atividades
                <S.Sub>
                  Baixe os comprovantes antes, remova {total === 1 ? 'a atividade' : `as ${total}`}{' '}
                  em Atividades e volte aqui.
                </S.Sub>
              </S.Text>
              <S.Chevron>
                <Icon icon={ChevronRight} size={16} />
              </S.Chevron>
            </Link>
          </li>
          <li>
            <button type="button" className={S.row} onClick={() => setIsApagando(true)}>
              <S.Text>
                Apagar a conta e começar de novo
                <S.Sub>Crie a conta outra vez com o mesmo e-mail e escolha o curso novo.</S.Sub>
              </S.Text>
              <S.Chevron>
                <Icon icon={ChevronRight} size={16} />
              </S.Chevron>
            </button>
          </li>
        </GroupedList>
      </S.Section>

      <InlineMessage>
        Se você mudou de curso no IFCE, as atividades do curso antigo podem não valer no novo.
        Confira com a coordenação.
      </InlineMessage>

      <ApagarContaSheet
        isOpen={isApagando}
        onClose={() => setIsApagando(false)}
        email={sessao.email}
        isConfirmada
        totalAtividades={total}
      />
    </Screen>
  )
}
