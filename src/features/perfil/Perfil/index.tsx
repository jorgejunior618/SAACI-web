'use client'

import { useMutation, useQueryClient, useSuspenseQueries } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { type ReactNode, useState } from 'react'

import { GroupedList, Icon, Screen, TextLink, TopBar } from '@design-system'

import { ApagarContaSheet } from '@/components/ApagarContaSheet'
import { ROUTES } from '@/constants/routes'
import { atualizarPerfil, contaQueries, invalidateAfterContaWrite, sair } from '@/services/conta'
import { progressoQueries } from '@/services/progresso'
import { formatTamanho } from '@/utils/formatTamanho'

import { Aparencia } from './_components/Aparencia'
import { Cabecalho } from './_components/Cabecalho'
import { LinhaEditavel } from './_components/LinhaEditavel'
import { MatriculaSchema, NomeSchema, SemestreSchema } from './schema'
import * as S from './styles'

type Campo = 'nome' | 'matricula' | 'ingresso'

const MENSAGEM_SALVO: Record<Campo, string> = {
  nome: 'Nome salvo. Ele já entra no seu formulário.',
  matricula: 'Matrícula salva. Ela já entra no seu formulário.',
  ingresso: 'Semestre salvo. As horas foram recalculadas a partir dele.',
}

const campoInicial = (valor: string | null): Campo | null =>
  valor === 'nome' || valor === 'matricula' || valor === 'ingresso' ? valor : null

export function Perfil(): ReactNode {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [{ data: sessao }, { data: progresso }] = useSuspenseQueries({
    queries: [contaQueries.sessao(), progressoQueries.resumo()],
  })
  const [editando, setEditando] = useState<Campo | null>(() =>
    campoInicial(searchParams.get('editar')),
  )
  const [salvo, setSalvo] = useState<Campo | null>(null)
  const [isApagando, setIsApagando] = useState(false)

  const saida = useMutation({
    mutationFn: sair,
    onSuccess: () => {
      router.replace(ROUTES.login)
      queryClient.clear()
    },
  })

  if (!sessao || !sessao.curso) return null

  const atividades = progresso.itens.flatMap((i) => i.atividades)
  const bytes = atividades.reduce((soma, a) => soma + a.comprovante.tamanhoBytes, 0)

  const salvar = (campo: Campo) => async (valor: string) => {
    await atualizarPerfil({ [campo]: campo === 'ingresso' ? valor : valor || null })
    invalidateAfterContaWrite(queryClient)
    setEditando(null)
    setSalvo(campo)
  }

  const linha = (campo: Campo) => ({
    isEditando: editando === campo,
    onEditar: () => {
      setEditando(campo)
      setSalvo(null)
    },
    onCancelar: () => setEditando(null),
    onSalvar: salvar(campo),
    mensagemSalvo: salvo === campo ? MENSAGEM_SALVO[campo] : null,
  })

  return (
    <Screen topBar={<TopBar variant="tab" title="Perfil" />}>
      <Cabecalho nome={sessao.nome} email={sessao.email} />

      <S.Group aria-labelledby="grupo-dados">
        <S.GroupTitle id="grupo-dados">Seus dados</S.GroupTitle>
        <GroupedList>
          <li>
            <div className={S.row}>
              <S.Label>E-mail</S.Label>
              <S.Value title={sessao.email}>{sessao.email}</S.Value>
            </div>
          </li>
          <li>
            <LinhaEditavel
              label="Nome completo"
              valor={sessao.nome}
              vazio="Falta"
              hint="Como está nos seus documentos. Vai no formulário da coordenação."
              schema={NomeSchema}
              {...linha('nome')}
            />
          </li>
          <li>
            <LinhaEditavel
              label="Matrícula"
              valor={sessao.matricula}
              vazio="Não informada"
              hint="Vai no formulário da coordenação. Pode deixar em branco."
              inputMode="numeric"
              schema={MatriculaSchema}
              {...linha('matricula')}
            />
          </li>
          <li>
            <LinhaEditavel
              label="Semestre de início"
              valor={sessao.ingresso}
              vazio="Falta"
              hint="Só contam as atividades feitas a partir dele."
              inputMode="decimal"
              schema={SemestreSchema}
              {...linha('ingresso')}
            />
          </li>
        </GroupedList>
      </S.Group>

      <S.Group aria-labelledby="grupo-curso">
        <S.GroupTitle id="grupo-curso">Curso</S.GroupTitle>
        <GroupedList>
          <li>
            <Link href={ROUTES.trocarCurso} className={S.row}>
              <S.Label>
                {sessao.curso.nome}
                <S.Sub>
                  {sessao.curso.grau} · meta de {sessao.curso.meta}h
                </S.Sub>
              </S.Label>
              <S.Go>
                Trocar
                <Icon icon={ChevronRight} size={16} />
              </S.Go>
            </Link>
          </li>
        </GroupedList>
      </S.Group>

      <S.Group aria-labelledby="grupo-aparencia">
        <S.GroupTitle id="grupo-aparencia">Aparência</S.GroupTitle>
        <Aparencia />
        <S.Help>Automático segue o tema do celular.</S.Help>
      </S.Group>

      <S.Group aria-labelledby="grupo-sobre">
        <S.GroupTitle id="grupo-sobre">Sobre o SAACI</S.GroupTitle>
        <GroupedList>
          <li>
            <Link href={ROUTES.privacidade} className={S.row}>
              <S.Label>Aviso de privacidade</S.Label>
              <S.Chevron>
                <Icon icon={ChevronRight} size={16} />
              </S.Chevron>
            </Link>
          </li>
          <li>
            <button
              type="button"
              className={S.row}
              onClick={() => saida.mutate()}
              disabled={saida.isPending}
            >
              <S.Label>{saida.isPending ? 'Saindo' : 'Sair'}</S.Label>
            </button>
          </li>
        </GroupedList>
      </S.Group>

      <S.Danger>
        <button type="button" className={S.dangerButton} onClick={() => setIsApagando(true)}>
          Apagar minha conta
        </button>
        <S.Help>Apaga a conta, as atividades e os comprovantes. Não dá para desfazer.</S.Help>
      </S.Danger>

      <ApagarContaSheet
        isOpen={isApagando}
        onClose={() => setIsApagando(false)}
        email={sessao.email}
        isConfirmada
        totalAtividades={atividades.length}
        downloadSlot={
          atividades.length > 0 && (
            <p>
              <TextLink href={ROUTES.atividades}>
                Baixar meus {atividades.length} comprovantes antes, {formatTamanho(bytes)}
              </TextLink>
            </p>
          )
        }
      />
    </Screen>
  )
}
