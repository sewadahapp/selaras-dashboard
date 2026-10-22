import { describe, expect, test } from 'bun:test'
import { validateAuth } from '../../shared/utils/auth'

describe('auth screen validation', () => {
  test('login rejects incomplete credentials', () => {
    expect(
      validateAuth('login', { name: '', email: 'bad', password: 'short' }),
    ).toEqual({
      email: 'Enter a valid email address.',
      password: 'Use at least 8 characters.',
    })
  })
  test('registration requires a name', () => {
    expect(
      validateAuth('register', {
        name: ' ',
        email: 'you@example.com',
        password: '12345678',
      }).name,
    ).toBeDefined()
  })
  test('recovery requires only a valid email', () => {
    expect(
      validateAuth('forgot-password', {
        name: '',
        email: 'you@example.com',
        password: '',
      }),
    ).toEqual({})
  })
})
