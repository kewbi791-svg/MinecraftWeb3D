// Placeholder para TikTok Live
// Para funcionar de verdade use o bridge em server/tiktok_bridge.py

export class TikTokIntegration {
  constructor() {
    this.statusEl = document.getElementById('tiktok-status');
    this.ws = null;
    this.username = '';

    document.getElementById('connect-tiktok').addEventListener('click', () => {
      this.username = document.getElementById('tiktok-username').value.trim().replace('@', '');
      if (!this.username) {
        alert('Digite o username da live');
        return;
      }
      this.connect();
    });
  }

  connect() {
    // Em produção isso se conecta no seu backend que usa TikTokLive
    // Exemplo: ws://localhost:3002
    const bridgeUrl = 'ws://localhost:3002';

    this.statusEl.textContent = `Conectando em @${this.username}...`;
    this.statusEl.className = 'status';

    try {
      this.ws = new WebSocket(bridgeUrl);

      this.ws.onopen = () => {
        this.ws.send(JSON.stringify({ type: 'subscribe', username: this.username }));
        this.statusEl.textContent = `Conectado à live de @${this.username}`;
        this.statusEl.className = 'status connected';
      };

      this.ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          this.handleEvent(data);
        } catch {}
      };

      this.ws.onclose = () => {
        this.statusEl.textContent = 'Desconectado (bridge offline?)';
        this.statusEl.className = 'status error';
      };

      this.ws.onerror = () => {
        this.statusEl.textContent = 'Bridge não encontrado. Veja server/tiktok_bridge.py';
        this.statusEl.className = 'status error';
      };
    } catch (err) {
      this.statusEl.textContent = 'Erro ao conectar';
      this.statusEl.className = 'status error';
    }
  }

  handleEvent(data) {
    // data.type = 'follow' | 'gift' | 'share' | 'chat' etc.
    const notif = document.createElement('div');
    notif.className = 'notification ' + (data.type || '');

    if (data.type === 'follow') {
      notif.innerHTML = `<strong>${data.nickname || data.uniqueId}</strong> seguiu a live!`;
    } else if (data.type === 'gift') {
      notif.innerHTML = `<strong>${data.nickname || data.uniqueId}</strong> enviou <strong>${data.giftName || 'presente'}</strong> (x${data.repeatCount || 1})`;
    } else if (data.type === 'share') {
      notif.innerHTML = `<strong>${data.nickname || data.uniqueId}</strong> compartilhou a live!`;
    } else if (data.type === 'like') {
      notif.innerHTML = `<strong>${data.nickname || data.uniqueId}</strong> deu likes`;
    } else {
      notif.innerHTML = JSON.stringify(data);
    }

    const container = document.getElementById('notifications');
    container.prepend(notif);

    // remove depois de 6s
    setTimeout(() => notif.remove(), 6000);
  }

  // método de teste (simula eventos)
  simulate() {
    this.handleEvent({ type: 'follow', nickname: 'TestUser', uniqueId: 'testuser' });
    setTimeout(() => {
      this.handleEvent({ type: 'gift', nickname: 'FãTop', giftName: 'Rosa', repeatCount: 5 });
    }, 1500);
  }
}
