const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Benvenuto sul server del mio social network!');
});

server.listen(3000, () => {
  console.log('Server avviato su http://localhost:3000');
});
