import { ArrowLeft, User } from 'lucide-react'
import Image from 'next/image'
import type { ElementType, ReactNode } from 'react'

import { Button } from '../../atoms/Button'
import { Icon } from '../../atoms/Icon'
import * as S from './styles'

type TopBarBase = {
  /**
   * Elemento ou componente que desenha os links da barra. Padrão: `a`. Para navegar sem recarregar,
   * a feature passa o `Link` do `next/link`; o design system não importa o roteador.
   */
  linkAs?: ElementType
}

export type TopBarHomeProps = TopBarBase & {
  /** Barra da tela de Início: símbolo e nome do SAACI, Perfil e Sair. */
  variant: 'home'
  /** Destino do ícone de Perfil. */
  profileHref: string
  /** Ação do botão Sair, que é escrito por extenso. */
  onSignOut: () => void
}

type TopBarInnerBack =
  | {
      /** Destino do Voltar quando ele é um link. Sem `backHref` nem `onBack`, a barra não tem Voltar. */
      backHref: string
      onBack?: undefined
    }
  | {
      backHref?: undefined
      /** Ação do Voltar quando ele não leva a um endereço fixo (por exemplo, `router.back`). */
      onBack: () => void
    }
  | { backHref?: undefined; onBack?: undefined }

export type TopBarInnerProps = TopBarBase &
  TopBarInnerBack & {
    /** Barra de tela interna: título da tela e, se couber, Voltar. */
    variant: 'inner'
    /** Título da tela, o `h1` da página. Título longo é cortado com reticências. */
    title: string
  }

export type TopBarProps = TopBarHomeProps | TopBarInnerProps

/**
 * Barra de topo de 56px, no creme do fundo, sem borda parada e sem sombra.
 *
 * @remarks
 * `home` mostra o símbolo, o nome, Perfil (só ícone, com `aria-label`) e Sair (texto). `inner` mostra
 * Voltar (só ícone, com `aria-label`) e o título em `h1`; telas da barra inferior não passam Voltar.
 * A borda inferior aparece só quando o conteúdo rola por baixo, por CSS
 * (`animation-timeline: scroll()`, que segue o rolador mais próximo), sem JavaScript. Navegador sem esse recurso fica sem a borda. O espaço da área segura de cima faz parte
 * da altura. Precisa estar numa página que rola (use no `topBar` do `AppFrame`).
 *
 * @example
 * ```tsx
 * <TopBar variant="inner" title="Registrar atividade" backHref="/inicio" linkAs={NextLink} />
 * ```
 */
export function TopBar(props: TopBarProps): ReactNode {
  if (props.variant === 'home') {
    const { profileHref, onSignOut, linkAs } = props

    return (
      <S.Root variant="home">
        <S.Brand>
          <Image src="/logo-simbolo.png" width={24} height={24} alt="" />
          SAACI
        </S.Brand>
        <S.IconLink as={linkAs} href={profileHref} aria-label="Perfil">
          <Icon icon={User} />
        </S.IconLink>
        <Button variant="tertiary" onClick={onSignOut}>
          Sair
        </Button>
      </S.Root>
    )
  }

  const { title, backHref, onBack, linkAs } = props

  return (
    <S.Root variant="inner">
      {backHref ? (
        <S.IconLink as={linkAs} href={backHref} aria-label="Voltar">
          <Icon icon={ArrowLeft} />
        </S.IconLink>
      ) : onBack ? (
        <S.IconButton type="button" onClick={onBack} aria-label="Voltar">
          <Icon icon={ArrowLeft} />
        </S.IconButton>
      ) : null}
      <S.Title>{title}</S.Title>
    </S.Root>
  )
}
