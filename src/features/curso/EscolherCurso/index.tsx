'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { type ReactNode, useDeferredValue, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  ActionFooter,
  Button,
  Icon,
  ItemList,
  Notice,
  PageHeader,
  Screen,
  TextButton,
  TextField,
  TopBar,
} from '@design-system'

import { RodapeConta } from '@/components/RodapeConta'
import { ROUTES } from '@/constants/routes'
import {
  CursoTravadoError,
  contaQueries,
  definirCurso,
  invalidateAfterContaWrite,
} from '@/services/conta'
import { type CursoResumo, cursosQueries } from '@/services/cursos'

import { type SemestreForm, SemestreSchema } from './schema'
import * as S from './styles'

const descreverCurso = (curso: CursoResumo): string => `${curso.grau} · campus ${curso.campus}`

const toEntrada = (curso: CursoResumo): { id: string; title: string; description: string } => ({
  id: curso.id,
  title: curso.nome,
  description: descreverCurso(curso),
})

export function EscolherCurso(): ReactNode {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isTrocando = searchParams.get('trocar') === '1'
  const { data: sessao } = useSuspenseQuery(contaQueries.sessao())
  const [escolhido, setEscolhido] = useState<CursoResumo | null>(null)

  const isJaConfigurado = Boolean(sessao?.curso && sessao.ingresso) && !isTrocando
  useEffect(() => {
    if (isJaConfigurado) router.replace(ROUTES.painel)
  }, [isJaConfigurado, router])

  if (!sessao || isJaConfigurado) return null

  return escolhido ? (
    <CursoConfirmado
      curso={escolhido}
      ingressoAtual={sessao.ingresso}
      isTrocando={isTrocando}
      onEscolherOutro={() => setEscolhido(null)}
      rodape={<RodapeConta sessao={sessao} />}
    />
  ) : (
    <BuscarCurso onEscolher={setEscolhido} rodape={<RodapeConta sessao={sessao} />} />
  )
}

type BuscarProps = {
  onEscolher: (curso: CursoResumo) => void
  rodape: ReactNode
}

function BuscarCurso({ onEscolher, rodape }: BuscarProps): ReactNode {
  const [busca, setBusca] = useState('')
  const termo = useDeferredValue(busca.trim())
  // useQuery: a chave muda a cada tecla, e o resultado anterior fica na tela enquanto busca.
  const resultado = useQuery({
    ...cursosQueries.list(termo),
    placeholderData: (anterior) => anterior,
  })
  const todos = useQuery(cursosQueries.list(''))

  const cursos = resultado.data ?? []
  const isNaoAchou = termo.length > 0 && resultado.isSuccess && cursos.length === 0

  return (
    <Screen topBar={<TopBar variant="brand" />}>
      <PageHeader
        title="Qual é o seu curso?"
        lead="Assim o SAACI sabe quais atividades contam e quanto cada uma vale."
      />
      <TextField
        label="Buscar curso"
        type="search"
        autoComplete="off"
        leadingIcon={<Icon icon={Search} />}
        value={busca}
        onChange={(event) => setBusca(event.target.value)}
      />

      {isNaoAchou ? (
        <>
          <Notice title={`Ainda não temos as regras de “${termo}”`} role="status">
            O SAACI está incluindo os cursos aos poucos, e o seu ainda não chegou. Se o nome tiver
            outra grafia, tente só uma parte dele.
          </Notice>
          <S.Section>
            <S.SectionTitle>Cursos com regras hoje</S.SectionTitle>
            <ItemList
              label="Cursos com regras hoje"
              items={(todos.data ?? []).map(toEntrada)}
              onSelect={(id) => {
                const curso = todos.data?.find((c) => c.id === id)
                if (curso) onEscolher(curso)
              }}
            />
            <S.Support>
              Enquanto o seu curso não chega, não dá para continuar. Os dados da sua conta ficam
              guardados.
            </S.Support>
          </S.Section>
        </>
      ) : (
        <S.Section>
          <ItemList
            label="Cursos encontrados"
            items={cursos.map(toEntrada)}
            onSelect={(id) => {
              const curso = cursos.find((c) => c.id === id)
              if (curso) onEscolher(curso)
            }}
          />
          <S.Support>
            Só aparecem os cursos que já têm as regras no SAACI. Outros estão chegando.
          </S.Support>
        </S.Section>
      )}

      <S.Bottom>{rodape}</S.Bottom>
    </Screen>
  )
}

type ConfirmadoProps = {
  curso: CursoResumo
  ingressoAtual: string | null
  isTrocando: boolean
  onEscolherOutro: () => void
  rodape: ReactNode
}

function CursoConfirmado({
  curso,
  ingressoAtual,
  isTrocando,
  onEscolherOutro,
  rodape,
}: ConfirmadoProps): ReactNode {
  const router = useRouter()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SemestreForm>({
    resolver: valibotResolver(SemestreSchema),
    defaultValues: { ingresso: ingressoAtual ?? '' },
  })

  const mutation = useMutation({
    mutationFn: ({ ingresso }: SemestreForm) => definirCurso(curso.id, ingresso),
    onSuccess: () => {
      invalidateAfterContaWrite(queryClient)
      router.replace(isTrocando ? ROUTES.perfil : ROUTES.painel)
    },
  })

  return (
    <Screen
      topBar={<TopBar variant="brand" />}
      footer={
        <ActionFooter>
          <Button type="submit" form="form-curso" isBlock isLoading={mutation.isPending}>
            {mutation.isPending ? 'Salvando' : isTrocando ? 'Salvar curso' : 'Ver meu painel'}
          </Button>
        </ActionFooter>
      }
    >
      <S.Meta>
        <PageHeader eyebrow={`${curso.nome} · ${curso.grau}`} title="Seu curso pede" />
        <S.Goal>{curso.meta}h</S.Goal>
        <p>
          de atividades complementares. Elas podem vir de 24 tipos de atividade, como cursos,
          palestras e eventos.
        </p>
      </S.Meta>

      {mutation.error instanceof CursoTravadoError && (
        <Notice title="Com atividades lançadas, o curso fica travado" tone="warning" role="alert">
          Remova as atividades em Atividades antes de trocar de curso.
        </Notice>
      )}
      {mutation.isError && !(mutation.error instanceof CursoTravadoError) && (
        <Notice title="O curso não foi salvo" tone="danger" role="alert">
          Confira sua internet e tente de novo.
        </Notice>
      )}

      <S.Form id="form-curso" noValidate onSubmit={handleSubmit((dados) => mutation.mutate(dados))}>
        <TextField
          label="Em que semestre você entrou no curso?"
          hint="Só contam as atividades feitas a partir dele."
          inputMode="decimal"
          placeholder="2023.2"
          error={errors.ingresso?.message}
          {...register('ingresso')}
        />
      </S.Form>
      <div>
        <TextButton onClick={onEscolherOutro}>Não é esse curso? Escolher outro</TextButton>
      </div>

      <S.Bottom>{rodape}</S.Bottom>
    </Screen>
  )
}
