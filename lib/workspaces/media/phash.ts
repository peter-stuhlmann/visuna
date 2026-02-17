import sharp from 'sharp';

/**
 * Compute a perceptual hash (pHash) for an image buffer.
 *
 * Algorithm:
 * 1. Resize to 32×32 grayscale
 * 2. Compute mean pixel value
 * 3. Build 64-bit hash: for each of the top-left 8×8 pixels,
 *    set bit to 1 if pixel > mean, else 0
 * 4. Return as 16-char hex string
 *
 * This simplified "average hash" variant is fast and good enough
 * for detecting exact duplicates and near-duplicates
 * (resized, recompressed, minor crops).
 */
export async function computePhash(buffer: Buffer): Promise<string> {
  // Resize to 32x32 grayscale
  const { data } = await sharp(buffer)
    .resize(32, 32, { fit: 'fill' })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Compute mean of all pixels
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
  }
  const mean = sum / data.length;

  // Build 64-bit hash from top-left 8×8 block
  // (using 32×32 gives us more accuracy in the mean, but we hash only 8×8)
  const bits: number[] = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const idx = y * 32 + x;
      bits.push(data[idx] >= mean ? 1 : 0);
    }
  }

  // Convert 64 bits to hex string
  let hex = '';
  for (let i = 0; i < 64; i += 4) {
    const nibble =
      (bits[i] << 3) | (bits[i + 1] << 2) | (bits[i + 2] << 1) | bits[i + 3];
    hex += nibble.toString(16);
  }

  return hex;
}

/**
 * Compute the Hamming distance between two hex hash strings.
 * Returns the number of differing bits.
 */
export function hammingDistance(hashA: string, hashB: string): number {
  if (hashA.length !== hashB.length) {
    return Infinity;
  }

  let distance = 0;
  for (let i = 0; i < hashA.length; i++) {
    const a = parseInt(hashA[i], 16);
    const b = parseInt(hashB[i], 16);
    // XOR gives bits that differ, popcount gives the count
    let xor = a ^ b;
    while (xor) {
      distance += xor & 1;
      xor >>= 1;
    }
  }

  return distance;
}
