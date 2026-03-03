const bcrypt = require('bcryptjs');
const User = require('../models/User');

const SALT_ROUNDS = 10;

const findUser = async (username) => {
  try {
    return await User.findOne({ username });
  } catch (err) {
    console.error('findUser error:', err);
    return null;
  }
};

/**
 * Authenticate an existing user.
 * Returns { success: true, user } or { success: false, reason: string }.
 * Uses the same error message for "not found" and "wrong password" to prevent
 * username enumeration.
 */
const login = async (username, password) => {
  try {
    const user = await findUser(username);
    if (!user) return { success: false, reason: 'Invalid credentials.' };

    const match = await bcrypt.compare(password, user.password);
    if (!match) return { success: false, reason: 'Invalid credentials.' };

    return { success: true, user };
  } catch (err) {
    console.error('login error:', err);
    return { success: false, reason: 'Server error.' };
  }
};

/**
 * Register a new user.
 * Returns { success: true, user } or { success: false, reason: string }.
 */
const createUser = async (username, password, socketId) => {
  try {
    const existing = await findUser(username);
    if (existing) return { success: false, reason: 'Username already taken.' };

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = new User({ username, password: hashed, socket: socketId });
    await newUser.save();
    return { success: true, user: newUser };
  } catch (err) {
    console.error('createUser error:', err);
    return { success: false, reason: 'Server error.' };
  }
};

module.exports = { login, findUser, createUser };
