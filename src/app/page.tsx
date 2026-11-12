import { redirect } from 'next/navigation'

// A raiz leva ao painel. O SessionGate de `(aluno)` manda quem está sem sessão para /entrar.
export default function Page(): never {
  redirect('/inicio')
}
