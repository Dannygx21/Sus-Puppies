require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = () => {
  const { DB_URL, DB_DBNAME, DB_USER, DB_PASS } = process.env;

  mongoose
    .connect(DB_URL, { dbName: DB_DBNAME, user: DB_USER, pass: DB_PASS })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
};

module.exports = connectDB;