const WebSocket = require('ws');
const http = require('http');

function req(path, payload) {
  return new Promise((resolve) => {
    const body = JSON.stringify(payload);
    const r = http.request({
      hostname: 'localhost',
      port: 8000,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    r.on('error', e => resolve({ status: 0, body: String(e) }));
    r.write(body);
    r.end();
  });
}

async function loginOrCreate(email, password, username, full_name) {
  let res = await req('/api/auth/login/', { email, password });
  if (res.status !== 200) {
    await req('/api/auth/register/', { email, password, username, full_name });
    // user must be active; backend is set to active in our setup script
    res = await req('/api/auth/login/', { email, password });
  }
  const json = JSON.parse(res.body);
  return json.access;
}

async function run() {
  const u1 = { email: 'user1@example.com', password: 'Password123!', username: 'user1', full_name: 'User One' };
  const u2 = { email: 'user2@example.com', password: 'Password123!', username: 'user2', full_name: 'User Two' };
  const t1 = await loginOrCreate(u1.email, u1.password, u1.username, u1.full_name);
  const t2 = await loginOrCreate(u2.email, u2.password, u2.username, u2.full_name);
  if (!t1 || !t2) { console.error('Token failure'); process.exit(1); }

  const ws1 = new WebSocket('ws://localhost:8000/ws/chat/', { headers: { Authorization: `Bearer ${t1}` } });
  const ws2 = new WebSocket('ws://localhost:8000/ws/chat/', { headers: { Authorization: `Bearer ${t2}` } });

  let received1 = false;
  let received2 = false;

  ws1.on('message', m => {
    const msg = JSON.parse(m.toString());
    if (msg.type === 'chat_message') {
      received1 = true;
      console.log('user1 got:', msg.message.content);
      if (received1 && received2) { ws1.close(); ws2.close(); }
    }
  });
  ws2.on('message', m => {
    const msg = JSON.parse(m.toString());
    if (msg.type === 'chat_message') {
      received2 = true;
      console.log('user2 got:', msg.message.content);
      if (received1 && received2) { ws1.close(); ws2.close(); }
    }
  });

  await new Promise(resolve => ws1.on('open', resolve));
  await new Promise(resolve => ws2.on('open', resolve));

  const res = await new Promise(resolve => {
    const r = http.request({
      hostname: 'localhost',
      port: 8000,
      path: '/api/auth/me/',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${t2}` }
    }, s => {
      let b = '';
      s.on('data', c => b += c);
      s.on('end', () => resolve(JSON.parse(b)));
    });
    r.end();
  });
  const recipientId = res.id;

  ws1.send(JSON.stringify({ content: 'hello friend', recipient_id: recipientId }));
}

run().catch(e => { console.error(e); process.exit(1); });
