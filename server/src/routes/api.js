const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const TallyDataOrchestrator = require('../parser/orchestrator');

/**
 * Create API router with all endpoints.
 * @param {import('../db/database')} db - Database manager instance
 */
function createApiRouter(db) {
  const router = express.Router();

  // Configure multer for ZIP file uploads
  const uploadDir = path.join(__dirname, '..', '..', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    }
  });

  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 * 1024 }, // 10GB max
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (ext === '.zip') {
        cb(null, true);
      } else {
        cb(new Error('Only ZIP files are allowed'));
      }
    }
  });

  // Track parsing progress per company
  const parsingProgress = new Map();

  // ── Upload & Parse ──────────────────────────────────────────────────

  /**
   * POST /api/upload
   * Upload a ZIP file containing Tally data and parse it.
   */
  router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const zipPath = req.file.path;
      const extractDir = path.join(uploadDir, `extracted-${Date.now()}`);

      // Extract ZIP
      console.log(`[API] Extracting ZIP: ${zipPath}`);
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractDir, true);

      // Find the Tally data folder
      const entries = await fs.promises.readdir(extractDir);
      let dataFolder = extractDir;

      // Look for the Tally folder pattern
      for (const entry of entries) {
        if (entry.includes('Tally') || entry.includes('EditLog') || entry.includes('Data of')) {
          dataFolder = path.join(extractDir, entry);
          break;
        }
      }

      // Parse folder name for company info
      const folderName = path.basename(dataFolder);
      const { companyName, dataDate } = TallyDataOrchestrator.parseFolderName(folderName);

      // Override with request body if provided
      const finalName = req.body.companyName || companyName;
      const finalDate = req.body.dataDate || dataDate;

      // Start parsing in background
      const orchestrator = new TallyDataOrchestrator(db);

      // Create a temporary company ID for progress tracking
      const tempId = `parsing-${Date.now()}`;
      parsingProgress.set(tempId, { stage: 'starting', percent: 0, detail: 'Initializing...', companyId: null });

      res.json({
        message: 'Upload received, parsing started',
        trackingId: tempId,
        companyName: finalName,
        dataDate: finalDate
      });

      // Parse in background
      try {
        const companyId = await orchestrator.parseFolder(dataFolder, finalName, finalDate, (stage, pct, detail) => {
          parsingProgress.set(tempId, { stage, percent: pct, detail, companyId });
        });
        parsingProgress.set(tempId, { stage: 'complete', percent: 100, detail: 'Parsing complete!', companyId });
      } catch (parseError) {
        console.error('[API] Parse error:', parseError);
        parsingProgress.set(tempId, { stage: 'error', percent: 0, detail: parseError.message, companyId: null });
      }

      // Cleanup ZIP file (keep extracted data)
      try { fs.unlinkSync(zipPath); } catch { /* ignore */ }

    } catch (error) {
      console.error('[API] Upload error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/parse-local
   * Parse a local Tally data folder (for the existing data in workspace).
   */
  router.post('/parse-local', async (req, res) => {
    const { folderPath } = req.body;

    if (!folderPath) {
      return res.status(400).json({ error: 'folderPath is required' });
    }

    if (!fs.existsSync(folderPath)) {
      return res.status(400).json({ error: `Path does not exist: ${folderPath}` });
    }

    try {
      const folderName = path.basename(folderPath);
      const { companyName, dataDate } = TallyDataOrchestrator.parseFolderName(folderName);
      const finalName = req.body.companyName || companyName;
      const finalDate = req.body.dataDate || dataDate;

      const tempId = `parsing-${Date.now()}`;
      parsingProgress.set(tempId, { stage: 'starting', percent: 0, detail: 'Initializing...', companyId: null });

      res.json({
        message: 'Parsing started',
        trackingId: tempId,
        companyName: finalName,
        dataDate: finalDate
      });

      // Parse in background
      const orchestrator = new TallyDataOrchestrator(db);
      try {
        const companyId = await orchestrator.parseFolder(folderPath, finalName, finalDate, (stage, pct, detail) => {
          parsingProgress.set(tempId, { stage, percent: pct, detail, companyId });
        });
        parsingProgress.set(tempId, { stage: 'complete', percent: 100, detail: 'Parsing complete!', companyId });
      } catch (parseError) {
        console.error('[API] Parse error:', parseError);
        parsingProgress.set(tempId, { stage: 'error', percent: 0, detail: parseError.message, companyId: null });
      }
    } catch (error) {
      console.error('[API] Parse-local error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/progress/:trackingId
   * Check parsing progress.
   */
  router.get('/progress/:trackingId', (req, res) => {
    const progress = parsingProgress.get(req.params.trackingId);
    if (!progress) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }
    res.json(progress);
  });

  // ── Company Endpoints ───────────────────────────────────────────────

  /**
   * GET /api/companies
   * List all companies.
   */
  router.get('/companies', (req, res) => {
    try {
      const companies = db.getCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/companies/:id
   * Get company details.
   */
  router.get('/companies/:id', (req, res) => {
    try {
      const company = db.getCompany(parseInt(req.params.id));
      if (!company) return res.status(404).json({ error: 'Company not found' });
      res.json(company);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * DELETE /api/companies/:id
   * Delete a company and all its data.
   */
  router.delete('/companies/:id', (req, res) => {
    try {
      db.deleteCompany(parseInt(req.params.id));
      res.json({ message: 'Company deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Ledger Endpoints ────────────────────────────────────────────────

  /**
   * GET /api/companies/:id/ledgers
   * List ledgers with search, filter, and pagination.
   */
  router.get('/companies/:id/ledgers', (req, res) => {
    try {
      const { search, group, page, limit, sortBy, sortOrder } = req.query;
      const result = db.getLedgers(parseInt(req.params.id), {
        search,
        group,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50,
        sortBy,
        sortOrder
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/companies/:id/ledger-groups
   * Get ledger group breakdown.
   */
  router.get('/companies/:id/ledger-groups', (req, res) => {
    try {
      const groups = db.getLedgerGroups(parseInt(req.params.id));
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Voucher Endpoints ───────────────────────────────────────────────

  /**
   * GET /api/companies/:id/vouchers
   * List vouchers with filtering and pagination.
   */
  router.get('/companies/:id/vouchers', (req, res) => {
    try {
      const { search, dateFrom, dateTo, page, limit } = req.query;
      const result = db.getVouchers(parseInt(req.params.id), {
        search,
        dateFrom,
        dateTo,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Activity Endpoints ──────────────────────────────────────────────

  /**
   * GET /api/companies/:id/activity
   * List user activity.
   */
  router.get('/companies/:id/activity', (req, res) => {
    try {
      const { page, limit } = req.query;
      const result = db.getActivity(parseInt(req.params.id), {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Statistics ──────────────────────────────────────────────────────

  /**
   * GET /api/companies/:id/stats
   * Get comprehensive statistics.
   */
  router.get('/companies/:id/stats', (req, res) => {
    try {
      const stats = db.getStats(parseInt(req.params.id));
      if (!stats) return res.status(404).json({ error: 'Company not found' });
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Export ──────────────────────────────────────────────────────────

  /**
   * GET /api/companies/:id/export
   * Export ledger data as CSV.
   */
  router.get('/companies/:id/export', (req, res) => {
    try {
      const { search, group } = req.query;
      const data = db.exportLedgersCSV(parseInt(req.params.id), { search, group });

      if (data.length === 0) {
        return res.status(404).json({ error: 'No data to export' });
      }

      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map(row =>
          headers.map(h => {
            const val = row[h] == null ? '' : String(row[h]);
            // Escape commas and quotes
            return val.includes(',') || val.includes('"') || val.includes('\n')
              ? `"${val.replace(/"/g, '""')}"`
              : val;
          }).join(',')
        )
      ];

      const csv = csvRows.join('\r\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=ledgers-export-${Date.now()}.csv`);
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

module.exports = createApiRouter;
