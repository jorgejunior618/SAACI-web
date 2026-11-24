// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

export { getPasswordLink, getSession } from './account.api'
export {
  EmailDomainError,
  EmailAlreadyRegisteredError,
  EmailNotConfirmedError,
  ExpiredLinkError,
  InvalidCredentialsError,
} from './account.errors'
export { accountKeys } from './account.keys'
export {
  clearSessionCache,
  confirmEmail,
  createAccount,
  deleteAccount,
  invalidateAfterPasswordUpdate,
  requestPasswordReset,
  resendConfirmation,
  signIn,
  signOut,
  updatePassword,
} from './account.mutations'
export { accountQueries } from './account.queries'
export { PasswordLinkSchema, SessionSchema, StudentEmailSchema } from './account.types'
export type { PasswordLink, Session, StudentEmail } from './account.types'
