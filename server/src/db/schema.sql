CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  folder_name TEXT NOT NULL,
  upload_date TEXT DEFAULT (datetime('now')),
  data_date TEXT,
  total_ledgers INTEGER DEFAULT 0,
  total_vouchers INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  status TEXT DEFAULT 'processing',
  source_path TEXT
);

CREATE TABLE IF NOT EXISTS ledgers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  group_name TEXT,
  display_name TEXT,
  address TEXT,
  city TEXT,
  pin_code TEXT,
  state TEXT,
  country TEXT,
  contact_name TEXT,
  phone TEXT,
  phone2 TEXT,
  pan TEXT,
  gstin TEXT,
  created_by TEXT,
  created_at TEXT,
  altered_by TEXT,
  altered_at TEXT,
  action_type TEXT,
  raw_record TEXT
);

CREATE TABLE IF NOT EXISTS vouchers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  date TEXT,
  voucher_number TEXT,
  financial_year TEXT,
  parsed_date TEXT
);

CREATE TABLE IF NOT EXISTS user_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  username TEXT,
  session_id TEXT,
  activity_type TEXT
);

CREATE INDEX IF NOT EXISTS idx_ledgers_company ON ledgers(company_id);
CREATE INDEX IF NOT EXISTS idx_ledgers_group ON ledgers(group_name);
CREATE INDEX IF NOT EXISTS idx_ledgers_pan ON ledgers(pan);
CREATE INDEX IF NOT EXISTS idx_ledgers_name ON ledgers(name);
CREATE INDEX IF NOT EXISTS idx_vouchers_company ON vouchers(company_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_date ON vouchers(date);
CREATE INDEX IF NOT EXISTS idx_vouchers_number ON vouchers(voucher_number);
CREATE INDEX IF NOT EXISTS idx_activity_company ON user_activity(company_id);
