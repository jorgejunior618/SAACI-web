import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { findSection, sections } from '@/features/design-system/Galeria'

type Props = {
  params: Promise<{ secao: string }>
}

export const dynamicParams = false

export function generateStaticParams(): Array<{ secao: string }> {
  return sections.map(({ id }) => ({ secao: id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { secao } = await params

  return { title: findSection(secao)?.title }
}

export default async function Page({ params }: Props): Promise<ReactNode> {
  const { secao } = await params
  const section = findSection(secao)

  if (!section) notFound()

  return <section.Component />
}
