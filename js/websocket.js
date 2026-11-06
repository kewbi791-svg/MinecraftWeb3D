export class Multiplayer {
  constructor() {
    this.ws = null;
    this.statusEl = document.getElementById('ws-status');
  }

  connect(url) {
    if (this.ws) this.ws.close();

    this.statusEl.textContent = 'Conectando...';
    this.statusEl.className = 'status';

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.statusEl.textContent = 'Conectado';
        this.statusEl.className = 'status connected';
        this.send({ type: 'join', name: 'Player' + Math.floor(Math.random() * 1000) });
      };

      this.ws.onclose = () => {
        this.statusEl.textContent = 'Desconectado';
        this.statusEl.className = 'status';
      };

      this.ws.onerror = () => {
        this.statusEl.textContent = 'Erro de conexão';
        this.statusEl.className = 'status error';
      };

      this.ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          this.handleMessage(msg);
        } catch {}
      };
    } catch (err) {
      this.statusEl.textContent = 'URL inválida';
      this.statusEl.className = 'status error';
    }
  }

  send(obj) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
    }
  }

  handleMessage(msg) {
    console.log('[WS]', msg);
    // Aqui você processaria posições de outros players, blocos alterados etc.
  }

  sendPosition(pos) {
    this.send({ type: 'pos', x: pos.x, y: pos.y, z: pos.z });
  }
}
