const BinaryReader = require('./binaryReader');

/**
 * Parses LinkMgr.900 to extract voucher references.
 * 
 * LinkMgr.900 contains date + voucher number pairs in Unicode:
 *   28-Aug-17
 *   "BMW/003461/17-18
 *   30-Aug-17
 *   "BMW/003657/17-18
 */
class VoucherParser {
  constructor() {
    // Date pattern: D-Mon-YY or DD-Mon-YY
    this.DATE_REGEX = /^(\d{1,2})-([A-Z][a-z]{2})-(\d{2})$/;
    // Voucher pattern: optional quote + prefix/number/FY
    this.VOUCHER_REGEX = /^"?([A-Z]{2,}\/\d{4,}\/\d{2}-\d{2})$/;

    this.MONTH_MAP = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
  }

  /**
   * Parse LinkMgr.900 and extract voucher references.
   */
  async parse(filePath, onProgress) {
    const reader = new BinaryReader(filePath, { chunkSize: 512 * 1024 });
    const fileSize = await reader.getFileSize();
    const vouchers = [];
    const seenVouchers = new Set();
    let processedBytes = 0;

    let pendingDate = null;

    for await (const chunk of reader.readChunks()) {
      processedBytes += Buffer.byteLength(chunk, 'utf16le');

      const strings = BinaryReader.extractStrings(chunk, 3);

      for (const str of strings) {
        const trimmed = str.trim();

        // Check if it's a date
        const dateMatch = trimmed.match(this.DATE_REGEX);
        if (dateMatch) {
          pendingDate = trimmed;
          continue;
        }

        // Check if it's a voucher number
        const voucherMatch = trimmed.match(this.VOUCHER_REGEX);
        if (voucherMatch) {
          const voucherNumber = voucherMatch[1];

          if (!seenVouchers.has(voucherNumber)) {
            seenVouchers.add(voucherNumber);

            // Extract financial year from voucher number (e.g., 17-18 from BMW/003461/17-18)
            const fyMatch = voucherNumber.match(/(\d{2}-\d{2})$/);
            const financialYear = fyMatch ? `20${fyMatch[1].split('-')[0]}-${fyMatch[1].split('-')[1]}` : null;

            // Parse date to ISO format
            const parsedDate = pendingDate ? this._parseDate(pendingDate) : null;

            vouchers.push({
              date: pendingDate || null,
              voucherNumber,
              financialYear,
              parsedDate
            });
          }

          pendingDate = null;
          continue;
        }
      }

      if (onProgress) {
        const pct = Math.min(100, Math.round((processedBytes / fileSize) * 100));
        onProgress(pct, vouchers.length);
      }
    }

    return vouchers;
  }

  /**
   * Parse Tally date format (D-Mon-YY) to ISO date string (YYYY-MM-DD).
   */
  _parseDate(dateStr) {
    const match = dateStr.match(this.DATE_REGEX);
    if (!match) return null;

    const day = match[1].padStart(2, '0');
    const month = this.MONTH_MAP[match[2]];
    const yearShort = parseInt(match[3]);
    // Assume 2000s for years < 50, 1900s otherwise
    const year = yearShort < 50 ? 2000 + yearShort : 1900 + yearShort;

    if (!month) return null;
    return `${year}-${month}-${day}`;
  }
}

module.exports = VoucherParser;
