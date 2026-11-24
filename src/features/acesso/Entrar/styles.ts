// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { styled } from '@/styled-system/jsx'

export const Page = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6',
    minHeight: '100dvh',
    paddingInline: '6',
    paddingBlock: '6',
  },
})

export const Intro = styled('p', {
  base: { margin: '0', textAlign: 'center', textStyle: 'body', color: 'ink.muted' },
})

export const Form = styled('form', {
  base: { display: 'flex', flexDirection: 'column', gap: '6' },
})

export const Fields = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '4' },
})

// Senha e o que vem logo abaixo dela (esqueci a senha ou o erro) andam juntos.
export const PasswordBlock = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '2' },
})

export const HelpLine = styled('p', {
  base: { margin: '0', textStyle: 'support', color: 'ink.muted' },
})

export const Footer = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    marginBlockStart: 'auto',
    textAlign: 'center',
  },
})

export const Question = styled('p', {
  base: { margin: '0', textStyle: 'body', color: 'ink.muted' },
})
