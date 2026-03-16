const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

// Map<username, { attempts: number, lockedUntil: number }>
const records = new Map();

/**
 * Returns { blocked: false } if the username is allowed to attempt,
 * or { blocked: true, message: string } if locked out.
 */
const checkRateLimit = (key) => {
  const now = Date.now();
  const rec = records.get(key);
  if (rec && rec.lockedUntil > now) {
    const remaining = Math.ceil((rec.lockedUntil - now) / 60000);
    return { blocked: true, message: `Too many failed attempts. Try again in ${remaining} minute(s).` };
  }
  return { blocked: false };
};

/** Call after each failed login/register attempt. */
const recordFailure = (key) => {
  const now = Date.now();
  const rec = records.get(key) ?? { attempts: 0, lockedUntil: 0 };
  rec.attempts += 1;
  if (rec.attempts >= MAX_ATTEMPTS) {
    rec.lockedUntil = now + LOCKOUT_MS;
  }
  records.set(key, rec);
};

/** Call after a successful login or register. */
const clearAttempts = (key) => records.delete(key);

module.exports = { checkRateLimit, recordFailure, clearAttempts };
