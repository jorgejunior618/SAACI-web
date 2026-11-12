/** Chaves de cache do domínio `account`. */
export const accountKeys = {
  all: ['account'] as const,
  session: () => [...accountKeys.all, 'session'] as const,
  passwordLink: (token: string) => [...accountKeys.all, 'password-link', token] as const,
}
