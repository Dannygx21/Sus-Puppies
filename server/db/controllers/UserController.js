const User = require('../models/User');

/**
 * Find a user by username. Returns the user document or null.
 */
const findUser = async (username) => {
  try {
    return await User.findOne({ username });
  } catch (err) {
    console.error('findUser error:', err);
    return null;
  }
};

/**
 * Create a new user. If the username already exists, returns the existing user.
 */
const createUser = async (username, password, socket) => {
  try {
    const existing = await findUser(username);
    if (existing) return existing;

    const newUser = new User({ username, password, socket });
    await newUser.save();
    return newUser;
  } catch (err) {
    console.error('createUser error:', err);
    return null;
  }
};

/**
 * Auto-register login: find the user, or create one if they don't exist yet.
 * Returns the user document, or null on failure.
 */
const login = async (username, password, socketId) => {
  try {
    const user = await findUser(username);
    return user ?? (await createUser(username, password, socketId));
  } catch (err) {
    console.error('login error:', err);
    return null;
  }
};

module.exports = { login, findUser, createUser };