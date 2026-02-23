const WebSocket = require('ws');
const http = require('http');

const creds = { email: 'user1@example.com', password: 'Password123!', username: 'user1', full_name: 'User One' };
const data = JSON.stringify({ email: creds.email, password: creds.password });

function request(path, payload, cb) {
  const req = http.request({
    hostname: 'localhost',
    port: 8000,
    path,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
  }, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => cb(res.statusCode, body));
  });
  req.on('error', error => console.error(error));
  req.write(payload);
  req.end();
}

function connect(token) {
  const ws = new WebSocket(`ws://localhost:8000/ws/status/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  ws.on('open', () => { console.log('✅ WS Connected successfully!'); ws.close(); });
  ws.on('error', err => console.error('❌ WS Error:', err.message));
  ws.on('close', (code, reason) => console.log(`🔌 WS Closed: ${code} ${reason.toString()}`));
}

request('/api/auth/login/', data, (status, body) => {
  if (status === 200) {
    const token = JSON.parse(body).access;
    if (!token) { console.error('No token'); return; }
    connect(token);
  } else {
    const reg = JSON.stringify({ email: creds.email, password: creds.password, username: creds.username, full_name: creds.full_name });
    request('/api/auth/register/', reg, () => {
      request('/api/auth/login/', data, (s2, b2) => {
        if (s2 === 200) {
          const token = JSON.parse(b2).access;
          if (!token) { console.error('No token'); return; }
          connect(token);
        } else {
          console.error('Login failed', b2);
        }
      });
    });
  }
});
