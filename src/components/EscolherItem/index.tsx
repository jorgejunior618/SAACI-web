'use client'

import { Search } from 'lucide-react'
import { type ReactNode, useState } from 'react'

import { Icon, ItemList, TextField } from '@design-system'

import type { Item } from '@/services/cursos'

import * as S from './styles'

const semAcento = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

type Props = {
  itens: readonly Item[]
  selecionado: number | null
  onEscolher: (numero: number) => void
  // "A sugestão era o item 7. Voltar para a sugestão".
  rodape?: ReactNode
}

// Busca entre os itens do formulário, por número ou nome.
export function EscolherItem({ itens, selecionado, onEscolher, rodape }: Props): ReactNode {
  const [busca, setBusca] = useState('')
  const termo = semAcento(busca.trim())
  const encontrados = itens.filter(
    (item) =>
      termo === '' ||
      String(item.numero) === termo ||
      semAcento(`${item.nome} ${item.regraResumo}`).includes(termo),
  )

  return (
    <S.Wrapper>
      <TextField
        label="Em qual item do formulário essa atividade entra?"
        type="search"
        autoComplete="off"
        placeholder="Busque por curso, palestra, evento…"
        leadingIcon={<Icon icon={Search} />}
        value={busca}
        onChange={(event) => setBusca(event.target.value)}
      />
      {encontrados.length > 0 ? (
        <ItemList
          label="Itens do formulário"
          selectedId={selecionado === null ? null : String(selecionado)}
          onSelect={(id) => onEscolher(Number(id))}
          items={encontrados.map((item) => ({
            id: String(item.numero),
            aside: String(item.numero),
            title: item.nome,
            description: item.regraResumo,
          }))}
        />
      ) : (
        <S.Empty role="status">
          Nenhum item com “{busca.trim()}”. Tente outra palavra, como curso, palestra ou evento.
        </S.Empty>
      )}
      {rodape}
    </S.Wrapper>
  )
}
