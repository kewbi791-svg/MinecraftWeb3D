import { isSolid } from './blocks.js';

export class Physics {
  constructor(world) {
    this.world = world;
    this.gravity = -22;
    this.terminalVelocity = -40;
  }

  // AABB simples do player (largura 0.6, altura 1.8)
  collide(pos, vel, dt) {
    const w = 0.3; // half-width
    const h = 1.8;

    let x = pos.x;
    let y = pos.y;
    let z = pos.z;

    let vx = vel.x;
    let vy = vel.y;
    let vz = vel.z;

    // aplica gravidade
    vy += this.gravity * dt;
    if (vy < this.terminalVelocity) vy = this.terminalVelocity;

    // movimento em X
    x += vx * dt;
    if (this.checkCollision(x, y, z, w, h)) {
      x -= vx * dt;
      vx = 0;
    }

    // movimento em Z
    z += vz * dt;
    if (this.checkCollision(x, y, z, w, h)) {
      z -= vz * dt;
      vz = 0;
    }

    // movimento em Y
    y += vy * dt;
    let onGround = false;
    if (this.checkCollision(x, y, z, w, h)) {
      y -= vy * dt;
      if (vy < 0) onGround = true;
      vy = 0;
    }

    return {
      position: { x, y, z },
      velocity: { x: vx, y: vy, z: vz },
      onGround
    };
  }

  checkCollision(x, y, z, w, h) {
    const minX = Math.floor(x - w);
    const maxX = Math.floor(x + w);
    const minY = Math.floor(y);
    const maxY = Math.floor(y + h - 0.01);
    const minZ = Math.floor(z - w);
    const maxZ = Math.floor(z + w);

    for (let bx = minX; bx <= maxX; bx++) {
      for (let by = minY; by <= maxY; by++) {
        for (let bz = minZ; bz <= maxZ; bz++) {
          if (isSolid(this.world.getBlock(bx, by, bz))) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
