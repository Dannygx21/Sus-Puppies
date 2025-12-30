// environment file 
import 'dotenv/config'
const { DB_URL, DB_DBNAME, DB_USER, DB_PASS } = process.env;

// mongoDB worker
import mongoose from 'mongoose'

//User controller
import { UserController } from '../db/controllers/User';

// express server
import express from 'express'
const app = express()
app.use(express.json())
app.use(express.static(__dirname + '/../public'))

// socket io 
import { createServer } from 'http'
import { Server } from 'socket.io'
const httpServer = createServer(app)
export default io = new Server(httpServer, {})


//connect to mongoDB
mongoose.connect(DB_URL, {
    dbName: DB_DBNAME,
    user: DB_USER,
    pass: DB_PASS,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// start server
httpServer.listen(3000, () => {
    console.log('Werewolf listening on port 3000')
})