require('dotenv').config();
const { DB_URL, DB_USER, DB_PASS, DB_DBNAME } = process.env;
console.log(process.env)
//Database Code Goes Here
const mongoose = require('mongoose');
mongoose.connect(DB_URL, {
  dbName: DB_DBNAME,
  user: DB_USER,
  pass: DB_PASS,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});


const userSchema = new mongoose.Schema({
  // your code here
  username: {
    type: String,
    required: [true, 'Username is Required'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password is Required'],
  },
  socket: {
    type: String,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;