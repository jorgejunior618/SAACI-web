import { styled } from '@/styled-system/jsx'

import { blockNotice, inlineNotice, noticeTitle } from './recipe'

export const Inline = styled('p', inlineNotice)

export const Block = styled('div', blockNotice)

export const Title = styled('p', noticeTitle)

export const Body = styled('div', {
  base: {
    textStyle: 'support',
    color: 'ink.muted',
    // Resumo de erros: uma lista de links, um por campo com problema.
    '& ul': { margin: '0', marginBlockStart: '1', paddingInlineStart: '18px', lineHeight: '22px' },
    '& ul a': { color: 'danger', textUnderlineOffset: '3px' },
  },
})

export const Actions = styled('div', {
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2 4',
    marginBlockStart: '2',
  },
})
