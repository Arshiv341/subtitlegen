const fs = require('fs');
const path = require('path');
const config = require('../config/config');

/**
 * Ensure all upload directories exist
 */
function initializeStorage() {
  [config.uploadDir, config.videosDir, config.audioDir, config.exportsDir].forEach(
    (dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  );
}

/**
 * Safely delete a file if it exists
 * @param {string} filePath
 */
function deleteFileSafe(filePath) {
  if (!filePath) return;
  try {
    const fullPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(config.uploadDir, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`[Storage] Deleted: ${fullPath}`);
    }
  } catch (err) {
    console.warn(`[Storage] Failed to delete ${filePath}:`, err.message);
  }
}

module.exports = {
  initializeStorage,
  deleteFileSafe,
};
