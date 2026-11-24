// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ComponentPropsWithoutRef, ComponentPropsWithRef, ReactNode } from 'react'

import * as S from './styles'

/** Tom do aviso: `neutral` é o padrão, `warning` e `danger` pedem atenção e `success` confirma. */
export type NoticeTone = 'neutral' | 'warning' | 'danger' | 'success'

type NoticeBaseProps = {
  /** Cor do texto (inline) ou do título (bloco). Padrão: `neutral`. */
  tone?: NoticeTone
}

export type InlineNoticeProps = NoticeBaseProps &
  ComponentPropsWithoutRef<'p'> & {
    /** Frase colada ao que ela comenta: só cor de texto, sem caixa e sem ícone. É o padrão. */
    format?: 'inline'
    /** A frase: o que aconteceu e o que fazer a seguir. */
    children: ReactNode
  }

export type BlockNoticeProps = NoticeBaseProps &
  Omit<ComponentPropsWithRef<'div'>, 'title'> & {
    /** Bloco com título, corpo e ações. */
    format: 'block'
    /** Fato em poucas palavras, na cor do tom ("O envio caiu no meio"). Nunca "Ocorreu um erro". */
    title?: ReactNode
    /** O próximo passo. Também recebe a lista de links do resumo de erros. */
    children?: ReactNode
    /** Ações do aviso, em geral `Link` ("Tentar de novo"). */
    actions?: ReactNode
    /** Bloco dentro de um cartão: o fundo passa a `surface.muted`. Padrão: `false`. */
    inCard?: boolean
  }

export type NoticeProps = InlineNoticeProps | BlockNoticeProps

// Erro depois de uma ação interrompe a leitura; o resto só informa.
function defaultRole(tone: NoticeTone): 'alert' | 'status' {
  return tone === 'danger' ? 'alert' : 'status'
}

/**
 * Aviso dentro da tela, sempre com o que aconteceu e o que fazer a seguir.
 *
 * @remarks
 * Tem dois formatos, do mais leve ao mais visível. A frase em linha (`inline`) é a regra para quase
 * todo aviso. O bloco (`block`) serve quando o aviso tem título e corpo ou ação própria. Use um só
 * nível de ênfase por tela: se já existe um bloco, os outros avisos viram frase em linha.
 *
 * O `role` é `alert` no tom `danger` e `status` nos demais; passe `role` para mudar. Para o resumo
 * de erros, use `format="block"`, `tone="danger"`, `tabIndex={-1}` e um `ref` para levar o foco até
 * ele no envio, mesmo quando há um erro só.
 *
 * @example
 * ```tsx
 * <Notice tone="warning">Palestras como ouvinte já chegaram ao limite de 30h.</Notice>
 *
 * <Notice format="block" tone="danger" title="O envio caiu no meio" actions={<Link as="button">Tentar de novo</Link>}>
 *   Nada foi registrado. O que você preencheu continua aqui.
 * </Notice>
 * ```
 */
export function Notice(props: NoticeProps): ReactNode {
  if (props.format === 'block') {
    const {
      format: _format,
      tone = 'neutral',
      title,
      children,
      actions,
      inCard = false,
      role = defaultRole(tone),
      ...rest
    } = props

    return (
      <S.Block {...rest} role={role} inCard={inCard}>
        {title ? <S.Title tone={tone}>{title}</S.Title> : null}
        {children ? <S.Body>{children}</S.Body> : null}
        {actions ? <S.Actions>{actions}</S.Actions> : null}
      </S.Block>
    )
  }

  const { format: _format, tone = 'neutral', role = defaultRole(tone), ...rest } = props

  return <S.Inline {...rest} role={role} tone={tone} />
}
