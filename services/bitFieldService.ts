
export const parseBitFields = (input: string): number[] => {
  if (!input.trim()) return [];

  // 1. Clean input: remove commas, newlines, normalize spaces
  const cleanInput = input.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  const tokens = cleanInput.split(' ').filter(t => t);

  // 2. Remove '0x' or '0X' prefix from tokens for analysis
  const rawHexTokens = tokens.map(t => t.replace(/^0x/i, ''));

  // 3. Heuristic: Determine if this is a Byte Stream or a Word List.
  // If any token is longer than 2 hex characters (meaning > 255), it's likely a list of 32-bit words.
  // If all tokens are 1 or 2 chars, assume it's a byte stream (like a bin file dump).
  const isWordList = rawHexTokens.some(t => t.length > 2);

  const words: number[] = [];

  if (isWordList) {
    // Scenario 1 & 2: List of 32-bit values
    // e.g., 0xFF000000 0x00FF0000
    for (const hex of rawHexTokens) {
      // Parse, force to unsigned 32-bit
      const val = parseInt(hex, 16) >>> 0;
      if (!isNaN(val)) {
        words.push(val);
      }
    }
  } else {
    // Scenario 3: Byte Stream (Little Endian)
    // e.g., FF AA BB CC -> 0xCCBBAAFF
    // We grab 4 bytes at a time.
    for (let i = 0; i < rawHexTokens.length; i += 4) {
      const b0 = parseInt(rawHexTokens[i] || '0', 16) || 0;     // LSB
      const b1 = parseInt(rawHexTokens[i+1] || '0', 16) || 0;
      const b2 = parseInt(rawHexTokens[i+2] || '0', 16) || 0;
      const b3 = parseInt(rawHexTokens[i+3] || '0', 16) || 0;   // MSB

      // Reconstruct 32-bit integer from LE bytes
      // shift and OR. Use >>> 0 to ensure result is unsigned 32-bit integer
      const val = ((b3 << 24) | (b2 << 16) | (b1 << 8) | b0) >>> 0;
      words.push(val);
    }
  }

  return words;
};

export const toHex32 = (num: number): string => {
  return '0x' + num.toString(16).toUpperCase().padStart(8, '0');
};
