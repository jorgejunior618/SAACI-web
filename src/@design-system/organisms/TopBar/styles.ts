import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

export const Bar = styled('header', {
  base: {
    position: 'sticky',
    top: '0',
    zIndex: '10',
    display: 'flex',
    alignItems: 'center',
    flexShrink: '0',
    height: 'topbar',
    paddingLeft: '4',
    // Espaço do botão do modo escuro, que fica por cima neste canto.
    paddingRight: 'calc(token(sizes.touch) + token(spacing.1))',
    background: 'surface.sunken',
  },
  variants: {
    hasBack: {
      true: { paddingLeft: '0' },
    },
  },
})

export const Brand = styled('span', {
  base: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: '600',
    letterSpacing: '-0.2px',
    color: 'brand.text',
  },
})

export const taskTitle = css({
  flex: '1',
  margin: '0',
  textStyle: 'bodyStrong',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
})

export const tabTitle = css({ flex: '1', margin: '0', textStyle: 'title' })
