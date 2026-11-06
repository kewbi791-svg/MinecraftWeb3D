import * as THREE from 'three';
import { World } from './world.js';
import { Player } from './player.js';
import { ScreenSystem } from './screen.js';
import { SearchSystem } from './search.js';
import { Multiplayer } from './websocket.js';
import { TikTokIntegration } from './tiktok.js';

let scene, camera, renderer, world, player;
let screenSystem, searchSystem, multiplayer, tiktok;
let lastTime = performance.now();
let frames = 0;
let fpsTime = 0;

function init() {
  const canvas = document.getElementById('game-canvas');

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 40, 120);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // luzes
  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffffff, 0.75);
  sun.position.set(50, 100, 30);
  scene.add(sun);

  world = new World(scene);
  player = new Player(camera, scene, world, canvas);

  // carrega chunks iniciais
  world.updateAround(0, 0, 4);

  // sistemas extras
  screenSystem = new ScreenSystem();
  searchSystem = new SearchSystem();
  multiplayer = new Multiplayer();
  tiktok = new TikTokIntegration();

  // UI
  setupUI();

  window.addEventListener('resize', onResize);

  // start screen
  document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-screen').style.display = 'none';
    player.lock();
  });

  animate();
}

function setupUI() {
  // Shift + B = telão
  document.addEventListener('keydown', e => {
    if (e.code === 'KeyB' && e.shiftKey) {
      e.preventDefault();
      screenSystem.toggle();
    }
    if (e.code === 'KeyE') {
      const panel = document.getElementById('settings-panel');
      panel.classList.toggle('hidden');
      if (!panel.classList.contains('hidden')) {
        document.exitPointerLock();
      }
    }
  });

  document.getElementById('close-settings').addEventListener('click', () => {
    document.getElementById('settings-panel').classList.add('hidden');
  });

  document.getElementById('connect-ws').addEventListener('click', () => {
    const url = document.getElementById('ws-url').value.trim();
    multiplayer.connect(url);
  });
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  player.update(dt);
  world.updateAround(player.position.x, player.position.z, 3);

  // FPS
  frames++;
  if (now - fpsTime > 1000) {
    document.getElementById('fps').textContent = `FPS: ${frames}`;
    frames = 0;
    fpsTime = now;
  }

  renderer.render(scene, camera);
}

init();
