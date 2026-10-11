# Tally Prime EditLog Extractor

A parser and web dashboard to extract ledgers, vouchers, and audit trails directly from Tally Prime EditLog binary folders (`.900` files) into SQLite.

---

## Why this exists

Tally Prime (specifically EditLog releases) stores company data in proprietary binary files like `Manager.900`, `LinkMgr.900`, and `SumTran.900`. Usually, getting this data out requires:

1. Keeping a licensed Tally instance running.
2. Configuring ODBC or writing custom TDL export scripts.
3. Dealing with slow XML/TCP exports.

If you only have access to an offline company backup folder—which can easily be 5 GB to 10+ GB—extracting records without Tally is tricky. Dumping these files into memory will instantly crash Node.js with heap out-of-memory errors.

This tool reverse-engineers the UTF-16LE string boundaries and streams the binary files in chunks, pulling out structured accounting records directly into a local SQLite database, with a React UI to search, filter, and inspect everything.

---

## What it extracts

- **Ledger Masters** (`Manager.900`): Names, parent groups (Sundry Debtors, Creditors, Bank Accounts, etc.), PAN numbers, GSTINs, addresses, contacts, and phone numbers.
- **Vouchers** (`LinkMgr.900`): Voucher numbers, fiscal-year sequences, and date references.
- **Audit Trails & Operator History** (`SumTran.900`): EditLog change history, user names, action timestamps, and session logs.
- **Company Metadata** (`AddlCmp.900`): Company name, financial year, and folder details.

---

## How it works

1. **Streaming UTF-16LE Reader**: Reads `.900` binary files in 256KB chunks, aligning byte pairs to decode UTF-16LE strings across buffer boundaries without holding multi-gigabyte files in memory.
2. **Entity Heuristics**: Identifies ledger boundaries, account group relationships, and Indian tax patterns (PAN regex `[A-Z]{5}[0-9]{4}[A-Z]`, GSTIN regex `[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]`).
3. **SQLite Indexing**: Extracted records are batch-inserted into SQLite using `better-sqlite3` with indexed columns for search and filtering.
4. **React Dashboard**: Provides a searchable ledger directory, group breakdown, audit drawer for entity history, and one-click CSV export.

---

## Project Structure

```
tally-extractor/
├── server/
│   ├── src/
│   │   ├── app.js               # Express server & static asset handler
│   │   ├── db/
│   │   │   ├── schema.sql       # SQLite tables (companies, ledgers, vouchers, activity)
│   │   │   └── database.js      # better-sqlite3 queries & transactions
│   │   ├── parser/
│   │   │   ├── binaryReader.js  # Low-level chunked stream reader
│   │   │   ├── ledgerParser.js  # Manager.900 parser (ledgers, PAN, GST)
│   │   │   ├── voucherParser.js # LinkMgr.900 parser (voucher records)
│   │   │   ├── auditParser.js   # SumTran.900 parser (EditLog trails)
│   │   │   ├── companyParser.js # AddlCmp.900 parser (company info)
│   │   │   └── orchestrator.js  # Ingestion pipeline & progress tracking
│   │   └── routes/
│   │       └── api.js           # REST API endpoints
│   └── data/                    # Generated SQLite database (tally.db)
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # Navigation & company selector
│   │   │   ├── Header.jsx       # Search & stats header
│   │   │   ├── StatsCards.jsx   # Ledger & voucher summary cards
│   │   │   ├── Overview.jsx     # Group distributions & metrics
│   │   │   ├── LedgerTable.jsx  # Paginated master table + CSV export
│   │   │   ├── VoucherTimeline.jsx # Voucher sequence browser
│   │   │   ├── ActivityLog.jsx  # Operator action logs
│   │   │   └── UploadZone.jsx   # Local path ingestion & ZIP dropzone
│   │   ├── App.jsx
│   │   └── index.css            # Dark theme styles
│   └── vite.config.js
└── README.md
```

---

## Quickstart

### Prerequisites
- Node.js 18+ (tested on Node 20+)
- npm

### 1. Server Setup
```bash
cd server
npm install
npm start
```
The server runs on `http://localhost:3001`. SQLite database and schema are initialized automatically on first run in `server/data/tally.db`.

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The Vite development server runs on `http://localhost:5173` and proxies API requests to port `3001`.

---

## Ingesting Data

You can feed Tally data into the extractor in two ways:

1. **Local Folder Path (Recommended for large datasets)**:
   In the web dashboard under **Upload / Ingest**, enter the absolute path to your Tally company folder (e.g., `D:\TallyData\10001` or wherever your `.900` files are located) and click **Ingest Local Folder**. This avoids copying multi-gigabyte files.
2. **ZIP Archive Upload**:
   Drop a `.zip` archive containing the company folder into the dashboard upload zone. The server unpacks it into a temporary directory, runs the extraction pipeline, and cleans up after ingestion.

---

## REST Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/companies` | List all indexed companies |
| `GET` | `/api/companies/:id/stats` | Summary counts, group breakdown, PAN/GST stats |
| `GET` | `/api/companies/:id/ledgers` | Paginated ledgers with search (`?search=`) and group filter (`?group=`) |
| `GET` | `/api/companies/:id/vouchers` | Paginated voucher list |
| `GET` | `/api/companies/:id/activity` | EditLog session entries |
| `GET` | `/api/companies/:id/export` | Download filtered ledgers as CSV |
| `POST` | `/api/parse-local` | Trigger ingestion from a local disk path (`{ folderPath }`) |
| `POST` | `/api/upload` | Upload a ZIP archive of Tally data |
| `GET` | `/api/progress/:trackingId` | Poll extraction progress percentage and current stage |
| `DELETE`| `/api/companies/:id` | Delete an indexed company and its records |

---

## Notes & Caveats

- **File Version Compatibility**: Tested against Tally Prime EditLog 2.1 data folders. Different Tally releases may introduce minor variations in internal binary delimiter tokens.
- **Data Privacy**: Raw Tally company folders and SQLite database files (`*.db`) are ignored in `.gitignore` by default so proprietary financial records are not accidentally pushed to git.
