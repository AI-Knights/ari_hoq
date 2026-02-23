const WebSocket = require('ws');
const http = require('http');

function req(path, payload, method = 'POST', headers = {}) {
  return new Promise((resolve) => {
    const body = payload ? JSON.stringify(payload) : '';
    const r = http.request({
      hostname: 'localhost',
      port: 8000,
      path,
      method,
      headers: Object.assign(
        { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
        headers
      )
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    r.on('error', e => resolve({ status: 0, body: String(e) }));
    if (body) r.write(body);
    r.end();
  });
}

async function login(email, password) {
  const res = await req('/api/auth/login/', { email, password });
  if (res.status !== 200) throw new Error('login failed: ' + res.body);
  return JSON.parse(res.body).access;
}

async function run() {
  const u1 = { email: 'user1@example.com', password: 'Password123!' };
  const u2 = { email: 'user2@example.com', password: 'Password123!' };
  const t1 = await login(u1.email, u1.password);
  const t2 = await login(u2.email, u2.password);

  const ws1 = new WebSocket('ws://localhost:8000/ws/chat/', { headers: { Authorization: `Bearer ${t1}` } });
  const ws2 = new WebSocket('ws://localhost:8000/ws/chat/', { headers: { Authorization: `Bearer ${t2}` } });

  let gotSignal = false;
  ws2.on('message', m => {
    const msg = JSON.parse(m.toString());
    if (msg.type === 'call_initiate' && msg.channel_name) {
      gotSignal = true;
      console.log('recipient got call_initiate on channel:', msg.channel_name);
      ws1.close(); ws2.close();
    }
  });

  await new Promise(resolve => ws1.on('open', resolve));
  await new Promise(resolve => ws2.on('open', resolve));

  const me = await req('/api/auth/me/', null, 'GET', { Authorization: `Bearer ${t2}` });
  const recipientId = JSON.parse(me.body).id;
  ws1.send(JSON.stringify({ type: 'call_initiate', recipient_id: recipientId, channel_name: 'room-xyz' }));

  setTimeout(() => { if (!gotSignal) { console.error('no signal received'); process.exit(1); } }, 3000);
}

run().catch(e => { console.error(e); process.exit(1); });
