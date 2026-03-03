require('dotenv').config();

const http = require('http');
const fs = require('fs');
const path = require('path');

const { Server } = require('socket.io');
const connectDB = require('./db/connect');
const registerSocketHandlers = require('./socket/index');

// ─── Global error guards ───────────────────────────────────────────────────────

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception — shutting down:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection — shutting down:', reason);
  process.exit(1);
});

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '../public');

// ─── Static file server (no Express needed) ──────────────────────────────────

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

const serveFile = (filePath, res) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
};

const httpServer = http.createServer((req, res) => {
  // Strip query strings from the path
  const urlPath = req.url.split('?')[0];
  const filePath = path.join(PUBLIC_DIR, urlPath === '/' ? 'index.html' : urlPath);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Fall back to index.html for unknown routes (SPA support)
      serveFile(path.join(PUBLIC_DIR, 'index.html'), res);
    } else {
      serveFile(filePath, res);
    }
  });
});

// ─── Socket.io ────────────────────────────────────────────────────────────────

const io = new Server(httpServer);

registerSocketHandlers(io);

// ─── Start ────────────────────────────────────────────────────────────────────

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Werewolf listening on port ${PORT}`);
    }).on('error', (err) => {
      console.error('Server failed to bind port:', err);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('Database connection failed — aborting startup:', err);
    process.exit(1);
  });