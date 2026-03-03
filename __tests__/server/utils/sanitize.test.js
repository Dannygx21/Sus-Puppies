const { sanitizeString, isValidUsername, isValidPassword } = require('../../../server/utils/sanitize')

describe('sanitizeString', () => {
  test('trims the string to maxLen characters', () => {
    expect(sanitizeString('hello world', 5)).toBe('hello')
  })

  test('strips leading and trailing whitespace', () => {
    expect(sanitizeString('  hi  ', 100)).toBe('hi')
  })

  test('returns null for non-string values', () => {
    expect(sanitizeString(123, 100)).toBeNull()
    expect(sanitizeString({ $gt: '' }, 100)).toBeNull()
    expect(sanitizeString(null, 100)).toBeNull()
  })

  test('returns an empty string when input is only whitespace', () => {
    expect(sanitizeString('   ', 100)).toBe('')
  })

})

describe('isValidUsername', () => {
  test('accepts a valid alphanumeric username', () => {
    expect(isValidUsername('Alice123')).toBe(true)
  })

  test('rejects usernames shorter than 3 characters', () => {
    expect(isValidUsername('ab')).toBe(false)
    expect(isValidUsername('')).toBe(false)
    expect(isValidUsername('abc')).toBe(true)
  })

  test('rejects usernames longer than 20 characters', () => {
    expect(isValidUsername('a'.repeat(21))).toBe(false)
    expect(isValidUsername('a'.repeat(20))).toBe(true)
  })

  test('rejects special characters and spaces', () => {
    expect(isValidUsername('my name')).toBe(false)
    expect(isValidUsername('user@name')).toBe(false)
  })
})

describe('isValidPassword', () => {
  test('accepts a valid password with (8-64 characters)', () => {
    expect(isValidPassword('ValidPassword123!@#')).toBe(true)
  })

  test('rejects passwords with only 7 characters', () => {
    expect(isValidPassword('a'.repeat(7))).toBe(false)
    expect(isValidPassword('a'.repeat(8))).toBe(true)
  })

  test('rejects passwords with over 64 characters', () => {
    expect(isValidPassword('a'.repeat(65))).toBe(false)
    expect(isValidPassword('a'.repeat(64))).toBe(true)
  })

  test('rejects a non-string (typeof number)', () => {
    expect(isValidPassword(12345678910)).toBe(false)
  })
})