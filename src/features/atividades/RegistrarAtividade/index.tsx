'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import {
  ActionFooter,
  Button,
  ChoiceGroup,
  ErrorSummary,
  FileRow,
  IconLink,
  InlineMessage,
  Notice,
  Screen,
  Status,
  Steps,
  TextButton,
  TextField,
  TopBar,
} from '@design-system'

import { EscolherItem } from '@/components/EscolherItem'
import { PainelDaRegra } from '@/components/PainelDaRegra'
import { ROUTES } from '@/constants/routes'
import {
  type Atividade,
  ComprovanteInvalidoError,
  type LeituraComprovante,
  createAtividade,
  invalidateAfterAtividadeWrite,
  lerComprovante,
} from '@/services/atividades'
import { progressoQueries, simularAtividade } from '@/services/progresso'
import { formatData, parseData } from '@/utils/datas'
import { formatHoras } from '@/utils/formatHoras'
import { formatTamanho } from '@/utils/formatTamanho'
import { formatNumero, parseNumero } from '@/utils/numeros'

import { Upload } from './_components/Upload'
import { Sucesso } from './_components/Sucesso'
import { Sugestao } from './_components/Sugestao'
import { type RegistrarAtividadeForm, RegistrarAtividadeSchema } from './schema'
import * as S from './styles'

type Etapa = 'arquivo' | 'lendo' | 'sugestao' | 'escolher' | 'conferir'

const ITEM_PALESTRA = 13
const ITEM_EVENTO = 12

const LIDO = 'Lido do certificado, confira'

const VAZIO: RegistrarAtividadeForm = { nome: '', quantidade: '', dataFim: '' }

function valoresLidos(leitura: LeituraComprovante): RegistrarAtividadeForm {
  return {
    nome: leitura.nome ?? '',
    quantidade: leitura.quantidade === null ? '' : formatNumero(leitura.quantidade),
    dataFim: leitura.dataFim ? formatData(leitura.dataFim) : '',
  }
}

