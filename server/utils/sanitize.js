/**
 * Ensures a value is a string and trims it to maxLen characters.
 * Returns null if the value is not a string (blocks NoSQL injection objects).
 */
const sanitizeString = (val, maxLen) => {
  if (typeof val !== 'string') return null;
  return val.slice(0, maxLen).trim();
};

/** Username: 3–20 alphanumeric characters only. */
const isValidUsername = (val) => /^[a-zA-Z0-9]{3,20}$/.test(val ?? '');

/** Password: 8–64 characters. */
const isValidPassword = (val) => typeof val === 'string' && val.length >= 8 && val.length <= 64;

module.exports = { sanitizeString, isValidUsername, isValidPassword };
