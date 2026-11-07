import { redirect } from 'next/navigation'

import { sections } from '@/features/design-system/Galeria'

export default function Page(): never {
  redirect(`/design-system/${sections[0].id}`)
}
