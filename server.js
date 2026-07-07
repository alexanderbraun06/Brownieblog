const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('./models/user');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || '';
const USE_MONGODB = Boolean(MONGODB_URI);

let inMemoryUsers = [];
let dbReady = false;

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function initDatabase() {
  if (!USE_MONGODB) {
    console.log('MongoDB URI not provided. Using in-memory storage.');
    console.log('Per usare MongoDB, avvia il server con: $env:MONGODB_URI="mongodb://127.0.0.1:27017/brownieblog"');
    dbReady = true;
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    dbReady = true;
    console.log('Connected to MongoDB.');
  } catch (error) {
    console.warn('MongoDB unavailable, falling back to in-memory storage:', error.message);
    dbReady = true;
  }
}

async function findUserByEmail(email) {
  if (dbReady && USE_MONGODB) {
    return User.findOne({ email }).lean();
  }

  return inMemoryUsers.find((user) => user.email === email) || null;
}

async function saveUser(userData) {
  if (dbReady && USE_MONGODB) {
    return User.create(userData);
  }

  inMemoryUsers.push(userData);
  return userData;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function serveStatic(res, filePath, contentType) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(res, 404, { error: 'File not found' });
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store'
    });
    res.end(data);
  });
}

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (url.pathname === '/api/register' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const { username, name, email, password, birthDate } = body;

    if (!username || !name || !email || !password || !birthDate) {
      sendJson(res, 400, { error: 'Tutti i campi sono obbligatori.' });
      return;
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      sendJson(res, 409, { error: 'Email già registrata.' });
      return;
    }

    const newUser = await saveUser({
      username,
      name,
      email,
      passwordHash: hashPassword(password),
      birthDate,
      createdAt: new Date()
    });

    sendJson(res, 201, {
      message: 'Registrazione effettuata con successo!',
      user: {
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        birthDate: newUser.birthDate
      }
    });
    return;
  }

  if (url.pathname === '/api/login' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const { email, password } = body;

    if (!email || !password) {
      sendJson(res, 400, { error: 'Email e password sono obbligatorie.' });
      return;
    }

    const user = await findUserByEmail(email);
    if (!user || user.passwordHash !== hashPassword(password)) {
      sendJson(res, 401, { error: 'Credenziali non valide.' });
      return;
    }

    sendJson(res, 200, {
      message: 'Login effettuato con successo!',
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        birthDate: user.birthDate
      }
    });
    return;
  }

  if (url.pathname === '/health') {
    sendJson(res, 200, { status: 'ok' });
    return;
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    serveStatic(res, path.join(__dirname, 'index.html'), 'text/html; charset=utf-8');
    return;
  }

  if (url.pathname === '/index.js') {
    serveStatic(res, path.join(__dirname, 'index.js'), 'application/javascript; charset=utf-8');
    return;
  }

  sendJson(res, 404, { error: 'Pagina non trovata' });
});

initDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
  });
});
