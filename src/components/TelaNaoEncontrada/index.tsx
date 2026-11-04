import { SearchX } from 'lucide-react'
import type { ReactNode } from 'react'

import { ButtonLink, StateScreen } from '@design-system'

type Props = {
  title: string
  text: string
  href: string
  linkLabel: string
}

export function TelaNaoEncontrada({ title, text, href, linkLabel }: Props): ReactNode {
  return (
    <StateScreen
      icon={SearchX}
      title={title}
      headingLevel="h1"
      actions={
        <ButtonLink href={href} variant="secondary" isBlock>
          {linkLabel}
        </ButtonLink>
      }
    >
      <p>{text}</p>
    </StateScreen>
  )
}
