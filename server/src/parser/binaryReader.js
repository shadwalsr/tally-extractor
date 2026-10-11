const fs = require('fs');

/**
 * Low-level streaming binary reader for Tally .900 files.
 * Reads in chunks and extracts UTF-16LE encoded text.
 */
class BinaryReader {
  constructor(filePath, options = {}) {
    this.filePath = filePath;
    this.chunkSize = options.chunkSize || 256 * 1024; // 256KB default chunks
  }

  /**
   * Async generator that yields decoded text chunks from the binary file.
   * Uses streaming to handle files up to 8+ GB without memory issues.
   */
  async *readChunks() {
    const fd = await fs.promises.open(this.filePath, 'r');
    const buffer = Buffer.alloc(this.chunkSize);
    let position = 0;
    let bytesRead;
    let overlap = ''; // Carry over partial strings across chunk boundaries

    try {
      do {
        const result = await fd.read(buffer, 0, this.chunkSize, position);
        bytesRead = result.bytesRead;

        if (bytesRead > 0) {
          // Ensure we read even number of bytes for UTF-16LE
          const alignedBytes = bytesRead - (bytesRead % 2);
          if (alignedBytes > 0) {
            const text = overlap + buffer.slice(0, alignedBytes).toString('utf16le');
            overlap = '';

            yield text;
          }
          position += bytesRead;
        }
      } while (bytesRead > 0);
    } finally {
      await fd.close();
    }
  }

  /**
   * Extract all printable ASCII strings of minimum length from text.
   */
  static extractStrings(text, minLength = 4) {
    const regex = new RegExp(`[\\x20-\\x7E]{${minLength},}`, 'g');
    const matches = [];
    let m;
    while ((m = regex.exec(text)) !== null) {
      matches.push(m[0]);
    }
    return matches;
  }

  /**
   * Read entire file as strings (for smaller files < 100MB).
   */
  async readAllStrings(minLength = 3) {
    const stats = await fs.promises.stat(this.filePath);
    if (stats.size > 200 * 1024 * 1024) {
      throw new Error(`File too large for readAllStrings: ${stats.size} bytes. Use streaming instead.`);
    }

    const buffer = await fs.promises.readFile(this.filePath);
    const text = buffer.toString('utf16le');
    return BinaryReader.extractStrings(text, minLength);
  }

  /**
   * Get file size in bytes.
   */
  async getFileSize() {
    const stats = await fs.promises.stat(this.filePath);
    return stats.size;
  }

  /**
   * Check if file exists and is readable.
   */
  async exists() {
    try {
      await fs.promises.access(this.filePath, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = BinaryReader;
