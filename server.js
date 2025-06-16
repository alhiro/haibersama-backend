// server.js
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./socketHandler'); // ← import handler

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});

// Set io ke app agar bisa digunakan di controller
app.set('io', io);

// Jalankan socket handler di luar server.listen
socketHandler(io); // ← pasangkan socket.io handler

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port:${PORT}`);
});
