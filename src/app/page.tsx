import { redirect } from 'next/navigation'

// Até o SessionGate decidir de verdade (issue de Acesso), toda visita à raiz cai no painel.
export default function Page(): never {
  redirect('/inicio')
}
