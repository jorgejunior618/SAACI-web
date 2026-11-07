import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import type { ElementType, ReactNode } from 'react'

import { Icon } from '../../atoms/Icon'
import * as S from './styles'

type TopBarBase = {
  /**
   * Elemento ou componente que desenha os links da barra. Padrão: `a`. Para navegar sem recarregar,
   * a feature passa o `Link` do `next/link`; o design system não importa o roteador.
   */
  linkAs?: ElementType
}

export type TopBarHomeProps = {
  /** Barra da tela de Início: só o símbolo e o nome do SAACI. Perfil é uma aba da barra inferior. */
  variant: 'home'
}

export type TopBarRootProps = {
  /** Barra de uma aba da barra inferior (Atividades, Eventos, Perfil): o título da tela, sem Voltar. */
  variant: 'root'
  /** Título da tela, o `h1` da página. Título longo é cortado com reticências. */
  title: string
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

export type TopBarProps = TopBarHomeProps | TopBarRootProps | TopBarInnerProps

/**
 * Barra de topo de 56px, no creme do fundo, sem borda parada e sem sombra.
 *
 * @remarks
 * `home` mostra só o símbolo e o nome, e é a barra do Início. `root` mostra o título da aba em `h1`
 * (`title`, 20px), sem Voltar: é a barra de Atividades, Eventos e Perfil. `inner` mostra Voltar (só
 * ícone, com `aria-label`) e o título em `h1` de 16px, para as telas que abrem a partir de uma aba.
 * A borda inferior aparece só quando o conteúdo rola por baixo, por CSS
 * (`animation-timeline: scroll()`, que segue o rolador mais próximo), sem JavaScript. Navegador sem
 * esse recurso fica sem a borda. O espaço da área segura de cima faz parte da altura. Precisa estar
 * numa página que rola (use no `topBar` do `AppFrame`).
 *
 * @example
 * ```tsx
 * <TopBar variant="root" title="Atividades" />
 * <TopBar variant="inner" title="Registrar atividade" backHref="/inicio" linkAs={NextLink} />
 * ```
 */
export function TopBar(props: TopBarProps): ReactNode {
  if (props.variant === 'home') {
    return (
      <S.Root variant="home">
        <S.Brand>
          <Image src="/logo-simbolo.png" width={24} height={24} alt="" />
          SAACI
        </S.Brand>
      </S.Root>
    )
  }

  if (props.variant === 'root') {
    return (
      <S.Root variant="root">
        <S.Title level="root">{props.title}</S.Title>
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
      <S.Title level="inner">{title}</S.Title>
    </S.Root>
  )
}
