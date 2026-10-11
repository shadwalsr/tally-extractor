const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

class DatabaseManager {
  constructor(dbPath) {
    this.dbPath = dbPath || path.join(__dirname, '..', '..', 'data', 'tally.db');

    // Ensure data directory exists
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    this._initSchema();
  }

  _initSchema() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    this.db.exec(schema);
  }

  // ── Company Operations ──────────────────────────────────────────────

  createCompany(name, folderName, dataDate, sourcePath) {
    const stmt = this.db.prepare(
      `INSERT INTO companies (name, folder_name, data_date, source_path, status)
       VALUES (?, ?, ?, ?, 'processing')`
    );
    const result = stmt.run(name, folderName, dataDate, sourcePath);
    return result.lastInsertRowid;
  }

  updateCompanyStatus(id, status, totals = {}) {
    const sets = ['status = ?'];
    const params = [status];

    if (totals.ledgers !== undefined) {
      sets.push('total_ledgers = ?');
      params.push(totals.ledgers);
    }
    if (totals.vouchers !== undefined) {
      sets.push('total_vouchers = ?');
      params.push(totals.vouchers);
    }
    if (totals.users !== undefined) {
      sets.push('total_users = ?');
      params.push(totals.users);
    }

    params.push(id);
    this.db.prepare(`UPDATE companies SET ${sets.join(', ')} WHERE id = ?`).run(...params);
  }

  getCompanies() {
    return this.db.prepare('SELECT * FROM companies ORDER BY upload_date DESC').all();
  }

  getCompany(id) {
    return this.db.prepare('SELECT * FROM companies WHERE id = ?').get(id);
  }

  deleteCompany(id) {
    this.db.prepare('DELETE FROM companies WHERE id = ?').run(id);
  }

  // ── Ledger Operations ───────────────────────────────────────────────

  insertLedgers(companyId, ledgers) {
    const stmt = this.db.prepare(
      `INSERT INTO ledgers (company_id, name, group_name, display_name, address, city, pin_code, state, country, contact_name, phone, phone2, pan, gstin, created_by, created_at, altered_by, altered_at, action_type, raw_record)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const insertMany = this.db.transaction((items) => {
      for (const l of items) {
        stmt.run(
          companyId,
          l.name || null,
          l.groupName || null,
          l.displayName || null,
          l.address || null,
          l.city || null,
          l.pinCode || null,
          l.state || null,
          l.country || null,
          l.contactName || null,
          l.phone || null,
          l.phone2 || null,
          l.pan || null,
          l.gstin || null,
          l.createdBy || null,
          l.createdAt || null,
          l.alteredBy || null,
          l.alteredAt || null,
          l.actionType || null,
          l.rawRecord || null
        );
      }
    });

    insertMany(ledgers);
  }

  getLedgers(companyId, { search, group, page = 1, limit = 50, sortBy = 'name', sortOrder = 'asc' } = {}) {
    let where = ['company_id = ?'];
    let params = [companyId];

    if (search) {
      where.push('(name LIKE ? OR contact_name LIKE ? OR pan LIKE ? OR gstin LIKE ? OR phone LIKE ? OR address LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s, s, s);
    }

    if (group) {
      where.push('group_name = ?');
      params.push(group);
    }

    const allowedSort = ['name', 'group_name', 'city', 'state', 'pin_code', 'created_by', 'altered_by'];
    const col = allowedSort.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder === 'desc' ? 'DESC' : 'ASC';

    const offset = (page - 1) * limit;

    const countStmt = this.db.prepare(`SELECT COUNT(*) as total FROM ledgers WHERE ${where.join(' AND ')}`);
    const total = countStmt.get(...params).total;

    const dataStmt = this.db.prepare(
      `SELECT * FROM ledgers WHERE ${where.join(' AND ')} ORDER BY ${col} ${order} LIMIT ? OFFSET ?`
    );
    const data = dataStmt.all(...params, limit, offset);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  getLedgerGroups(companyId) {
    return this.db.prepare(
      `SELECT group_name, COUNT(*) as count FROM ledgers WHERE company_id = ? AND group_name IS NOT NULL GROUP BY group_name ORDER BY count DESC`
    ).all(companyId);
  }

  // ── Voucher Operations ──────────────────────────────────────────────

  insertVouchers(companyId, vouchers) {
    const stmt = this.db.prepare(
      `INSERT INTO vouchers (company_id, date, voucher_number, financial_year, parsed_date)
       VALUES (?, ?, ?, ?, ?)`
    );

    const insertMany = this.db.transaction((items) => {
      for (const v of items) {
        stmt.run(companyId, v.date || null, v.voucherNumber || null, v.financialYear || null, v.parsedDate || null);
      }
    });

    insertMany(vouchers);
  }

  getVouchers(companyId, { page = 1, limit = 50, dateFrom, dateTo, search } = {}) {
    let where = ['company_id = ?'];
    let params = [companyId];

    if (search) {
      where.push('voucher_number LIKE ?');
      params.push(`%${search}%`);
    }

    if (dateFrom) {
      where.push('parsed_date >= ?');
      params.push(dateFrom);
    }
    if (dateTo) {
      where.push('parsed_date <= ?');
      params.push(dateTo);
    }

    const offset = (page - 1) * limit;

    const countStmt = this.db.prepare(`SELECT COUNT(*) as total FROM vouchers WHERE ${where.join(' AND ')}`);
    const total = countStmt.get(...params).total;

    const dataStmt = this.db.prepare(
      `SELECT * FROM vouchers WHERE ${where.join(' AND ')} ORDER BY parsed_date DESC, voucher_number ASC LIMIT ? OFFSET ?`
    );
    const data = dataStmt.all(...params, limit, offset);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── User Activity Operations ────────────────────────────────────────

  insertActivity(companyId, activities) {
    const stmt = this.db.prepare(
      `INSERT INTO user_activity (company_id, username, session_id, activity_type)
       VALUES (?, ?, ?, ?)`
    );

    const insertMany = this.db.transaction((items) => {
      for (const a of items) {
        stmt.run(companyId, a.username || null, a.sessionId || null, a.activityType || null);
      }
    });

    insertMany(activities);
  }

  getActivity(companyId, { page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;
    const total = this.db.prepare('SELECT COUNT(*) as total FROM user_activity WHERE company_id = ?').get(companyId).total;
    const data = this.db.prepare(
      'SELECT * FROM user_activity WHERE company_id = ? ORDER BY id DESC LIMIT ? OFFSET ?'
    ).all(companyId, limit, offset);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Statistics ──────────────────────────────────────────────────────

  getStats(companyId) {
    const company = this.getCompany(companyId);
    if (!company) return null;

    const ledgerCount = this.db.prepare('SELECT COUNT(*) as c FROM ledgers WHERE company_id = ?').get(companyId).c;
    const voucherCount = this.db.prepare('SELECT COUNT(*) as c FROM vouchers WHERE company_id = ?').get(companyId).c;
    const userCount = this.db.prepare('SELECT COUNT(DISTINCT username) as c FROM user_activity WHERE company_id = ?').get(companyId).c;

    const groups = this.getLedgerGroups(companyId);

    const panCount = this.db.prepare("SELECT COUNT(*) as c FROM ledgers WHERE company_id = ? AND pan IS NOT NULL AND pan != ''").get(companyId).c;
    const gstCount = this.db.prepare("SELECT COUNT(*) as c FROM ledgers WHERE company_id = ? AND gstin IS NOT NULL AND gstin != ''").get(companyId).c;

    const states = this.db.prepare(
      "SELECT state, COUNT(*) as count FROM ledgers WHERE company_id = ? AND state IS NOT NULL AND state != '' GROUP BY state ORDER BY count DESC"
    ).all(companyId);

    const vouchersByYear = this.db.prepare(
      "SELECT financial_year, COUNT(*) as count FROM vouchers WHERE company_id = ? AND financial_year IS NOT NULL GROUP BY financial_year ORDER BY financial_year"
    ).all(companyId);

    const topUsers = this.db.prepare(
      "SELECT username, COUNT(*) as count FROM user_activity WHERE company_id = ? AND username IS NOT NULL GROUP BY username ORDER BY count DESC LIMIT 10"
    ).all(companyId);

    return {
      company,
      ledgerCount,
      voucherCount,
      userCount,
      groups,
      panCount,
      gstCount,
      states,
      vouchersByYear,
      topUsers
    };
  }

  // ── Export ──────────────────────────────────────────────────────────

  exportLedgersCSV(companyId, { search, group } = {}) {
    let where = ['company_id = ?'];
    let params = [companyId];

    if (search) {
      where.push('(name LIKE ? OR contact_name LIKE ? OR pan LIKE ? OR gstin LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (group) {
      where.push('group_name = ?');
      params.push(group);
    }

    return this.db.prepare(
      `SELECT name, group_name, display_name, address, city, pin_code, state, country, contact_name, phone, phone2, pan, gstin, created_by, created_at, altered_by, altered_at
       FROM ledgers WHERE ${where.join(' AND ')} ORDER BY name ASC`
    ).all(...params);
  }

  close() {
    this.db.close();
  }
}

module.exports = DatabaseManager;
