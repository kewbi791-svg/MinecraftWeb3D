import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { Physics } from './physics.js';
import { BLOCKS, BLOCK_NAMES } from './blocks.js';

export class Player {
  constructor(camera, scene, world, canvas) {
    this.camera = camera;
    this.world = world;
    this.physics = new Physics(world);

    this.controls = new PointerLockControls(camera, canvas);
    scene.add(this.controls.getObject());

    this.position = new THREE.Vector3(0, 40, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.onGround = false;

    this.speed = 8;
    this.jumpForce = 9;
    this.selectedBlock = BLOCKS.GRASS;

    this.keys = {};
    this.setupInput();
  }

  setupInput() {
    document.addEventListener('keydown', e => {
      this.keys[e.code] = true;

      // números para selecionar bloco
      if (e.code >= 'Digit1' && e.code <= 'Digit9') {
        const list = [BLOCKS.GRASS, BLOCKS.DIRT, BLOCKS.STONE, BLOCKS.WOOD, BLOCKS.LEAVES, BLOCKS.SAND, BLOCKS.SCREEN];
        const idx = parseInt(e.code.replace('Digit', '')) - 1;
        if (list[idx]) {
          this.selectedBlock = list[idx];
          document.getElementById('block-info').textContent = 'Bloco: ' + BLOCK_NAMES[this.selectedBlock];
        }
      }
    });

    document.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });

    document.addEventListener('mousedown', e => {
      if (!this.controls.isLocked) return;
      if (e.button === 0) this.breakBlock();
      if (e.button === 2) this.placeBlock();
    });

    document.addEventListener('contextmenu', e => e.preventDefault());
  }

  update(dt) {
    if (!this.controls.isLocked) return;

    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    let moveX = 0, moveZ = 0;
    if (this.keys['KeyW']) { moveX += forward.x; moveZ += forward.z; }
    if (this.keys['KeyS']) { moveX -= forward.x; moveZ -= forward.z; }
    if (this.keys['KeyA']) { moveX -= right.x; moveZ -= right.z; }
    if (this.keys['KeyD']) { moveX += right.x; moveZ += right.z; }

    const len = Math.hypot(moveX, moveZ);
    if (len > 0) {
      moveX = (moveX / len) * this.speed;
      moveZ = (moveZ / len) * this.speed;
    }

    this.velocity.x = moveX;
    this.velocity.z = moveZ;

    if (this.keys['Space'] && this.onGround) {
      this.velocity.y = this.jumpForce;
      this.onGround = false;
    }

    // modo voo com Shift + Space (criativo)
    if (this.keys['ShiftLeft'] && this.keys['Space']) {
      this.velocity.y = 8;
    } else if (this.keys['ShiftLeft'] && !this.onGround) {
      this.velocity.y = -8;
    }

    const result = this.physics.collide(this.position, this.velocity, dt);
    this.position.set(result.position.x, result.position.y, result.position.z);
    this.velocity.set(result.velocity.x, result.velocity.y, result.velocity.z);
    this.onGround = result.onGround;

    this.controls.getObject().position.copy(this.position);
    this.controls.getObject().position.y += 1.6; // altura dos olhos

    // atualiza HUD
    document.getElementById('coords').textContent =
      `X: ${this.position.x.toFixed(1)} Y: ${this.position.y.toFixed(1)} Z: ${this.position.z.toFixed(1)}`;
  }

  getLookRay() {
    const origin = this.camera.getWorldPosition(new THREE.Vector3());
    const dir = this.camera.getWorldDirection(new THREE.Vector3());
    return { origin, dir };
  }

  // raycast simples voxel
  raycast(maxDist = 6) {
    const { origin, dir } = this.getLookRay();
    let x = origin.x, y = origin.y, z = origin.z;
    const step = 0.05;

    let lastAir = null;

    for (let i = 0; i < maxDist / step; i++) {
      x += dir.x * step;
      y += dir.y * step;
      z += dir.z * step;

      const bx = Math.floor(x);
      const by = Math.floor(y);
      const bz = Math.floor(z);

      const id = this.world.getBlock(bx, by, bz);
      if (id !== BLOCKS.AIR && id !== BLOCKS.WATER) {
        return { hit: { x: bx, y: by, z: bz }, prev: lastAir };
      }
      lastAir = { x: bx, y: by, z: bz };
    }
    return null;
  }

  breakBlock() {
    const result = this.raycast();
    if (result && result.hit) {
      const { x, y, z } = result.hit;
      if (this.world.getBlock(x, y, z) !== BLOCKS.BEDROCK) {
        this.world.setBlock(x, y, z, BLOCKS.AIR);
      }
    }
  }

  placeBlock() {
    const result = this.raycast();
    if (result && result.prev) {
      const { x, y, z } = result.prev;
      // não coloca dentro do player
      const px = Math.floor(this.position.x);
      const py = Math.floor(this.position.y);
      const pz = Math.floor(this.position.z);
      if (x === px && (y === py || y === py + 1) && z === pz) return;

      this.world.setBlock(x, y, z, this.selectedBlock);
    }
  }

  lock() {
    this.controls.lock();
  }
}
