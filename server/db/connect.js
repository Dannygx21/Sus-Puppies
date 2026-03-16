const mongoose = require('mongoose');

const connectDB = () => {
  const { DB_URL, DB_DBNAME, DB_USER, DB_PASS } = process.env;

  return mongoose
    .connect(DB_URL, { dbName: DB_DBNAME, user: DB_USER, pass: DB_PASS, authSource: process.env.NODE_ENV === 'production' ? DB_DBNAME : 'admin' })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      throw err;
    });
};

module.exports = connectDB;