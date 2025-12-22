const mongoose = require('mongoose');
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