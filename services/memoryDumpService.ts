/**
 * Parses a string of hex characters into a Uint8Array.
 * Handles spaces, newlines, and potential '0x' prefixes.
 */
export const parseHexStream = (input: string): Uint8Array => {
  if (!input.trim()) return new Uint8Array(0);

  // Remove 0x, spaces, newlines, commas
  const clean = input.replace(/0x/gi, '').replace(/[^0-9A-Fa-f]/g, '');
  
  // If odd length, pad with 0 at the end (or treat as partial byte? usually nibble)
  // For safety in dump viewers, usually imply byte alignment. 
  // If "A", treat as "0A"? Or if "ABC", "AB C0"? 
  // Let's assume standard byte stream parsing: pairs of chars.
  
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    const byteStr = clean.substring(i, i + 2);
    // If we have a trailing single char 'A', parse it as '0A' or ignore? 
    // Standard approach: parse what we have.
    const b = parseInt(byteStr, 16);
    if (!isNaN(b)) {
      bytes.push(b);
    }
  }

  return new Uint8Array(bytes);
};

/**
 * Converts a Uint8Array into an array of 32-bit integers (Little Endian).
 * Input: [0xA3, 0x4F, 0x12, 0xD9] -> Output: 0xD9124FA3
 */
export const bytesToLEWords = (bytes: Uint8Array): number[] => {
  const words: number[] = [];
  // Process 4 bytes at a time
  for (let i = 0; i < bytes.length; i += 4) {
    const b0 = bytes[i] || 0;
    const b1 = bytes[i+1] || 0;
    const b2 = bytes[i+2] || 0;
    const b3 = bytes[i+3] || 0;

    // Construct 32-bit unsigned integer
    // b3 is MSB, b0 is LSB
    const val = ((b3 << 24) | (b2 << 16) | (b1 << 8) | b0) >>> 0;
    words.push(val);
  }
  return words;
};

/**
 * Reads a File object as an ArrayBuffer and returns Uint8Array
 */
export const readFileAsBytes = (file: File): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(e.target.result));
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsArrayBuffer(file);
  });
};

export const formatAddress = (startAddrStr: string, offset: number): string => {
  const cleanStart = startAddrStr.trim().replace(/^0x/i, '');
  
  if (!cleanStart) {
    // Case 1: No start address -> Show Offset
    return '0x' + offset.toString(16).toUpperCase();
  }

  // Case 2: Start address provided -> Show Base + Offset
  const base = parseInt(cleanStart, 16);
  if (isNaN(base)) {
    return '0x' + offset.toString(16).toUpperCase();
  }

  // Calculate unsigned 32-bit address
  const addr = (base + offset) >>> 0;
  return '0x' + addr.toString(16).toUpperCase();
};
