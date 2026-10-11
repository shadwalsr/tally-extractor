const fs = require('fs');
const path = require('path');
const LedgerParser = require('./ledgerParser');
const VoucherParser = require('./voucherParser');
const AuditParser = require('./auditParser');
const CompanyParser = require('./companyParser');

/**
 * Main orchestrator that coordinates parsing of all .900 files in a Tally data folder.
 */
class TallyDataOrchestrator {
  constructor(db) {
    this.db = db;
    this.ledgerParser = new LedgerParser();
    this.voucherParser = new VoucherParser();
    this.auditParser = new AuditParser();
    this.companyParser = new CompanyParser();
  }

  /**
   * Parse an entire Tally data folder and store results in the database.
   * @param {string} dataFolderPath - Path to the folder containing .900 files
   * @param {string} companyName - Name of the company
   * @param {string} dataDate - Date of the data extract
   * @param {function} onProgress - Progress callback(stage, percent, detail)
   * @returns {number} Company ID in the database
   */
  async parseFolder(dataFolderPath, companyName, dataDate, onProgress) {
    // Find the inner numbered directory (e.g., 20020)
    const innerDir = await this._findDataDirectory(dataFolderPath);
    if (!innerDir) {
      throw new Error(`No Tally data directory found in: ${dataFolderPath}`);
    }

    console.log(`[Orchestrator] Data directory found: ${innerDir}`);
    console.log(`[Orchestrator] Company: ${companyName}, Date: ${dataDate}`);

    // Create company record
    const companyId = this.db.createCompany(companyName, path.basename(dataFolderPath), dataDate, dataFolderPath);

    try {
      const totals = { ledgers: 0, vouchers: 0, users: 0 };

      // 1. Parse Manager.900 (Ledger Masters) - largest and most important
      const managerPath = path.join(innerDir, 'Manager.900');
      if (fs.existsSync(managerPath)) {
        if (onProgress) onProgress('ledgers', 0, 'Starting ledger parsing...');
        console.log('[Orchestrator] Parsing Manager.900 (ledger masters)...');

        const ledgers = await this.ledgerParser.parse(managerPath, (pct, count) => {
          if (onProgress) onProgress('ledgers', pct, `Parsed ${count} ledgers...`);
        });

        console.log(`[Orchestrator] Found ${ledgers.length} unique ledger records`);

        if (ledgers.length > 0) {
          // Insert in batches of 500
          for (let i = 0; i < ledgers.length; i += 500) {
            const batch = ledgers.slice(i, i + 500);
            this.db.insertLedgers(companyId, batch);
          }
          totals.ledgers = ledgers.length;
        }

        if (onProgress) onProgress('ledgers', 100, `Completed: ${ledgers.length} ledgers`);
      }

      // 2. Parse LinkMgr.900 (Voucher References)
      const linkMgrPath = path.join(innerDir, 'LinkMgr.900');
      if (fs.existsSync(linkMgrPath)) {
        if (onProgress) onProgress('vouchers', 0, 'Starting voucher parsing...');
        console.log('[Orchestrator] Parsing LinkMgr.900 (voucher references)...');

        const vouchers = await this.voucherParser.parse(linkMgrPath, (pct, count) => {
          if (onProgress) onProgress('vouchers', pct, `Parsed ${count} vouchers...`);
        });

        console.log(`[Orchestrator] Found ${vouchers.length} unique voucher references`);

        if (vouchers.length > 0) {
          for (let i = 0; i < vouchers.length; i += 500) {
            const batch = vouchers.slice(i, i + 500);
            this.db.insertVouchers(companyId, batch);
          }
          totals.vouchers = vouchers.length;
        }

        if (onProgress) onProgress('vouchers', 100, `Completed: ${vouchers.length} vouchers`);
      }

      // 3. Parse SumTran.900 (User Activity)
      const sumTranPath = path.join(innerDir, 'SumTran.900');
      if (fs.existsSync(sumTranPath)) {
        if (onProgress) onProgress('activity', 0, 'Parsing user activity...');
        console.log('[Orchestrator] Parsing SumTran.900 (user activity)...');

        const { activities } = await this.auditParser.parse(sumTranPath);

        console.log(`[Orchestrator] Found ${activities.length} user activity records`);

        if (activities.length > 0) {
          this.db.insertActivity(companyId, activities);
          totals.users = new Set(activities.map(a => a.username.toUpperCase())).size;
        }

        if (onProgress) onProgress('activity', 100, `Completed: ${activities.length} activities`);
      }

      // 4. Parse AddlCmp.900 (Company Info) - informational only
      const addlCmpPath = path.join(innerDir, 'AddlCmp.900');
      if (fs.existsSync(addlCmpPath)) {
        console.log('[Orchestrator] Parsing AddlCmp.900 (company info)...');
        const companyInfo = await this.companyParser.parse(addlCmpPath);
        console.log(`[Orchestrator] Company info: ${companyInfo.financialYears.length} financial years found`);
      }

      // Update company with totals and mark as ready
      this.db.updateCompanyStatus(companyId, 'ready', totals);

      if (onProgress) onProgress('complete', 100, 'All parsing complete!');
      console.log(`[Orchestrator] Parsing complete. Company ID: ${companyId}`);
      console.log(`[Orchestrator] Totals - Ledgers: ${totals.ledgers}, Vouchers: ${totals.vouchers}, Users: ${totals.users}`);

      return companyId;

    } catch (error) {
      console.error(`[Orchestrator] Error during parsing: ${error.message}`);
      this.db.updateCompanyStatus(companyId, 'error');
      throw error;
    }
  }

  /**
   * Find the data directory containing .900 files.
   * Handles nested folder structures like: TopFolder/20020/*.900
   */
  async _findDataDirectory(basePath) {
    // Check if .900 files exist directly in the folder
    const files = await fs.promises.readdir(basePath);
    const has900 = files.some(f => f.endsWith('.900'));
    if (has900) return basePath;

    // Check subdirectories
    for (const entry of files) {
      const fullPath = path.join(basePath, entry);
      const stat = await fs.promises.stat(fullPath);
      if (stat.isDirectory()) {
        const subFiles = await fs.promises.readdir(fullPath);
        if (subFiles.some(f => f.endsWith('.900'))) {
          return fullPath;
        }
        // Check one more level deep
        for (const subEntry of subFiles) {
          const subFullPath = path.join(fullPath, subEntry);
          try {
            const subStat = await fs.promises.stat(subFullPath);
            if (subStat.isDirectory()) {
              const subSubFiles = await fs.promises.readdir(subFullPath);
              if (subSubFiles.some(f => f.endsWith('.900'))) {
                return subFullPath;
              }
            }
          } catch { /* skip inaccessible */ }
        }
      }
    }

    return null;
  }

  /**
   * Extract company name and date from folder name.
   * Example: "Tally Prime EditLog 2.1 Data of BMW Ventures Limited as on EOD of 20-09-2026"
   */
  static parseFolderName(folderName) {
    let companyName = folderName;
    let dataDate = null;

    // Try to extract company name
    const companyMatch = folderName.match(/Data of\s+(.+?)\s+as on/i);
    if (companyMatch) {
      companyName = companyMatch[1].trim();
    }

    // Try to extract date
    const dateMatch = folderName.match(/EOD of\s+(\d{2}-\d{2}-\d{4})/i);
    if (dateMatch) {
      const parts = dateMatch[1].split('-');
      dataDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
    }

    return { companyName, dataDate };
  }
}

module.exports = TallyDataOrchestrator;
