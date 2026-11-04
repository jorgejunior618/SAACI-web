'use client'

import { useMutation, useSuspenseQueries } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { type ReactNode, useState } from 'react'

import {
  ActionFooter,
  Button,
  Icon,
  InlineMessage,
  Notice,
  Screen,
  Status,
  TopBar,
} from '@design-system'

import { ROUTES } from '@/constants/routes'
import { contaQueries } from '@/services/conta'
import { type FormularioGerado, gerarFormulario, montarPedido } from '@/services/formulario'
import { progressoQueries } from '@/services/progresso'
import { formatDataHora } from '@/utils/datas'

import { Baixado } from './_components/Baixado'
import { Papel } from './_components/Papel'
import * as S from './styles'

export function PreviaFormulario(): ReactNode {
  const [{ data: progresso }, { data: sessao }] = useSuspenseQueries({
    queries: [progressoQueries.resumo(), contaQueries.sessao()],
  })
  const [gerado, setGerado] = useState<FormularioGerado | null>(null)
  const [agora] = useState(() => formatDataHora(new Date()))

  const geracao = useMutation({ mutationFn: gerarFormulario, onSuccess: setGerado })

  if (!sessao) return null
  const pedido = montarPedido(progresso, sessao)

  if (gerado) {
    return (
      <Screen
        topBar={
          <TopBar
            variant="back"
            title="Seu pedido"
            backHref={ROUTES.formulario}
            backLabel="Voltar para Seu pedido"
          />
        }
      >
        <Baixado gerado={gerado} comprovantes={pedido.comprovantesQueContam} />
      </Screen>
    )
  }

  return (
    <Screen
      surface="muted"
      topBar={
        <TopBar
          variant="back"
          title="Pré-visualizar"
          backHref={ROUTES.formulario}
          backLabel="Voltar para Seu pedido"
        />
      }
      footer={
        <ActionFooter>
          {geracao.isPending && <Status>Preenchendo os 24 itens, leva alguns segundos</Status>}
          <Button
            size="lg"
            isBlock
            isLoading={geracao.isPending}
            onClick={() => geracao.mutate(false)}
          >
            {!geracao.isPending && <Icon icon={Download} />}
            {geracao.isPending ? 'Gerando o PDF' : 'Baixar formulário em PDF'}
          </Button>
          <Button
            variant="tertiary"
            isBlock
            disabled={geracao.isPending}
            onClick={() => geracao.mutate(true)}
          >
            Baixar em branco
          </Button>
        </ActionFooter>
      }
    >
      <S.Lead>É assim que o PDF vai sair. Confira nome, matrícula e as horas.</S.Lead>
      {geracao.isError && (
        <Notice title="O PDF não foi gerado" tone="danger" role="alert">
          Confira sua internet e tente de novo. Nada mudou no seu pedido.
        </Notice>
      )}
      <Papel
        cabecalho={progresso.curso.cabecalhoFormulario}
        nome={sessao.nome}
        matricula={sessao.matricula}
        pedido={pedido}
        geradoEm={agora}
      />
      <InlineMessage>
        Algo errado? Corrija a atividade em Atividades e o formulário se atualiza.
      </InlineMessage>
    </Screen>
  )
}
