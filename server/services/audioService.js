const path = require('path');
const config = require('../config/config');
const { extractAudio, getMediaMetadata } = require('../utils/ffmpeg');

/**
 * Audio extraction service using FFmpeg
 */
class AudioService {
  /**
   * Extract audio from video to a standardized 16kHz mono MP3
   * @param {string} videoPath
   * @param {string} id
   * @returns {Promise<{ audioPath: string, duration: number }>}
   */
  async extractFromVideo(videoPath, id) {
    const audioFileName = `${id}.mp3`;
    const audioOutputPath = path.join(config.audioDir, audioFileName);

    console.log(`[AudioService] Extracting audio: ${videoPath} -> ${audioOutputPath}`);
    const result = await extractAudio(videoPath, audioOutputPath);
    return {
      audioPath: result.audioPath,
      duration: result.duration,
    };
  }

  /**
   * Probe video metadata
   * @param {string} videoPath
   */
  async getVideoMetadata(videoPath) {
    return await getMediaMetadata(videoPath);
  }
}

module.exports = new AudioService();
