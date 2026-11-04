'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import type * as v from 'valibot'

import { Button, Icon, InlineMessage, TextField } from '@design-system'

import type { CampoForm } from '../../schema'
import * as S from './styles'

type Props = {
  label: string
  valor: string | null
  // Texto quando não há valor: "Falta", "Não informada".
  vazio: string
  hint?: string
  inputMode?: 'text' | 'numeric' | 'decimal'
  schema: v.GenericSchema<CampoForm, CampoForm>
  isEditando: boolean
  onEditar: () => void
  onCancelar: () => void
  onSalvar: (valor: string) => Promise<void>
  mensagemSalvo: string | null
}

// Linha de configuração que abre a edição no próprio lugar.
export function LinhaEditavel({
  label,
  valor,
  vazio,
  hint,
  inputMode,
  schema,
  isEditando,
  onEditar,
  onCancelar,
  onSalvar,
  mensagemSalvo,
}: Props): ReactNode {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CampoForm>({ resolver: valibotResolver(schema), values: { valor: valor ?? '' } })

  if (!isEditando) {
    return (
      <>
        <button type="button" className={S.row} onClick={onEditar}>
          <S.Label>{label}</S.Label>
          <S.Value>{valor ?? vazio}</S.Value>
          <S.Chevron>
            <Icon icon={ChevronRight} size={16} />
          </S.Chevron>
        </button>
        {mensagemSalvo && (
          <S.Saved>
            <InlineMessage tone="success" role="status">
              {mensagemSalvo}
            </InlineMessage>
          </S.Saved>
        )}
      </>
    )
  }

  return (
    <S.Form
      noValidate
      onSubmit={handleSubmit(async ({ valor: novo }) => {
        try {
          await onSalvar(novo.trim())
        } catch {
          setError('valor', {
            message: 'Não deu para salvar agora. Confira sua internet e tente de novo.',
          })
        }
      })}
    >
      <TextField
        label={label}
        hint={hint}
        inputMode={inputMode}
        autoFocus
        error={errors.valor?.message}
        {...register('valor')}
      />
      <S.Buttons>
        <Button variant="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isSubmitting ? 'Salvando' : 'Salvar'}
        </Button>
      </S.Buttons>
    </S.Form>
  )
}
