// Sistema do Telão (Shift + B)

export class ScreenSystem {
  constructor() {
    this.panel = document.getElementById('screen-panel');
    this.currentUrl = '';
    this.stream = null;
    this.setupUI();
  }

  setupUI() {
    // tabs
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
      });
    });

    document.getElementById('close-screen').addEventListener('click', () => this.hide());

    document.getElementById('apply-url').addEventListener('click', () => {
      const url = document.getElementById('screen-url').value.trim();
      if (url) {
        this.currentUrl = url;
        this.applyToNearestScreen(url);
        alert('URL aplicada ao telão mais próximo (se existir).');
      }
    });

    // captura de tela
    document.getElementById('start-capture').addEventListener('click', async () => {
      try {
        this.stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false
        });
        const video = document.getElementById('capture-preview');
        video.srcObject = this.stream;
        document.getElementById('stop-capture').disabled = false;
        document.getElementById('start-capture').disabled = true;

        this.stream.getVideoTracks()[0].onended = () => this.stopCapture();
      } catch (err) {
        console.warn('Captura cancelada ou não permitida:', err);
        alert('Não foi possível capturar a tela/janela. O navegador exige permissão do usuário.');
      }
    });

    document.getElementById('stop-capture').addEventListener('click', () => this.stopCapture());

    // mini navegador
    document.getElementById('browser-go').addEventListener('click', () => {
      let url = document.getElementById('browser-url').value.trim();
      if (!url.startsWith('http')) url = 'https://' + url;
      document.getElementById('mini-browser').src = url;
    });
  }

  stopCapture() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    document.getElementById('capture-preview').srcObject = null;
    document.getElementById('stop-capture').disabled = true;
    document.getElementById('start-capture').disabled = false;
  }

  show() {
    this.panel.classList.remove('hidden');
    document.exitPointerLock();
  }

  hide() {
    this.panel.classList.add('hidden');
  }

  toggle() {
    if (this.panel.classList.contains('hidden')) this.show();
    else this.hide();
  }

  // placeholder: em uma versão mais avançada, isso atualizaria uma textura 3D no bloco SCREEN
  applyToNearestScreen(url) {
    console.log('[Telão] Aplicando URL:', url);
    // Aqui você pode criar um plane com VideoTexture ou iframe overlay
    // Por enquanto só guarda a URL
    this.currentUrl = url;
  }
}
