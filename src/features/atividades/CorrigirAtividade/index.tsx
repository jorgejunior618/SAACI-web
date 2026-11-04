'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { notFound, useRouter } from 'next/navigation'
import { type ReactNode, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import {
  ActionFooter,
  Button,
  ErrorSummary,
  IconLink,
  InlineMessage,
  Notice,
  Screen,
  TextField,
  TopBar,
} from '@design-system'

import { EscolherItem } from '@/components/EscolherItem'
import { PainelDaRegra } from '@/components/PainelDaRegra'
import { ROUTES } from '@/constants/routes'
import { invalidateAfterAtividadeWrite, updateAtividade } from '@/services/atividades'
import {
  type AtividadeComResultado,
  type Progresso,
  progressoQueries,
  simularAtividade,
} from '@/services/progresso'
import { formatData, parseData } from '@/utils/datas'
import { formatHoras } from '@/utils/formatHoras'
import { formatNumero, parseNumero } from '@/utils/numeros'

import { type CorrigirAtividadeForm, CorrigirAtividadeSchema } from './schema'
import * as S from './styles'

export function CorrigirAtividade({ id }: { id: string }): ReactNode {
  const { data: progresso } = useSuspenseQuery(progressoQueries.resumo())
  const atividade = progresso.itens.flatMap((i) => i.atividades).find((a) => a.id === id)

  if (!atividade) notFound()

  // O formulário só monta com a atividade em mãos: defaultValues é lido uma vez só.
  return <Formulario progresso={progresso} atividade={atividade} />
}

type Props = {
  progresso: Progresso
  atividade: AtividadeComResultado
}

function Formulario({ progresso, atividade }: Props): ReactNode {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [itemNumero, setItemNumero] = useState(atividade.itemNumero)
  const [isTrocandoItem, setIsTrocandoItem] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<CorrigirAtividadeForm>({
    resolver: valibotResolver(CorrigirAtividadeSchema),
    defaultValues: {
      nome: atividade.nome,
      quantidade: formatNumero(atividade.quantidade),
      dataFim: formatData(atividade.dataFim),
    },
  })

  const item = progresso.curso.itens.find((i) => i.numero === itemNumero)!
  const [textoQuantidade, textoData] = useWatch({ control, name: ['quantidade', 'dataFim'] })
  const quantidade = parseNumero(textoQuantidade)
  const dataFim = parseData(textoData)
  const simulacao =
    quantidade === null
      ? null
      : simularAtividade(progresso, { id: atividade.id, itemNumero, quantidade, dataFim })
  const quantidadeOriginal = formatNumero(atividade.quantidade)

  const mutation = useMutation({
    mutationFn: (dados: CorrigirAtividadeForm) =>
      updateAtividade({
        id: atividade.id,
        itemNumero,
        nome: dados.nome,
        quantidade: parseNumero(dados.quantidade)!,
        dataFim: parseData(dados.dataFim)!,
      }),
    onSuccess: () => {
      invalidateAfterAtividadeWrite(queryClient)
      router.replace(ROUTES.atividade(atividade.id))
    },
  })

  const resumoErros = [
    errors.nome && { fieldId: 'campo-nome', message: 'Digite o nome da atividade' },
    errors.quantidade && {
      fieldId: 'campo-quantidade',
      message: `Digite ${item.campoQuantidade.toLowerCase()}`,
    },
    errors.dataFim && {
      fieldId: 'campo-data',
      message: 'Digite a data em que a atividade terminou',
    },
  ].filter((e): e is { fieldId: string; message: string } => Boolean(e))

  return (
    <Screen
      topBar={
        <TopBar
          variant="task"
          title="Corrigir atividade"
          action={<IconLink href={ROUTES.atividade(atividade.id)}>Cancelar</IconLink>}
        />
      }
      footer={
        <ActionFooter
          summary={{
            label: 'Vai contar',
            before: `(antes ${formatHoras(atividade.contada)})`,
            value: simulacao ? formatHoras(simulacao.vaiContar) : 'falta',
            tone: simulacao && simulacao.vaiContar < simulacao.valor ? 'warning' : 'neutral',
          }}
        >
          <Button type="submit" form="form-corrigir" isBlock isLoading={mutation.isPending}>
            {mutation.isPending ? 'Salvando' : 'Salvar correção'}
          </Button>
        </ActionFooter>
      }
    >
      {isSubmitted && <ErrorSummary errors={resumoErros} />}
      {mutation.isError && (
        <Notice title="A correção não foi salva" tone="danger" role="alert">
          O que você digitou continua aqui. Confira sua internet e toque em Salvar correção de novo.
        </Notice>
      )}

      {isTrocandoItem ? (
        <EscolherItem
          itens={progresso.curso.itens}
          selecionado={itemNumero}
          onEscolher={(numero) => {
            setItemNumero(numero)
            setIsTrocandoItem(false)
          }}
        />
      ) : (
        <PainelDaRegra
          item={item}
          quantidade={quantidade}
          simulacao={simulacao}
          onTrocarItem={() => setIsTrocandoItem(true)}
          variant="correcao"
        />
      )}

      <S.Form
        id="form-corrigir"
        noValidate
        onSubmit={handleSubmit((dados) => mutation.mutate(dados))}
      >
        <TextField
          id="campo-nome"
          label="Nome da atividade"
          error={errors.nome?.message}
          {...register('nome')}
        />
        <TextField
          id="campo-quantidade"
          label={item.campoQuantidade}
          labelAside={
            textoQuantidade !== quantidadeOriginal ? `Antes: ${quantidadeOriginal}` : undefined
          }
          hint={
            item.dicaQuantidade ?? 'Confira no comprovante. Um zero a mais muda bastante o cálculo.'
          }
          inputMode="decimal"
          error={errors.quantidade?.message}
          {...register('quantidade')}
        />
        <TextField
          id="campo-data"
          label="Data em que a atividade terminou"
          inputMode="numeric"
          placeholder="dd/mm/aaaa"
          error={errors.dataFim?.message}
          {...register('dataFim')}
        />
        <InlineMessage>
          O comprovante continua o mesmo. Para trocar o arquivo, remova a atividade e registre de
          novo.
        </InlineMessage>
      </S.Form>
    </Screen>
  )
}
