const transcriptionService = require('../services/transcriptionService');
const { ffmpegPath } = require('../utils/ffmpeg');
const config = require('../config/config');
const fs = require('fs');

async function getSettings(req, res, next) {
  try {
    const providerInfo = transcriptionService.getActiveProviderInfo();
    res.json({
      success: true,
      data: {
        provider: providerInfo.provider,
        providerName: 'Google Gemini (gemini-3.5-transcribe)',
        configured: providerInfo.isConfigured,
        ffmpeg: Boolean(ffmpegPath && fs.existsSync(ffmpegPath)),
        language: 'Auto Detect (English, Hindi, Hinglish, Multilingual)',
        maxFileSizeMb: config.maxFileSizeMb,
        storageType: 'Local Storage',
      },
    });
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  res.json({
    success: true,
    message: 'Application settings are configured via server environment variables.',
  });
}

module.exports = {
  getSettings,
  updateSettings,
};
