export type AuthMode = 'login' | 'register' | 'forgot-password'
export interface AuthDraft {
  name: string
  email: string
  password: string
}
export type AuthErrors = Partial<Record<keyof AuthDraft, string>>

export function validateAuth(mode: AuthMode, draft: AuthDraft): AuthErrors {
  const errors: AuthErrors = {}
  if (mode === 'register' && !draft.name.trim())
    errors.name = 'Enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim()))
    errors.email = 'Enter a valid email address.'
  if (mode !== 'forgot-password' && draft.password.length < 8)
    errors.password = 'Use at least 8 characters.'
  return errors
}
