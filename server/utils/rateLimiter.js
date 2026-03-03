const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

// Map<socketId, { attempts: number, lockedUntil: number }>
const records = new Map();

/**
 * Returns { blocked: false } if the socket is allowed to attempt,
 * or { blocked: true, message: string } if locked out.
 */
const checkRateLimit = (socketId) => {
  const now = Date.now();
  const rec = records.get(socketId);
  if (rec && rec.lockedUntil > now) {
    const remaining = Math.ceil((rec.lockedUntil - now) / 60000);
    return { blocked: true, message: `Too many failed attempts. Try again in ${remaining} minute(s).` };
  }
  return { blocked: false };
};

/** Call after each failed login/register attempt. */
const recordFailure = (socketId) => {
  const now = Date.now();
  const rec = records.get(socketId) ?? { attempts: 0, lockedUntil: 0 };
  rec.attempts += 1;
  if (rec.attempts >= MAX_ATTEMPTS) {
    rec.lockedUntil = now + LOCKOUT_MS;
  }
  records.set(socketId, rec);
};

/** Call after a successful login or register. */
const clearAttempts = (socketId) => records.delete(socketId);

module.exports = { checkRateLimit, recordFailure, clearAttempts };
