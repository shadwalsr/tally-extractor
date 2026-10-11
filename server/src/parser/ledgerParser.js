const BinaryReader = require('./binaryReader');

/**
 * Parses Manager.900 to extract ledger/account master records.
 * 
 * Tally stores ledger records in a tilde-delimited format within the binary file:
 *   Name~Group~DisplayName~Address|Line2~City~PIN~Contact~Phone~Phone2~...
 *   PAN~~~~~~~No~~~~~~~~~
 *   UserName  ActionType  Time
 */
class LedgerParser {
  constructor() {
    // Known Tally account groups for matching
    this.KNOWN_GROUPS = [
      'SUNDRY DEBTOR', 'SUNDRY CREDITOR', 'SUNDRY DEBTORS', 'SUNDRY CREDITORS',
      'CURRENT ASSETS', 'CURRENT LIABILITIES', 'FIXED ASSETS',
      'DIRECT EXPENSES', 'INDIRECT EXPENSES', 'DIRECT INCOMES', 'INDIRECT INCOMES',
      'CAPITAL ACCOUNT', 'INVESTMENTS', 'LOANS', 'DEPOSITS',
      'BANK ACCOUNTS', 'BANK OD ACCOUNTS', 'CASH-IN-HAND',
      'DUTIES & TAXES', 'PROVISIONS', 'RESERVES & SURPLUS',
      'PURCHASE ACCOUNTS', 'SALES ACCOUNTS', 'STOCK-IN-HAND',
      'SECURED LOANS', 'UNSECURED LOANS', 'SUSPENSE ACCOUNT',
      'BRANCH / DIVISIONS', 'MISC. EXPENSES',
      'SALARY ADVANCE', 'SALARY',
    ];

    // Patterns
    this.PAN_REGEX = /\b[A-Z]{5}\d{4}[A-Z]\b/g;
    this.GSTIN_REGEX = /\b\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]{2}\b/g;
    this.PIN_REGEX = /\b\d{6}\b/;
    this.PHONE_REGEX = /\b[\d,]{7,}\b/;
    this.ACTION_TYPES = ['Creation', 'Alteration', 'Creation (Secondary)', 'Alteration (Secondary)'];
    this.TALLY_UUID = 'a56cdcb5-1d83-4c0e-8a62-05ac87a7f57a';
  }

  /**
   * Parse the Manager.900 file and extract ledger records.
   * Uses streaming for the large file (~994MB).
   */
  async parse(filePath, onProgress) {
    const reader = new BinaryReader(filePath, { chunkSize: 512 * 1024 });
    const fileSize = await reader.getFileSize();
    const ledgers = [];
    const seenNames = new Set();
    let processedBytes = 0;
    let carryOver = '';

    for await (const chunk of reader.readChunks()) {
      processedBytes += Buffer.byteLength(chunk, 'utf16le');

      // Combine with any carryover from previous chunk
      const text = carryOver + chunk;
      carryOver = '';

      // Keep last 2000 chars as carryover to handle records split across chunks
      if (text.length > 2000) {
        carryOver = text.slice(-2000);
      }

      // Extract printable strings
      const strings = BinaryReader.extractStrings(text, 3);

      // Process strings to find ledger records
      this._extractLedgerRecords(strings, ledgers, seenNames);

      if (onProgress) {
        const pct = Math.min(100, Math.round((processedBytes / fileSize) * 100));
        onProgress(pct, ledgers.length);
      }
    }

    // Deduplicate: keep the most complete record for each name
    const deduped = this._deduplicateLedgers(ledgers);

    return deduped;
  }

  /**
   * Extract ledger records from an array of extracted strings.
   */
  _extractLedgerRecords(strings, ledgers, seenNames) {
    for (let i = 0; i < strings.length; i++) {
      const str = strings[i];

      // Look for tilde-delimited records that match ledger pattern
      if (str.includes('~') && this._isLedgerRecord(str)) {
        const record = this._parseTildeRecord(str, strings, i);
        if (record && record.name) {
          const key = record.name.trim().toUpperCase();
          // We keep all records, dedup happens later
          ledgers.push(record);
          seenNames.add(key);
        }
      }
    }
  }

  /**
   * Check if a tilde-delimited string looks like a ledger record.
   */
  _isLedgerRecord(str) {
    // Must contain a known group name or common ledger patterns
    const upper = str.toUpperCase();
    for (const group of this.KNOWN_GROUPS) {
      if (upper.includes(group)) return true;
    }
    // Also match custom groups with common suffixes
    if (/~[A-Z\s&.'()-]+~/.test(str) && str.split('~').length >= 3) {
      return true;
    }
    return false;
  }

  /**
   * Parse a tilde-delimited record string into a structured ledger object.
   */
  _parseTildeRecord(str, allStrings, index) {
    const parts = str.split('~').map(s => s.trim()).filter(s => s.length > 0);
    if (parts.length < 2) return null;

    const record = {
      name: null,
      groupName: null,
      displayName: null,
      address: null,
      city: null,
      pinCode: null,
      state: null,
      country: null,
      contactName: null,
      phone: null,
      phone2: null,
      pan: null,
      gstin: null,
      createdBy: null,
      createdAt: null,
      alteredBy: null,
      alteredAt: null,
      actionType: null,
      rawRecord: str.substring(0, 500)
    };

    // Parse the tilde-separated fields
    // Pattern: Name~Group~DisplayName~Address~...
    let nameFound = false;
    for (let j = 0; j < parts.length; j++) {
      const part = parts[j];
      const upperPart = part.toUpperCase();

      // Skip common non-data fields
      if (['NO', 'YES', 'NOT APPLICABLE', 'LIABILITIES', 'ASSETS', 'INCOME', 'EXPENSES'].includes(upperPart)) {
        continue;
      }

      // Find group name
      if (!record.groupName) {
        for (const group of this.KNOWN_GROUPS) {
          if (upperPart.includes(group)) {
            record.groupName = part;
            // The part before the group is likely the name
            if (j > 0 && !record.name) {
              record.name = parts[j - 1];
            }
            nameFound = true;
            break;
          }
        }
        if (nameFound) continue;
      }

      // If we have name and group, remaining fields are address/contact info
      if (record.name && record.groupName) {
        // Display name (usually next field after group)
        if (!record.displayName && j === 2) {
          record.displayName = part;
          if (part.length > record.name.length && part.includes(record.name)) {
            record.name = part;
          }
          continue;
        }

        // PIN code (6 digits)
        if (!record.pinCode && /^\d{6}$/.test(part)) {
          record.pinCode = part;
          continue;
        }

        // Phone numbers (allows digits, /, comma, +, -)
        if (/^[\d,/\s+-]{7,}$/.test(part) && part !== '.' && !/^\d{6}$/.test(part)) {
          if (!record.phone) {
            record.phone = part.trim();
          } else if (!record.phone2 && record.phone !== part.trim()) {
            record.phone2 = part.trim();
          }
          continue;
        }

        // Address (contains | separator for multi-line)
        if (part.includes('|')) {
          record.address = part.replace(/\|/g, ', ').replace(/^,\s*/, '').replace(/,\s*$/, '').trim();
          continue;
        }

        // Contact Name (person name, e.g. SUBHASH KR. CHOUDHARY)
        if (!record.contactName && /^[A-Z][a-zA-Z\s.]{2,40}$/.test(part) &&
            !['INDIA', 'BIHAR', 'PATNA', 'DELHI', 'YES', 'NO'].includes(part.toUpperCase()) &&
            !part.toUpperCase().includes('LTD') && !part.toUpperCase().includes('PVT') &&
            !part.toUpperCase().includes('DEBTOR') && !part.toUpperCase().includes('CREDITOR')) {
          record.contactName = part;
          continue;
        }

        // City/Locality
        if (!record.city && part.length > 2 && part !== '.' && !/^\d+$/.test(part)) {
          record.city = part.replace(/\s*N\.A\.?/i, '').trim();
          continue;
        }
      }
    }

    // If we still don't have a name but have a group, try first non-empty part
    if (!record.name && record.groupName) {
      for (const part of parts) {
        const upper = part.toUpperCase();
        if (part.length > 1 && !this.KNOWN_GROUPS.some(g => upper.includes(g)) &&
            !['NO', 'YES', 'NOT APPLICABLE'].includes(upper)) {
          record.name = part;
          break;
        }
      }
    }

    // Extract PAN from the current string
    const panMatch = str.match(this.PAN_REGEX);
    if (panMatch) {
      for (const p of panMatch) {
        if (!['INDIA', 'BIHAR', 'DELHI', 'PATNA'].includes(p)) {
          record.pan = p;
          break;
        }
      }
    }

    // Extract GSTIN from current string
    const gstMatch = str.match(this.GSTIN_REGEX);
    if (gstMatch) {
      record.gstin = gstMatch[0];
    }

    // Look ahead in the string array for PAN, GSTIN, and audit trail info
    for (let k = index + 1; k < Math.min(index + 12, allStrings.length); k++) {
      const next = allStrings[k];

      // If next is a new ledger record with group, stop looking ahead
      if (this.KNOWN_GROUPS.some(g => next.toUpperCase().includes(g)) && next.includes('~')) {
        break;
      }

      // Check for PAN in next strings
      if (!record.pan) {
        const pMatch = next.match(this.PAN_REGEX);
        if (pMatch) {
          for (const p of pMatch) {
            if (!['INDIA', 'BIHAR', 'DELHI', 'PATNA'].includes(p)) {
              record.pan = p;
              break;
            }
          }
        }
      }

      // Check for GSTIN in next strings
      if (!record.gstin) {
        const gMatch = next.match(this.GSTIN_REGEX);
        if (gMatch) {
          record.gstin = gMatch[0];
        }
      }

      // Action type
      for (const action of this.ACTION_TYPES) {
        if (next === action || next.includes(action)) {
          record.actionType = action;
          break;
        }
      }

      // Time (HH:MM:SS)
      if (/^\d{2}:\d{2}:\d{2}$/.test(next)) {
        if (!record.createdAt) {
          record.createdAt = next;
        } else if (!record.alteredAt) {
          record.alteredAt = next;
        }
      }

      // Username (short string before action type, not a UUID)
      if (next.length >= 3 && next.length <= 30 && /^[a-zA-Z][a-zA-Z\s.]*$/.test(next) &&
          !this.ACTION_TYPES.includes(next) && !next.includes(this.TALLY_UUID)) {
        if (!record.createdBy) {
          record.createdBy = next;
        } else if (!record.alteredBy && next !== record.createdBy) {
          record.alteredBy = next;
        }
      }
    }

    // Look in surrounding strings for state and country
    for (let k = Math.max(0, index - 5); k < Math.min(index + 5, allStrings.length); k++) {
      const near = allStrings[k];
      if (['Bihar', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Uttar Pradesh',
           'Rajasthan', 'Gujarat', 'Jharkhand', 'Madhya Pradesh', 'Odisha', 'Assam', 'Kerala',
           'Haryana', 'Punjab', 'Telangana', 'Andhra Pradesh', 'Chhattisgarh', 'Uttarakhand',
           'Himachal Pradesh', 'Goa', 'Tripura', 'Meghalaya', 'Manipur', 'Nagaland',
           'Arunachal Pradesh', 'Sikkim', 'Mizoram'].includes(near)) {
        record.state = near;
      }
      if (near === 'India') {
        record.country = near;
      }
    }

    return record;
  }

  /**
   * Deduplicate ledgers, keeping the most complete record for each unique name.
   */
  _deduplicateLedgers(ledgers) {
    const map = new Map();

    for (const ledger of ledgers) {
      if (!ledger.name) continue;
      const key = ledger.name.trim().toUpperCase();

      if (map.has(key)) {
        // Merge: keep the more complete record
        const existing = map.get(key);
        map.set(key, this._mergeLedger(existing, ledger));
      } else {
        map.set(key, ledger);
      }
    }

    return Array.from(map.values());
  }

  /**
   * Merge two ledger records, preferring non-null values from either.
   */
  _mergeLedger(a, b) {
    const merged = { ...a };
    for (const key of Object.keys(b)) {
      if (b[key] && !a[key]) {
        merged[key] = b[key];
      }
    }
    return merged;
  }
}

module.exports = LedgerParser;
