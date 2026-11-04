import { redirect } from 'next/navigation'

import { ROUTES } from '@/constants/routes'

// O SessionGate de /painel manda para Entrar, Confirme seu e-mail ou Seu curso quando preciso.
export default function HomePage(): never {
  redirect(ROUTES.painel)
}
