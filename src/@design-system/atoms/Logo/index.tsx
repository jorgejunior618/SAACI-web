import Image from 'next/image'
import type { ReactNode } from 'react'

import * as S from './styles'

const NOME = 'SAACI, Sistema de Apoio Acadêmico Colaborativo do IFCE'

type Props = {
  width: number
}

export function LogoCompleto({ width }: Props): ReactNode {
  return (
    <span className={S.plate}>
      <Image
        src="/logo-completo.png"
        alt={NOME}
        width={width}
        height={Math.round((width * 466) / 520)}
        priority
      />
    </span>
  )
}

export function LogoSimbolo({ width }: Props): ReactNode {
  return <Image src="/logo-simbolo.png" alt="" width={width} height={width} />
}
