let io;

const initializeSocket = (httpServer) => {
    io = require("socket.io")(httpServer, { /* options */ });

    io.on("connection", (socket) => {
        console.log("a user connected:", socket.id);
    });
}

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized! Call initializeSocket first.");
    }
    return io;
}

module.exports = { initializeSocket, getIO };