import {
  EmailAlreadyRegisteredError,
  EmailDomainError,
  EmailNotConfirmedError,
  ExpiredLinkError,
  InvalidCredentialsError,
} from './account.errors'
import type { Session } from './account.types'

type AccountRow = { email: string; password: string; emailConfirmed: boolean }
type LinkKind = 'confirmation' | 'password'

const DOMAIN = '@aluno.ifce.edu.br'
const SEED_EMAIL = 'ana.moura07@aluno.ifce.edu.br'

let accounts: AccountRow[] = []
let sessionEmail: string | null = null
let links = new Map<string, { email: string; kind: LinkKind }>()

/**
 * Volta o mock ao estado de exemplo: a aluna do protótipo (senha `senhaforte1`), com e-mail
 * confirmado e já logada. Testes chamam no `beforeEach`. Ao abrir o app, o módulo logo abaixo deixa
 * a sessão fechada.
 */
export function resetAccountMock(): void {
  accounts = [{ email: SEED_EMAIL, password: 'senhaforte1', emailConfirmed: true }]
  sessionEmail = SEED_EMAIL
  links = new Map()
}

resetAccountMock()
// O app nasce deslogado, para o fluxo de Acesso (entrar, criar conta, recuperar senha) poder ser
// visto. Não há botão Sair até a issue de Perfil, e a sessão do mock se perde a cada recarga.
sessionEmail = null

function toSession(account: AccountRow): Session {
  return { email: account.email, emailConfirmed: account.emailConfirmed }
}

function findAccount(email: string): AccountRow | undefined {
  return accounts.find((account) => account.email === email)
}

// O mock não manda e-mail: mostra o link no console de desenvolvimento. O token `expirado` sempre
// vale como link vencido, para testar a tela "Link expirado".
function issueLink(email: string, kind: LinkKind): void {
  const token = crypto.randomUUID()

  links.set(token, { email, kind })
  if (process.env.NODE_ENV === 'test') return

  const path = kind === 'confirmation' ? '/confirme-email' : '/nova-senha'

  console.info(`[mock] link de e-mail (${kind}): ${path}?token=${token}`)
}

function consumeLink(token: string, kind: LinkKind): AccountRow {
  const link = links.get(token)
  const account = link?.kind === kind ? findAccount(link.email) : undefined

  if (!link || !account) throw new ExpiredLinkError()
  links.delete(token)
  return account
}

/**
 * Lê o link de nova senha sem consumir. Token desconhecido, `expirado` ou de confirmação devolve
 * `null`.
 */
export function readPasswordLink(token: string): { email: string } | null {
  const link = links.get(token)
  const account = link?.kind === 'password' ? findAccount(link.email) : undefined

  return account ? { email: account.email } : null
}

/**
 * Só para teste e demonstração: último token emitido para o e-mail e o tipo de link. Quem usa o
 * mock não enxerga o token fora do console, então o teste o busca aqui.
 */
export function peekLastLinkMock(email: string, kind: LinkKind): string | undefined {
  let found: string | undefined

  for (const [token, link] of links) {
    if (link.email === email && link.kind === kind) found = token
  }
  return found
}

/** Sessão atual, ou `null` sem login. */
export function readSession(): Session | null {
  const account = sessionEmail ? findAccount(sessionEmail) : undefined

  return account ? toSession(account) : null
}

/** Abre a sessão se e-mail e senha conferem e o e-mail foi confirmado. */
export function openSession(email: string, password: string): Session {
  const account = findAccount(email)

  if (!account || account.password !== password) throw new InvalidCredentialsError()
  if (!account.emailConfirmed) throw new EmailNotConfirmedError()
  sessionEmail = account.email
  return toSession(account)
}

/** Fecha a sessão. Sem sessão aberta, não faz nada. */
export function closeSession(): void {
  sessionEmail = null
}

/** Cria a conta sem confirmar o e-mail e emite o link de confirmação. Não abre sessão. */
export function insertAccount(email: string, password: string): void {
  if (!email.endsWith(DOMAIN)) throw new EmailDomainError()
  if (findAccount(email)) throw new EmailAlreadyRegisteredError()
  accounts.push({ email, password, emailConfirmed: false })
  issueLink(email, 'confirmation')
}

/** Emite outro link de confirmação. Para e-mail sem conta ou já confirmado, não faz nada. */
export function reissueConfirmation(email: string): void {
  const account = findAccount(email)

  if (account && !account.emailConfirmed) issueLink(email, 'confirmation')
}

/** Emite o link de nova senha. Para e-mail sem conta, não faz nada e não avisa quem pediu. */
export function issuePasswordLink(email: string): void {
  if (findAccount(email)) issueLink(email, 'password')
}

/** Confirma o e-mail do link e abre a sessão. */
export function confirmByToken(token: string): Session {
  const account = consumeLink(token, 'confirmation')

  account.emailConfirmed = true
  sessionEmail = account.email
  return toSession(account)
}

/** Troca a senha pelo link, confirma o e-mail (o link prova o acesso à caixa) e abre a sessão. */
export function changePasswordByToken(token: string, password: string): Session {
  const account = consumeLink(token, 'password')

  account.password = password
  account.emailConfirmed = true
  sessionEmail = account.email
  return toSession(account)
}

/** Apaga a conta da sessão se a senha confere e fecha a sessão. */
export function removeSessionAccount(password: string): void {
  const account = sessionEmail ? findAccount(sessionEmail) : undefined

  if (!account || account.password !== password) throw new InvalidCredentialsError()
  accounts = accounts.filter((item) => item !== account)
  sessionEmail = null
}
