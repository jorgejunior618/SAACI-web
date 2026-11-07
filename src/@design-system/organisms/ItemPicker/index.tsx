'use client'

import { Search } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { FocusEvent, KeyboardEvent, ReactNode } from 'react'

import { VisuallyHidden } from '@/styled-system/jsx'

import { TextField } from '../../molecules/TextField'
import { describeEmpty, filterItems } from './utils'
import * as S from './styles'

/** Um item do formulário do curso. */
export type ItemPickerItem = {
  /** Número do item no formulário oficial (7). */
  number: number
  /** Nome do item ("Curso na área de engenharia de computação"). */
  name: string
  /** A regra em texto simples, já com o máximo ("1h para cada 4h de curso, até 60h"). */
  rule: string
}

export type ItemPickerProps = {
  /** Itens do curso do aluno, na ordem do formulário. A ordem é mantida na busca. */
  items: ItemPickerItem[]
  /** Número do item escolhido. `null` deixa tudo desmarcado, que é o padrão ao abrir. */
  value: number | null
  /** Recebe o número do item escolhido. */
  onChange: (number: number) => void
  /** Texto da busca, controlado pela tela. Volta a vazio sozinho depois de uma escolha. */
  query: string
  /** Recebe o texto digitado na busca. */
  onQueryChange: (query: string) => void
  /** Pergunta que o campo responde ("Em qual item do formulário essa atividade entra?"). */
  label: string
  /** Palavras que costumam dar resultado, para a frase de busca vazia ("evento", "curso"). */
  suggestions?: string[]
}

/** Textos fixos do componente. Os que variam por tela chegam por prop. */
const TEXT = {
  placeholder: 'Buscar, ex.: palestra',
  group: 'Itens do formulário',
} as const

/**
 * Campo de busca que abre uma lista flutuante com os itens do formulário do curso, na ordem do
 * formulário.
 *
 * @remarks
 * Use no bloco Item do registro, quando a leitura não sugeriu nada ou o aluno tocou em "Escolher
 * outro". A lista é um painel sobre o conteúdo, logo abaixo do campo: abre ao tocar ou digitar, fecha
 * ao escolher, com Esc ou ao sair do campo, e nunca empurra o que vem depois. Com mais de uns cinco
 * itens, rola dentro do painel.
 *
 * É um combobox: o foco fica no campo, as setas movem o item destacado, Enter escolhe e Esc fecha.
 * Fechado, o campo mostra o item escolhido ("7 · Curso na área..."); aberto, volta a ser a busca.
 * É controlado e nenhum item vem marcado: o `value` só existe se a pessoa já escolheu. Não existe a
 * opção "Não sei". O filtro é `filterItems` e casa com o nome e com a regra. Sem resultado, a frase
 * diz o que tentar. Guarda estado de abertura, então é um Client Component.
 *
 * @example
 * ```tsx
 * <ItemPicker
 *   label="Em qual item do formulário essa atividade entra?"
 *   items={items}
 *   value={item}
 *   onChange={setItem}
 *   query={query}
 *   onQueryChange={setQuery}
 *   suggestions={['evento', 'curso']}
 * />
 * ```
 */
export function ItemPicker({
  items,
  value,
  onChange,
  query,
  onQueryChange,
  label,
  suggestions,
}: ItemPickerProps): ReactNode {
  const listId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const visible = filterItems(items, query)
  const isEmpty = visible.length === 0
  const isListShown = isOpen && !isEmpty
  const selected = items.find((item) => item.number === value)
  const active = activeIndex >= 0 ? visible[activeIndex] : undefined
  const emptyMessage = describeEmpty(query, suggestions)

  const optionId = (number: number): string => `${listId}-${number}`

  // Mantém o item destacado pelo teclado à vista quando a lista rola.
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  function close(): void {
    setIsOpen(false)
    setActiveIndex(-1)
  }

  function choose(item: ItemPickerItem): void {
    onChange(item.number)
    onQueryChange('')
    close()
  }

  function move(step: 1 | -1): void {
    if (isEmpty) return

    setIsOpen(true)
    setActiveIndex((current) => {
      if (current < 0) return step === 1 ? 0 : visible.length - 1

      return (current + step + visible.length) % visible.length
    })
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      move(1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      move(-1)
    } else if (event.key === 'Enter' && isListShown && active) {
      // Não envia o formulário da tela: aqui Enter só escolhe.
      event.preventDefault()
      choose(active)
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault()
      close()
    }
  }

  // Sair do campo e do painel fecha a lista. Tocar no painel não tira o foco do campo.
  function handleBlur(event: FocusEvent<HTMLDivElement>): void {
    const next = event.relatedTarget

    if (!(next instanceof Node) || !event.currentTarget.contains(next)) close()
  }

  return (
    <S.Root onBlur={handleBlur}>
      <TextField
        label={label}
        type="text"
        role="combobox"
        icon={Search}
        placeholder={TEXT.placeholder}
        autoComplete="off"
        spellCheck={false}
        value={!isOpen && selected ? `${selected.number} · ${selected.name}` : query}
        onChange={(event) => {
          onQueryChange(event.target.value)
          setActiveIndex(-1)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onClick={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        aria-expanded={isListShown}
        aria-controls={isListShown ? listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={isListShown && active ? optionId(active.number) : undefined}
      />
      {isListShown ? (
        <S.Popup
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={TEXT.group}
          // Mantém o foco no campo quando a pessoa toca numa linha.
          onMouseDown={(event) => event.preventDefault()}
        >
          {visible.map((item, index) => (
            <S.Option
              key={item.number}
              id={optionId(item.number)}
              role="option"
              aria-selected={value === item.number}
              data-active={index === activeIndex ? 'true' : undefined}
              onClick={() => choose(item)}
            >
              <S.ItemNumber>{item.number}</S.ItemNumber>
              <S.Text>
                <S.Name>{item.name}</S.Name>
                <S.Rule>{item.rule}</S.Rule>
              </S.Text>
            </S.Option>
          ))}
        </S.Popup>
      ) : null}
      {isOpen && isEmpty ? <S.EmptyBox aria-hidden="true">{emptyMessage}</S.EmptyBox> : null}
      {/* Sempre montado: o leitor de tela só anuncia mudança numa região que já existia. */}
      <VisuallyHidden role="status">{isOpen && isEmpty ? emptyMessage : ''}</VisuallyHidden>
    </S.Root>
  )
}
