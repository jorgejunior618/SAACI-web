import Link from 'next/link'

import { styled } from '@/styled-system/jsx'

export const Root = styled('nav', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6',
    padding: '4',
    background: 'surface',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'line',
    '@media (min-width: 768px)': {
      position: 'sticky',
      top: '0',
      alignSelf: 'start',
      height: '100vh',
      overflowY: 'auto',
      borderBottomWidth: '0',
      borderRightWidth: '1px',
      borderRightStyle: 'solid',
      borderRightColor: 'line',
    },
  },
})

export const Brand = styled('div', {
  base: { display: 'flex', flexDirection: 'column' },
})

export const BrandName = styled('span', {
  base: { textStyle: 'title' },
})

export const BrandNote = styled('span', {
  base: { textStyle: 'caption', color: 'ink.muted' },
})

export const Group = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '1' },
})

export const GroupTitle = styled('h2', {
  base: { textStyle: 'caption', color: 'ink.muted', paddingInline: '3', paddingBottom: '1' },
})

export const Item = styled(Link, {
  base: {
    display: 'flex',
    alignItems: 'center',
    minHeight: 'touch',
    paddingInline: '3',
    borderRadius: 'control',
    textStyle: 'label',
    color: 'ink',
    textDecoration: 'none',
    _hover: { background: 'surface.muted' },
    '&[aria-current="page"]': { background: 'surface.muted', color: 'brand.text' },
  },
})
