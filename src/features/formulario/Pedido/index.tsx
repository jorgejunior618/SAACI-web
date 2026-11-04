'use client'

import { useSuspenseQueries } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { ActionFooter, ButtonLink, InlineMessage, Screen, TopBar } from '@design-system'

import { ROUTES } from '@/constants/routes'
import { type Sessao, contaQueries } from '@/services/conta'
import { type Pedido as PedidoMontado, montarPedido } from '@/services/formulario'
import { progressoQueries } from '@/services/progresso'
import { formatHorasInteiras } from '@/utils/formatHoras'

import { Checklist, type Pendencia } from './_components/Checklist'
import { TabelaDoPedido } from './_components/TabelaDoPedido'
import * as S from './styles'

function montarChecklist(pedido: PedidoMontado, sessao: Sessao): Pendencia[] {
  const { meta, feito, faltam, comprovantesQueContam } = pedido

  return [
    faltam > 0
      ? {
          id: 'horas',
          isOk: false,
          title: `Faltam ${formatHorasInteiras(faltam)} para a meta de ${formatHorasInteiras(meta)}`,
          sub: `Você tem ${formatHorasInteiras(feito)}. Registre mais atividades.`,
          action: 'Registrar',
          href: ROUTES.novaAtividade,
        }
      : {
          id: 'horas',
          isOk: true,
          title: `${formatHorasInteiras(meta)} completas`,
          sub: 'A carga do seu curso',
          action: 'Ver',
          href: ROUTES.painel,
        },
    sessao.nome
      ? {
          id: 'nome',
          isOk: true,
          title: sessao.nome,
          sub: 'Nome no formulário',
          action: 'Trocar',
          href: `${ROUTES.perfil}?editar=nome`,
        }
      : {
          id: 'nome',
          isOk: false,
          title: 'Seu nome completo',
          sub: 'Como está nos seus documentos',
          action: 'Escrever',
          href: `${ROUTES.perfil}?editar=nome`,
        },
    sessao.matricula
      ? {
          id: 'matricula',
          isOk: true,
          title: `Matrícula ${sessao.matricula}`,
          sub: 'Vem do seu Perfil',
          action: 'Trocar',
          href: `${ROUTES.perfil}?editar=matricula`,
        }
      : {
          id: 'matricula',
          isOk: false,
          title: 'Matrícula',
          sub: 'Informe uma vez no Perfil',
          action: 'Perfil',
          href: `${ROUTES.perfil}?editar=matricula`,
        },
    comprovantesQueContam > 0
      ? {
          id: 'comprovantes',
          isOk: true,
          title: `${comprovantesQueContam} ${comprovantesQueContam === 1 ? 'comprovante separado' : 'comprovantes separados'}`,
          sub: 'Por item, prontos para entregar',
          action: 'Ver',
          href: ROUTES.atividades,
        }
      : {
          id: 'comprovantes',
          isOk: false,
          title: 'Nenhum comprovante ainda',
          sub: 'Eles vêm das atividades que você registrar',
          action: 'Registrar',
          href: ROUTES.novaAtividade,
        },
  ]
}

const tituloPendencias = (total: number): string =>
  total === 1 ? 'Falta 1 coisa' : `Faltam ${total} coisas`

export function Pedido(): ReactNode {
  const [{ data: progresso }, { data: sessao }] = useSuspenseQueries({
    queries: [progressoQueries.resumo(), contaQueries.sessao()],
  })

  // O SessionGate só deixa chegar aqui com sessão.
  if (!sessao) return null

  const pedido = montarPedido(progresso, sessao)
  const checklist = montarChecklist(pedido, sessao)
  const faltando = checklist.filter((c) => !c.isOk).length
  const isPronto = faltando === 0

  return (
    <Screen
      topBar={
        <TopBar
          variant="back"
          title="Seu pedido"
          backHref={ROUTES.atividades}
          backLabel="Voltar para Atividades"
        />
      }
      footer={
        <ActionFooter
          isPlain={!isPronto}
          note={
            isPronto ? undefined : 'Dá para baixar antes de completar, se a coordenação aceitar.'
          }
        >
          <ButtonLink
            href={ROUTES.previaFormulario}
            variant={isPronto ? 'primary' : 'secondary'}
            isBlock
          >
            {isPronto ? 'Pré-visualizar e baixar' : 'Pré-visualizar como está'}
          </ButtonLink>
        </ActionFooter>
      }
    >
      <S.Header>
        <h2 className={S.title({ isPronto })}>
          {isPronto ? 'Tudo pronto' : tituloPendencias(faltando)}
        </h2>
        <S.Lead>
          {isPronto
            ? 'O SAACI preencheu o formulário da coordenação com as suas horas. Confira e baixe.'
            : 'O resto o SAACI já preencheu. Toque em cada uma para resolver.'}
        </S.Lead>
      </S.Header>

      <Checklist items={checklist} />

      <S.Section aria-labelledby="titulo-formulario">
        <S.SectionTitle id="titulo-formulario">O que vai no formulário</S.SectionTitle>
        <TabelaDoPedido pedido={pedido} />
        {pedido.feito > pedido.meta && (
          <InlineMessage>
            Seus itens somam {formatHorasInteiras(pedido.feito)}. O que passa de{' '}
            {formatHorasInteiras(pedido.meta)} não entra no pedido.
          </InlineMessage>
        )}
        <InlineMessage>
          Modelo da coordenação de {progresso.curso.nome}, conferido em{' '}
          {progresso.curso.modeloConferidoEm}.
        </InlineMessage>
      </S.Section>
    </Screen>
  )
}
