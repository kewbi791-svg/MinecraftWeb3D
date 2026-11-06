# MinecraftWeb3D

Réplica 3D estilo Minecraft feita em **HTML + CSS + JavaScript + Three.js**, com física básica, sistema de **telão interativo**, multiplayer via **WebSocket**, painel de busca (Wikipedia, TheSportsDB, TVMaze, DuckDuckGo etc.) e placeholder para **TikTok Live**.

> **Repositório:** https://github.com/kewbi791-svg/MinecraftWeb3D

---

## Como rodar

### Opção rápida (só o jogo)
1. Clone o repositório
2. Abra o arquivo `index.html` no Chrome/Edge/Firefox (ou use um servidor local)

```bash
# Recomendado: servidor local
npx serve .
# ou
python -m http.server 8080
```

### Com multiplayer (WebSocket)
```bash
cd server
npm install
node server.js
```
Depois abra o jogo e ele tentará conectar em `ws://localhost:3001`.

---

## Controles

| Tecla | Ação |
|-------|------|
| WASD | Andar |
| Espaço | Pular / Voar (modo criativo) |
| Shift | Agachar / descer |
| Mouse | Olhar |
| Clique esquerdo | Quebrar bloco |
| Clique direito | Colocar bloco |
| **Shift + B** | Abrir painel do **Telão** |
| E | Inventário / Configurações |
| Esc | Liberar mouse |

---

## Funcionalidades implementadas

- Mundo voxel 3D com geração procedural simples
- Física básica (gravidade, colisão AABB, pulo)
- Quebrar e colocar blocos
- Sistema de **Telão** (bloco especial + UI com Shift+B)
  - Colocar URL / link
  - Mini-navegador embutido
  - Painel de busca integrado
  - Tentativa de captura de tela/janela via `getDisplayMedia` (limitado pelo navegador)
- Cliente WebSocket para multiplayer básico
- Painel de configurações com campo de username do TikTok Live
- Integração de busca com:
  - Wikipedia
  - Wikidata (via Wikipedia)
  - TheSportsDB
  - TVMaze
  - DuckDuckGo Instant Answer
  - Placeholder para OneFootball

---

## Limitações importantes (leia com atenção)

### 1. Captura de janela do computador
Navegadores **não permitem** listar e capturar qualquer janela aberta sem permissão explícita do usuário a cada vez.  
O máximo que é possível é usar a API `getDisplayMedia` (compartilhar tela ou uma janela específica). Isso é implementado no telão, mas o usuário precisa autorizar manualmente.

### 2. TikTok Live
Não existe API oficial pública do TikTok para eventos de live (presentes, follows, shares).  
Existem soluções não-oficiais (TikTokLive em Python, EulerStream, etc.).  
No jogo existe o campo de username. Para funcionar de verdade você precisa:
1. Rodar um servidor backend (Python recomendado com a lib TikTokLive)
2. Esse servidor se conecta na live e retransmite os eventos via WebSocket para o jogo
3. O jogo mostra notificações quando chega follow / gift / share

Um exemplo de servidor Python está na pasta `server/tiktok_bridge.py` (requer `pip install TikTokLive`).

### 3. Réplica completa do Minecraft
Este é um **protótipo jogável e extensível**, não uma cópia 1:1.  
Faltam: crafting completo, inventário avançado, mobs, redstone, biomas complexos, multiplayer completo, etc.  
A arquitetura está preparada para você continuar desenvolvendo.

---

## Estrutura do projeto

```
MinecraftWeb3D/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── world.js
│   ├── player.js
│   ├── physics.js
│   ├── blocks.js
│   ├── screen.js          # Sistema do telão
│   ├── websocket.js
│   ├── tiktok.js           # Placeholder + notificações
│   ├── search.js           # APIs de busca
│   └── ui.js
├── server/
│   ├── package.json
│   ├── server.js           # WebSocket multiplayer simples
│   └── tiktok_bridge.py    # Exemplo de bridge TikTok
├── data/
│   └── blocks.json
└── README.md
```

---

## Próximos passos sugeridos

1. Melhorar geração de terreno (Perlin/Simplex noise + biomas)
2. Inventário e crafting
3. Backend TikTok real (Python + TikTokLive)
4. Multiplayer completo (sincronização de blocos e players)
5. Sistema de salvamento de mundo
6. Mais tipos de blocos e texturas

---

## Licença

Este é um projeto educacional / fan-made.  
Não afiliado à Mojang / Microsoft.  
Use por conta e risco.

Feito com ❤️ para a comunidade.
