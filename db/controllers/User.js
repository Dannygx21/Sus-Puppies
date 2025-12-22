import User from '../models/User.js';

export const UserController = {
    // login user from database
    login: async (req, res) => {
        const { username, password, socket } = req.body;
        try {
            let user = await this.findUser(username, password, socket)
            if (user) {
                res.status(200).send(user);
            } else {
                this.createUser(username, password, socket).then((newUser) => {
                    res.status(201).send(newUser);
                });
            }
        } catch (error) {
            console.error('Error in login:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    // create new user in database
    createUser: async (username, password, socket) => {
        try {
            let user = await this.findUser(username, password, socket)
            // if user not found, create new user
            if (!user) {
                let newUser = new User({ username, password, socket });
                await newUser.save();
                return newUser;
                // if user found, return user
            } else {
                return user;
            }
        } catch (error) {
            console.error('Error in createUser:', error);
        }
    },

    // find user
    findUser: async (username, password, socket) => {
        try {
            let user = await User.findOne({ username });
            // if user not found, user = null
            return user;
        } catch (error) {
            console.error('Error in findUser:', error);
            return error;
        }
    },


}
