/**
 * Get an array of cubic coordinates corresponding to the equivalent of a token
 * of size
 * @param size {number}
 */
function cubesBySize(size) {
  if (size % 2 === 1) {
    const l = Math.floor(size / 2);
    /** @type{HexCubeCoordinate[]} */
    const res = [];
    for (let q = -l; q <= l; ++q) {
      for (let r = Math.max(-l, -q - l); r <= Math.min(l, -q + l); ++r) {
        res.push({ q, r, s: -q - r });
      }
    }
    return res;
  } else {
    /** @type {HexCubeCoordinate[]} */
    let res = cubesBySize(size + 1);
    return res.filter(
      c => !(c.r >= 0 && Math.abs(c.q) + Math.abs(c.r) + Math.abs(c.s) === size)
    );
  }
}

/**
 * @param token_size {number}
 * @param range {number}
 */
export function buildHexBurstRange(token_size, range, alt = token_size === 2) {
  return cubesBySize(Math.floor(token_size + range * 2)).map(c => {
    if (alt) return { q: -c.q, r: -c.r, s: -c.s };
    return c;
  });
}
