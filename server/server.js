const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const { connectDB } = require('./config/database');
const { initializeStorage } = require('./services/storageService');
const transcriptionRoutes = require('./routes/transcriptionRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const { errorMiddleware, notFoundMiddleware } = require('./middleware/errorMiddleware');

const app = express();

// Ensure uploads directories exist
initializeStorage();

// CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded video and audio files statically
app.use('/uploads', express.static(config.uploadDir, {
  setHeaders: (res, filePath) => {
    res.setHeader('Accept-Ranges', 'bytes');
  },
}));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/transcriptions', transcriptionRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// Server startup
async function start() {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`[Server] VideoText backend running on http://localhost:${config.port}`);
    console.log(`[Server] Storage directory: ${config.uploadDir}`);
  });
}

start();
