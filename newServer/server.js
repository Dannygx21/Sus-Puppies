import mongoose from "mongoose";
import "dotenv/config";
const { DB_URL, DB_DBNAME, DB_USER, DB_PASS } = process.env;

import express from "express";
import http from "http";
import { initializeSocket, getIO } from "./Socket/socket.cjs";

const app = express();
const httpServer = http.createServer(app);
initializeSocket(httpServer);

mongoose.set("strictQuery", false);
mongoose.connect(DB_URL, {
    dbName: DB_DBNAME,
    user: DB_USER,
    pass: DB_PASS,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
})

app.get("/", (req, res) => {
    getIO().emit("message", "Hello from server!");
    res.send("Hello from the new server!");
});

httpServer.listen(3000);