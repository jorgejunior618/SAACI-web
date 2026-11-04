import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'

import { Icon } from '../../atoms/Icon'
import { IconLink } from '../../atoms/IconButton'
import { LogoSimbolo } from '../../atoms/Logo'
import * as S from './styles'

type Props =
  // Início e Seu curso: símbolo e nome.
  | { variant: 'brand' }
  // Atividades e Perfil: título grande.
  | { variant: 'tab'; title: string }
  // Registrar, Corrigir: título e ação à direita ("Fechar", "Cancelar").
  | { variant: 'task'; title: string; action: ReactNode }
  // Detalhe, Seu pedido: voltar e título.
  | { variant: 'back'; title: string; backHref: string; backLabel: string }

function Conteudo(props: Props): ReactNode {
  switch (props.variant) {
    case 'brand':
      return (
        <S.Brand>
          <LogoSimbolo width={24} />
          SAACI
        </S.Brand>
      )
    case 'tab':
      return <h1 className={S.tabTitle}>{props.title}</h1>
    case 'task':
      return (
        <>
          <h1 className={S.taskTitle}>{props.title}</h1>
          {props.action}
        </>
      )
    case 'back':
      return (
        <>
          <IconLink href={props.backHref} aria-label={props.backLabel}>
            <Icon icon={ChevronLeft} size={24} />
          </IconLink>
          <h1 className={S.taskTitle}>{props.title}</h1>
        </>
      )
  }
}

// Fica presa no topo. O canto direito fica livre para o botão do modo escuro (ThemeToggle).
export function TopBar(props: Props): ReactNode {
  return (
    <S.Bar hasBack={props.variant === 'back'}>
      <Conteudo {...props} />
    </S.Bar>
  )
}
