import { ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { Icon } from '@design-system'

import * as S from './styles'

export type AccessHeaderProps = {
  /**
   * `lg` é a tela Entrar: logo grande e centralizado, sem Voltar. `sm` é a das demais telas de
   * Acesso: logo menor à esquerda, com o Voltar só em ícone.
   */
  size: 'lg' | 'sm'
}

/**
 * Cabeçalho das telas de Acesso: o logo e, no tamanho `sm`, o Voltar para Entrar.
 *
 * @remarks
 * Fica em `features/acesso/_components/` porque várias telas do domínio o usam e ele não está no
 * catálogo do design system (ADR 0005). O Voltar sem título é uma exceção de design registrada nessa
 * ADR: o `aria-label` diz para onde ele leva e o alvo tem 48px.
 *
 * @example
 * ```tsx
 * <AccessHeader size="sm" />
 * ```
 */
export function AccessHeader({ size }: AccessHeaderProps): ReactNode {
  const width = size === 'lg' ? 216 : 144

  return (
    <S.Root size={size}>
      {size === 'sm' ? (
        <NextLink href="/entrar" className={S.back} aria-label="Voltar para Entrar">
          <Icon icon={ChevronLeft} />
        </NextLink>
      ) : null}
      <S.Logo size={size}>
        <Image
          src="/logo-completo.png"
          width={width}
          height={Math.round((width * 466) / 520)}
          alt="SAACI, Sistema de Apoio Acadêmico Colaborativo do IFCE"
          priority
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
      </S.Logo>
    </S.Root>
  )
}
