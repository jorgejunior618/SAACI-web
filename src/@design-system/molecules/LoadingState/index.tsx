import type { ReactNode } from 'react'

import { styled } from '@/styled-system/jsx'

import { Spinner } from '../../atoms/Spinner'

const Wrapper = styled('div', {
  base: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3',
    minHeight: '50dvh',
    textStyle: 'support',
    color: 'ink.muted',
  },
})

export function LoadingState({ label = 'Carregando' }: { label?: string }): ReactNode {
  return (
    <Wrapper role="status">
      <Spinner size="lg" />
      {label}
    </Wrapper>
  )
}
