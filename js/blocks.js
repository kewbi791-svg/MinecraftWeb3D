// Tipos de blocos
export const BLOCKS = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  WOOD: 4,
  LEAVES: 5,
  SAND: 6,
  WATER: 7,
  SCREEN: 8, // Bloco especial de telão
  BEDROCK: 9
};

export const BLOCK_NAMES = {
  [BLOCKS.AIR]: 'Ar',
  [BLOCKS.GRASS]: 'Grama',
  [BLOCKS.DIRT]: 'Terra',
  [BLOCKS.STONE]: 'Pedra',
  [BLOCKS.WOOD]: 'Madeira',
  [BLOCKS.LEAVES]: 'Folhas',
  [BLOCKS.SAND]: 'Areia',
  [BLOCKS.WATER]: 'Água',
  [BLOCKS.SCREEN]: 'Telão',
  [BLOCKS.BEDROCK]: 'Bedrock'
};

export const BLOCK_COLORS = {
  [BLOCKS.GRASS]: 0x5d9c3d,
  [BLOCKS.DIRT]: 0x8b5a2b,
  [BLOCKS.STONE]: 0x888888,
  [BLOCKS.WOOD]: 0x6b4423,
  [BLOCKS.LEAVES]: 0x3a7d34,
  [BLOCKS.SAND]: 0xe0c98f,
  [BLOCKS.WATER]: 0x3a7ca5,
  [BLOCKS.SCREEN]: 0x222233,
  [BLOCKS.BEDROCK]: 0x333333
};

export function isSolid(id) {
  return id !== BLOCKS.AIR && id !== BLOCKS.WATER;
}
