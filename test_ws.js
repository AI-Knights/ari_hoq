const WebSocket = require('ws');
const http = require('http');

const data = JSON.stringify({ email: 'user1@example.com', password: 'Password123!' });

const req = http.request({
    hostname: 'localhost',
    port: 8000,
    path: '/api/auth/jwt/create/',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
}, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        try {
            const token = JSON.parse(body).access;
            if (!token) throw new Error("No token returned: " + body);
            console.log("Got real token, connecting WS...");

            const ws = new WebSocket(`ws://localhost:8000/ws/status/?token=${token}`);
            ws.on('open', () => { console.log('✅ WS Connected successfully!'); ws.close(); });
            ws.on('error', err => console.error('❌ WS Error:', err.message));
            ws.on('close', (code, reason) => console.log(`🔌 WS Closed: ${code} ${reason.toString()}`));
        } catch (e) { console.error("Parse Error:", e); }
    });
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
