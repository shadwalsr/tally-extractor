const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const DatabaseManager = require('./db/database');
const createApiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database instance
const db = new DatabaseManager();

// API routes
app.use('/api', createApiRouter(db));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static assets if built
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      name: 'Tally Prime EditLog Extractor API',
      status: 'running',
      endpoints: [
        'GET /api/companies',
        'POST /api/upload',
        'POST /api/parse-local',
        'GET /api/companies/:id/stats',
        'GET /api/companies/:id/ledgers'
      ]
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[App Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Server] Tally Prime Extractor API listening on http://localhost:${PORT}`);
  });
}

module.exports = { app, db };
