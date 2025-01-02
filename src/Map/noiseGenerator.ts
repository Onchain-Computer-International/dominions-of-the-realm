let seedValue = Date.now();

// Enhanced Perlin noise implementation
export function noise2d(x: number, y: number, seed: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  
  x -= Math.floor(x);
  y -= Math.floor(y);
  
  const u = fade(x);
  const v = fade(y);
  
  const A = p[X] + Y;
  const B = p[X + 1] + Y;
  
  return lerp(
    v,
    lerp(u, grad(p[A], x, y), grad(p[B], x - 1, y)),
    lerp(u, grad(p[A + 1], x, y - 1), grad(p[B + 1], x - 1, y - 1))
  ) * 0.5 + 0.5; // Normalize to 0-1
}

export function noise3d(x: number, y: number, z: number, seed: number): number {
  // Implementation of 3D noise for more complex terrain features
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;
  
  x -= Math.floor(x);
  y -= Math.floor(y);
  z -= Math.floor(z);
  
  const u = fade(x);
  const v = fade(y);
  const w = fade(z);
  
  const A = p[X] + Y;
  const AA = p[A] + Z;
  const AB = p[A + 1] + Z;
  const B = p[X + 1] + Y;
  const BA = p[B] + Z;
  const BB = p[B + 1] + Z;
  
  return lerp(
    w,
    lerp(
      v,
      lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
      lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))
    ),
    lerp(
      v,
      lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)),
      lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1))
    )
  ) * 0.5 + 0.5;
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t: number, a: number, b: number): number {
  return a + t * (b - a);
}

function grad(hash: number, x: number, y: number, z?: number): number {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z || 0;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

// Initialize permutation table with improved randomization
const p = new Array(512);
const permutation = new Array(256).fill(0).map((_, i) => i);

function shuffle(array: number[], seed: number) {
  let m = array.length;
  while (m) {
    const i = Math.floor(random(seed) * m--);
    [array[m], array[i]] = [array[i], array[m]];
  }
  return array;
}

function random(seed: number) {
  seedValue = (seedValue * 16807 + seed) % 2147483647;
  return (seedValue & 0xfffffff) / 0x10000000;
}

shuffle(permutation, Date.now());
for (let i = 0; i < 256; i++) {
  p[i] = permutation[i];
  p[256 + i] = p[i];
}