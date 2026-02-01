export function hash2d(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export function rand(seed) {
  return (Math.sin(seed) * 10000) % 1;
}
