import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

import { Icon } from '../../atoms/Icon'
import * as S from './styles'

type Props = {
  summary: ReactNode
  children: ReactNode
  isOpen?: boolean
}

export function Disclosure({ summary, children, isOpen }: Props): ReactNode {
  return (
    <details className={S.details} open={isOpen}>
      <summary>
        <span className={S.summaryContent}>{summary}</span>
        <span data-chevron>
          <Icon icon={ChevronDown} />
        </span>
      </summary>
      {children}
    </details>
  )
}
