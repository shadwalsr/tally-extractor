# Tally Prime EditLog Extractor & Intelligence Dashboard

A high-performance full-stack system engineered to parse, extract, index, and analyze proprietary Tally Prime EditLog 2.1 binary data files (`.900`) and visualize them in a dark-themed React dashboard.

---

## 🚀 Key Features

1. **High-Performance Streaming Binary Parser**:
   - Parses large multi-gigabyte `.900` files (`Manager.900`, `LinkMgr.900`, `SumTran.900`, `AddlCmp.900`) without high memory usage using UTF-16LE chunk streaming.
   - Identifies master ledgers, display names, account groups, PAN numbers, GSTINs, addresses, contact persons, and phone numbers.
   - Extracts complete **EditLog 2.1 audit trails** (Created By, Altered By, Action Types, timestamps).
   - Ingests **76,000+ transaction vouchers** and sequences across fiscal years.

2. **Automated & Manual Data Ingestion**:
   - **Direct Local Ingestion**: Instantly point to any local directory on disk without zipping.
   - **Drag-and-Drop ZIP Upload**: Ingest and extract ZIP archives with real-time stage & percentage progress tracking.

3. **Modern Interactive Dashboard (React + Vite)**:
   - **Executive KPIs**: Total Ledgers, Vouchers, PAN coverage %, GST entities, and Active Operators.
   - **Account Group Breakdown**: Visual distribution bars across Sundry Debtors, Creditors, Assets, etc.
   - **Master Ledgers Directory**: Fast debounced search, group filters, column sorting, pagination, and one-click CSV export.
   - **Expandable Audit Drawer**: Inspect entity details, location, contacts, and EditLog change history with raw binary snippets.
   - **Voucher Timeline**: Fiscal-year indexed voucher sequences (`BMW/003461/17-18`).
   - **Audit & Operator Activity**: Track user logins, sessions, and EditLog operators (`MANISH`, `HASNAIN`, etc.).

---

## 🏗️ Architecture

```
d:\tally extractor\
├── server/
│   ├── src/
│   │   ├── app.js               # Express application server
│   │   ├── db/
│   │   │   ├── schema.sql       # SQLite tables and indexing
│   │   │   └── database.js      # Better-SQLite3 interface & queries
│   │   ├── parser/
│   │   │   ├── binaryReader.js  # Low-level UTF-16LE streaming reader
│   │   │   ├── ledgerParser.js  # Manager.900 ledger & tax extractor
│   │   │   ├── voucherParser.js # LinkMgr.900 voucher parser
│   │   │   ├── auditParser.js   # SumTran.900 user session parser
│   │   │   ├── companyParser.js # AddlCmp.900 company info parser
│   │   │   └── orchestrator.js  # Ingestion workflow coordinator
│   │   └── routes/
│   │       └── api.js           # REST endpoints
│   └── data/
│       └── tally.db             # Local SQLite database
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # Navigation & company switcher
│   │   │   ├── Header.jsx       # Header & quick actions
│   │   │   ├── StatsCards.jsx   # Top-level KPI widgets
│   │   │   ├── Overview.jsx     # Analytics & group breakdown
│   │   │   ├── LedgerTable.jsx  # Searchable master ledger browser
│   │   │   ├── VoucherTimeline.jsx # Voucher timeline table
│   │   │   ├── ActivityLog.jsx  # Operator session tracking
│   │   │   └── UploadZone.jsx   # Drag-and-drop & local ingestion
│   │   ├── App.jsx              # Application router
│   │   └── index.css            # Dark glassmorphism design system
└── README.md
```

---

## ⚡ Getting Started

### 1. Start the Backend API Server
```bash
cd server
npm install
npm start
```
The backend starts at `http://localhost:3001` and serves both the API and the production client build.

### 2. Start the Frontend (Vite Dev Server)
```bash
cd client
npm install
npm run dev
```
The frontend dev server runs at `http://localhost:5173` with instant Hot Module Replacement (HMR) and automatic API proxying.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/companies` | List all parsed companies and datasets |
| `GET` | `/api/companies/:id/stats` | KPI summary statistics, groups, PAN/GST coverage |
| `GET` | `/api/companies/:id/ledgers` | Searchable, paginated master ledgers |
| `GET` | `/api/companies/:id/vouchers`| Searchable, paginated voucher records |
| `GET` | `/api/companies/:id/activity`| EditLog user session logs |
| `GET` | `/api/companies/:id/export` | Download filtered ledgers as CSV |
| `POST`| `/api/upload` | Upload `.zip` package with Tally data |
| `POST`| `/api/parse-local` | Ingest local folder directory on server |
| `GET` | `/api/progress/:trackingId` | Real-time parsing progress tracking |
| `DELETE`| `/api/companies/:id` | Remove company data |