export function RegistrarAtividade(): ReactNode {
  const queryClient = useQueryClient()
  const { data: progresso } = useSuspenseQuery(progressoQueries.resumo())
  const [etapa, setEtapa] = useState<Etapa>('arquivo')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [erroArquivo, setErroArquivo] = useState<string | null>(null)
  const [leitura, setLeitura] = useState<LeituraComprovante | null>(null)
  const [itemNumero, setItemNumero] = useState<number | null>(null)
  const [tipoPalestra, setTipoPalestra] = useState<'avulsa' | 'evento' | null>(null)
  const [registrada, setRegistrada] = useState<Atividade | null>(null)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitted },
  } = useForm<RegistrarAtividadeForm>({
    resolver: valibotResolver(RegistrarAtividadeSchema),
    defaultValues: VAZIO,
  })

  const leituraMutation = useMutation({
    mutationFn: lerComprovante,
    onSuccess: (resultado) => {
      setLeitura(resultado)
      reset(valoresLidos(resultado))
      setEtapa('sugestao')
    },
    onError: (error) => {
      setEtapa('arquivo')
      setArquivo(null)
      setErroArquivo(
        error instanceof ComprovanteInvalidoError
          ? error.motivo === 'formato'
            ? 'Esse arquivo não é PDF, JPG ou PNG. Tire uma foto ou escolha outro arquivo.'
            : 'Esse arquivo passa de 10 MB. Tire uma foto ou junte as páginas num PDF menor.'
          : 'Não deu para ler o arquivo. Confira sua internet e escolha de novo.',
      )
    },
  })

  const registro = useMutation({
    mutationFn: (dados: RegistrarAtividadeForm) =>
      createAtividade({
        itemNumero: itemNumero!,
        nome: dados.nome,
        quantidade: parseNumero(dados.quantidade)!,
        dataFim: parseData(dados.dataFim)!,
        arquivo: arquivo!,
      }),
    onSuccess: (atividade) => {
      invalidateAfterAtividadeWrite(queryClient)
      setRegistrada(atividade)
    },
  })

  const recomecar = (): void => {
    setEtapa('arquivo')
    setArquivo(null)
    setErroArquivo(null)
    setLeitura(null)
    setItemNumero(null)
    setTipoPalestra(null)
    setRegistrada(null)
    reset(VAZIO)
    registro.reset()
  }

  const receberArquivo = (novo: File): void => {
    setErroArquivo(null)
    setArquivo(novo)
    setItemNumero(null)
    setTipoPalestra(null)
    setEtapa('lendo')
    leituraMutation.mutate(novo)
  }

  const valores: RegistrarAtividadeForm = { ...VAZIO, ...useWatch({ control }) }

  if (registrada) return <Sucesso atividade={registrada} onRegistrarOutra={recomecar} />

  const item =
    itemNumero === null ? null : progresso.curso.itens.find((i) => i.numero === itemNumero)!
  const itemSugerido =
    leitura && progresso.curso.itens.find((i) => i.numero === leitura.itemSugerido)!
  const lidos = leitura ? valoresLidos(leitura) : VAZIO
  const quantidade = parseNumero(valores.quantidade)
  const simulacao =
    item && quantidade !== null
      ? simularAtividade(progresso, {
          itemNumero: item.numero,
          quantidade,
          dataFim: parseData(valores.dataFim),
        })
      : null

  const flag = (campo: keyof RegistrarAtividadeForm): string | undefined =>
    lidos[campo] !== '' && valores[campo] === lidos[campo] ? LIDO : undefined
  const naoLido = (campo: keyof RegistrarAtividadeForm, texto: string): string | undefined =>
    leitura && lidos[campo] === '' && valores[campo] === '' ? texto : undefined

  const escolherItem = (numero: number): void => {
    setItemNumero(numero)
    setTipoPalestra(null)
    setEtapa('conferir')
  }

  const resumoErros = [
    errors.nome && { fieldId: 'campo-nome', message: 'Digite o nome da atividade' },
    errors.quantidade && {
      fieldId: 'campo-quantidade',
      message:
        item?.unidade.tipo === 'horas'
          ? 'Digite as horas que aparecem no certificado'
          : `Digite ${item?.campoQuantidade.toLowerCase()}`,
    },
    errors.dataFim && {
      fieldId: 'campo-data',
      message: 'Digite a data em que a atividade terminou',
    },
  ].filter((e): e is { fieldId: string; message: string } => Boolean(e))

  const isParcial = simulacao !== null && simulacao.vaiContar < simulacao.valor

  return (
    <Screen
      topBar={
        <TopBar
          variant="task"
          title="Registrar atividade"
          action={<IconLink href={ROUTES.painel}>Fechar</IconLink>}
        />
      }
      footer={
        <ActionFooter
          summary={
            etapa === 'conferir'
              ? {
                  label: 'Vai contar',
                  value: simulacao ? formatHoras(simulacao.vaiContar) : 'falta',
                  tone: isParcial ? 'warning' : 'neutral',
                }
              : undefined
          }
        >
          <Button
            type="submit"
            form="form-registrar"
            isBlock
            disabled={etapa !== 'conferir'}
            isLoading={registro.isPending}
          >
            {registro.isPending ? 'Registrando' : 'Registrar'}
          </Button>
        </ActionFooter>
      }
    >
      {isSubmitted && <ErrorSummary errors={resumoErros} />}
      {registro.isError && (
        <Notice title="A atividade não foi registrada" tone="danger" role="alert">
          Nada foi salvo, e o que você preencheu continua aqui. Confira sua internet e toque em
          Registrar de novo.
        </Notice>
      )}

      <S.Section aria-labelledby="titulo-comprovante">
        <S.Label id="titulo-comprovante">Comprovante</S.Label>
        {arquivo ? (
          <FileRow
            name={arquivo.name}
            size={formatTamanho(arquivo.size)}
            actions={
              <Button variant="tertiary" onClick={recomecar} disabled={registro.isPending}>
                Trocar
              </Button>
            }
          />
        ) : (
          <>
            <S.Hint>PDF, JPG ou PNG, até 10 MB. Frente e verso? Junte os dois num PDF.</S.Hint>
            <Upload onArquivo={receberArquivo} />
            {erroArquivo && (
              <InlineMessage tone="danger" role="alert">
                {erroArquivo}
              </InlineMessage>
            )}
          </>
        )}
      </S.Section>

      {etapa === 'arquivo' && (
        <Steps
          size="sm"
          start={2}
          steps={[
            { description: 'O app lê o certificado e sugere o item do formulário.' },
            { description: 'Você confere e vê quanto ela vale antes de registrar.' },
          ]}
        />
      )}

      {etapa === 'lendo' && (
        <S.Reading>
          <Status>Lendo seu certificado, cerca de 20 segundos</Status>
          <InlineMessage>
            A leitura só sugere. Você confere tudo, e nada é registrado antes de tocar em Registrar.
          </InlineMessage>
        </S.Reading>
      )}

      {etapa === 'sugestao' && itemSugerido && (
        <Sugestao
          item={itemSugerido}
          onConfirmar={() => escolherItem(itemSugerido.numero)}
          onEscolherOutro={() => setEtapa('escolher')}
        />
      )}

      {etapa === 'escolher' && (
        <EscolherItem
          itens={progresso.curso.itens}
          selecionado={itemNumero}
          onEscolher={escolherItem}
          rodape={
            itemSugerido && (
              <S.Back>
                A sugestão era o item {itemSugerido.numero}.{' '}
                <TextButton onClick={() => setEtapa('sugestao')}>Voltar para a sugestão</TextButton>
              </S.Back>
            )
          }
        />
      )}

      {etapa === 'conferir' && item && (
        <>
          <PainelDaRegra
            item={item}
            quantidade={quantidade}
            simulacao={simulacao}
            onTrocarItem={() => setEtapa('escolher')}
            variant="registro"
          />

          <S.Form
            id="form-registrar"
            noValidate
            onSubmit={handleSubmit((dados) => registro.mutate(dados))}
          >
            <TextField
              id="campo-nome"
              label="Nome da atividade"
              labelAside={flag('nome')}
              isRead={Boolean(flag('nome'))}
              unreadMessage={naoLido(
                'nome',
                'Não conseguimos ler o nome. Digite como está no certificado.',
              )}
              error={errors.nome?.message}
              {...register('nome')}
            />
            <TextField
              id="campo-quantidade"
              label={item.campoQuantidade}
              labelAside={flag('quantidade')}
              isRead={Boolean(flag('quantidade'))}
              hint={item.dicaQuantidade}
              unreadMessage={naoLido(
                'quantidade',
                'Não conseguimos ler esse número. Digite como está no certificado.',
              )}
              inputMode="decimal"
              error={errors.quantidade?.message}
              {...register('quantidade')}
            />
            {(item.numero === ITEM_PALESTRA || tipoPalestra === 'evento') && (
              <ChoiceGroup
                legend="A palestra foi avulsa ou fez parte de um evento?"
                name="tipo-palestra"
                value={tipoPalestra}
                onChange={(valor) => {
                  const tipo = valor === 'evento' ? 'evento' : 'avulsa'
                  setTipoPalestra(tipo)
                  // Palestra dentro de evento conta pelo item 12, por dia de evento.
                  setItemNumero(tipo === 'evento' ? ITEM_EVENTO : ITEM_PALESTRA)
                }}
                options={[
                  {
                    value: 'avulsa',
                    label: 'Foi avulsa',
                    description: 'Conta neste item, 2h por palestra',
                  },
                  {
                    value: 'evento',
                    label: 'Fez parte de um evento',
                    description: 'Conta pelo item 12, por dia de evento',
                  },
                ]}
              />
            )}
            <TextField
              id="campo-data"
              label="Data em que a atividade terminou"
              labelAside={flag('dataFim')}
              isRead={Boolean(flag('dataFim'))}
              unreadMessage={naoLido(
                'dataFim',
                'Não conseguimos ler a data. Digite no formato dd/mm/aaaa.',
              )}
              inputMode="numeric"
              placeholder="dd/mm/aaaa"
              error={errors.dataFim?.message}
              {...register('dataFim')}
            />
          </S.Form>
        </>
      )}
    </Screen>
  )
}
