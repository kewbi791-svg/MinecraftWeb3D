/**
 * Servidor WebSocket simples para multiplayer básico
 * Rode: npm install && node server.js
 */

const { WebSocketServer } = require('ws');

const PORT = 3001;
const wss = new WebSocketServer({ port: PORT });

const clients = new Map(); // id -> { ws, name, x, y, z }

console.log(`Servidor WebSocket rodando em ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  const id = Math.random().toString(36).slice(2, 9);
  clients.set(id, { ws, name: 'Anônimo', x: 0, y: 40, z: 0 });

  console.log(`Cliente conectado: ${id}`);

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === 'join') {
        clients.get(id).name = msg.name || 'Player';
        broadcast({ type: 'player_join', id, name: clients.get(id).name }, id);
      }

      if (msg.type === 'pos') {
        const c = clients.get(id);
        c.x = msg.x; c.y = msg.y; c.z = msg.z;
        broadcast({ type: 'pos', id, x: msg.x, y: msg.y, z: msg.z }, id);
      }

      if (msg.type === 'block') {
        // sincroniza colocação/quebra de bloco
        broadcast({ type: 'block', x: msg.x, y: msg.y, z: msg.z, id: msg.blockId }, id);
      }
    } catch (e) {
      console.error(e);
    }
  });

  ws.on('close', () => {
    clients.delete(id);
    broadcast({ type: 'player_leave', id });
    console.log(`Cliente saiu: ${id}`);
  });
});

function broadcast(msg, excludeId = null) {
  const data = JSON.stringify(msg);
  for (const [cid, client] of clients) {
    if (cid !== excludeId && client.ws.readyState === 1) {
      client.ws.send(data);
    }
  }
}
