import * as THREE from 'three';
import { BLOCKS, BLOCK_COLORS, isSolid } from './blocks.js';

const CHUNK_SIZE = 16;
const WORLD_HEIGHT = 64;

export class World {
  constructor(scene) {
    this.scene = scene;
    this.chunks = new Map();
    this.meshes = new Map();
    this.screenBlocks = []; // posições de telões
  }

  key(cx, cz) {
    return `${cx},${cz}`;
  }

  getChunk(cx, cz) {
    const k = this.key(cx, cz);
    if (!this.chunks.has(k)) {
      this.chunks.set(k, this.generateChunk(cx, cz));
      this.rebuildMesh(cx, cz);
    }
    return this.chunks.get(k);
  }

  generateChunk(cx, cz) {
    const data = new Uint8Array(CHUNK_SIZE * WORLD_HEIGHT * CHUNK_SIZE);

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        const wx = cx * CHUNK_SIZE + x;
        const wz = cz * CHUNK_SIZE + z;

        // altura simples com noise fake
        const height = 28 + Math.floor(
          Math.sin(wx * 0.07) * 4 +
          Math.cos(wz * 0.09) * 3 +
          Math.sin((wx + wz) * 0.03) * 5
        );

        for (let y = 0; y < WORLD_HEIGHT; y++) {
          let id = BLOCKS.AIR;
          if (y === 0) id = BLOCKS.BEDROCK;
          else if (y < height - 3) id = BLOCKS.STONE;
          else if (y < height) id = BLOCKS.DIRT;
          else if (y === height) id = BLOCKS.GRASS;

          // água baixa
          if (y <= 22 && id === BLOCKS.AIR) id = BLOCKS.WATER;

          data[this.index(x, y, z)] = id;
        }

        // árvores simples
        if (Math.random() < 0.015 && height > 24) {
          this.placeTree(data, x, height + 1, z);
        }
      }
    }
    return data;
  }

  placeTree(data, x, y, z) {
    const trunkH = 4 + Math.floor(Math.random() * 2);
    for (let i = 0; i < trunkH; i++) {
      if (y + i < WORLD_HEIGHT) data[this.index(x, y + i, z)] = BLOCKS.WOOD;
    }
    // folhas
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        for (let dy = 0; dy < 3; dy++) {
          const lx = x + dx, ly = y + trunkH - 1 + dy, lz = z + dz;
          if (lx >= 0 && lx < CHUNK_SIZE && lz >= 0 && lz < CHUNK_SIZE && ly < WORLD_HEIGHT) {
            if (Math.abs(dx) + Math.abs(dz) < 3 || Math.random() > 0.3) {
              if (data[this.index(lx, ly, lz)] === BLOCKS.AIR) {
                data[this.index(lx, ly, lz)] = BLOCKS.LEAVES;
              }
            }
          }
        }
      }
    }
  }

  index(x, y, z) {
    return x + y * CHUNK_SIZE + z * CHUNK_SIZE * WORLD_HEIGHT;
  }

  getBlock(wx, wy, wz) {
    if (wy < 0 || wy >= WORLD_HEIGHT) return BLOCKS.AIR;
    const cx = Math.floor(wx / CHUNK_SIZE);
    const cz = Math.floor(wz / CHUNK_SIZE);
    const chunk = this.getChunk(cx, cz);
    const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    return chunk[this.index(lx, wy, lz)];
  }

  setBlock(wx, wy, wz, id) {
    if (wy < 0 || wy >= WORLD_HEIGHT) return;
    const cx = Math.floor(wx / CHUNK_SIZE);
    const cz = Math.floor(wz / CHUNK_SIZE);
    const chunk = this.getChunk(cx, cz);
    const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    chunk[this.index(lx, wy, lz)] = id;

    if (id === BLOCKS.SCREEN) {
      this.screenBlocks.push({ x: wx, y: wy, z: wz });
    }

    this.rebuildMesh(cx, cz);
    // rebuild vizinhos se necessário
    if (lx === 0) this.rebuildMesh(cx - 1, cz);
    if (lx === CHUNK_SIZE - 1) this.rebuildMesh(cx + 1, cz);
    if (lz === 0) this.rebuildMesh(cx, cz - 1);
    if (lz === CHUNK_SIZE - 1) this.rebuildMesh(cx, cz + 1);
  }

  rebuildMesh(cx, cz) {
    const k = this.key(cx, cz);
    const old = this.meshes.get(k);
    if (old) {
      this.scene.remove(old);
      old.geometry.dispose();
      old.material.dispose();
    }

    const chunk = this.chunks.get(k);
    if (!chunk) return;

    const positions = [];
    const colors = [];
    const indices = [];
    let vertexCount = 0;

    const dirs = [
      [1, 0, 0], [-1, 0, 0],
      [0, 1, 0], [0, -1, 0],
      [0, 0, 1], [0, 0, -1]
    ];

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
          const id = chunk[this.index(x, y, z)];
          if (id === BLOCKS.AIR) continue;

          const color = new THREE.Color(BLOCK_COLORS[id] || 0xffffff);

          for (const [dx, dy, dz] of dirs) {
            const nx = x + dx, ny = y + dy, nz = z + dz;
            let neighbor = BLOCKS.AIR;

            if (ny < 0 || ny >= WORLD_HEIGHT) neighbor = BLOCKS.AIR;
            else if (nx < 0 || nx >= CHUNK_SIZE || nz < 0 || nz >= CHUNK_SIZE) {
              // checa chunk vizinho
              const wx = cx * CHUNK_SIZE + nx;
              const wz = cz * CHUNK_SIZE + nz;
              neighbor = this.getBlock(wx, ny, wz);
            } else {
              neighbor = chunk[this.index(nx, ny, nz)];
            }

            if (!isSolid(neighbor) || (id === BLOCKS.WATER && neighbor !== BLOCKS.WATER)) {
              // face
              this.addFace(positions, colors, indices, x + cx * CHUNK_SIZE, y, z + cz * CHUNK_SIZE, dx, dy, dz, color, vertexCount);
              vertexCount += 4;
            }
          }
        }
      }
    }

    if (positions.length === 0) return;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const mat = new THREE.MeshLambertMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.95
    });

    const mesh = new THREE.Mesh(geo, mat);
    this.scene.add(mesh);
    this.meshes.set(k, mesh);
  }

  addFace(pos, cols, idx, x, y, z, dx, dy, dz, color, base) {
    // gera os 4 vértices da face
    const verts = [];
    if (dx === 1) { // +X
      verts.push([x+1,y,z], [x+1,y+1,z], [x+1,y+1,z+1], [x+1,y,z+1]);
    } else if (dx === -1) {
      verts.push([x,y,z+1], [x,y+1,z+1], [x,y+1,z], [x,y,z]);
    } else if (dy === 1) {
      verts.push([x,y+1,z], [x,y+1,z+1], [x+1,y+1,z+1], [x+1,y+1,z]);
    } else if (dy === -1) {
      verts.push([x,y,z+1], [x,y,z], [x+1,y,z], [x+1,y,z+1]);
    } else if (dz === 1) {
      verts.push([x+1,y,z+1], [x+1,y+1,z+1], [x,y+1,z+1], [x,y,z+1]);
    } else {
      verts.push([x,y,z], [x,y+1,z], [x+1,y+1,z], [x+1,y,z]);
    }

    for (const v of verts) {
      pos.push(v[0], v[1], v[2]);
      cols.push(color.r, color.g, color.b);
    }
    idx.push(base, base+1, base+2, base, base+2, base+3);
  }

  // carrega chunks ao redor do player
  updateAround(px, pz, radius = 3) {
    const cx = Math.floor(px / CHUNK_SIZE);
    const cz = Math.floor(pz / CHUNK_SIZE);
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        this.getChunk(cx + dx, cz + dz);
      }
    }
  }
}
