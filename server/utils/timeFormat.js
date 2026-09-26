/**
 * Utility functions for formatting and parsing timestamps
 */

/**
 * Format seconds to HH:MM:SS or MM:SS
 * @param {number} totalSeconds
 * @param {boolean} includeHours
 * @returns {string}
 */
function formatSeconds(totalSeconds, includeHours = true) {
  if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (num) => String(num).padStart(2, '0');

  if (includeHours || hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format seconds to SRT timestamp: 00:00:02,000
 * @param {number} totalSeconds
 * @returns {string}
 */
function formatSrtTimestamp(totalSeconds) {
  if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.floor((totalSeconds % 1) * 1000);

  const pad = (num, size = 2) => String(num).padStart(size, '0');

  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)},${pad(milliseconds, 3)}`;
}

/**
 * Parse string timestamp "00:01:24" or "01:24" to seconds
 * @param {string} str
 * @returns {number}
 */
function parseTimestamp(str) {
  if (!str) return 0;
  const parts = str.split(':').map((p) => parseFloat(p));
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parseFloat(str) || 0;
}

module.exports = {
  formatSeconds,
  formatSrtTimestamp,
  parseTimestamp,
};
