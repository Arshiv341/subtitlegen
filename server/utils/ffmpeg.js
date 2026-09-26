const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');

// Configure binary paths
if (ffmpegInstaller && ffmpegInstaller.path) {
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
}
if (ffprobeInstaller && ffprobeInstaller.path) {
  ffmpeg.setFfprobePath(ffprobeInstaller.path);
}

/**
 * Get media metadata using ffprobe
 * @param {string} filePath
 * @returns {Promise<{ duration: number, format: string, hasAudio: boolean }>}
 */
function getMediaMetadata(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(err);
      }
      const duration = metadata.format ? metadata.format.duration : 0;
      const hasAudio = (metadata.streams || []).some(
        (s) => s.codec_type === 'audio'
      );
      resolve({
        duration: duration ? parseFloat(duration) : 0,
        format: metadata.format ? metadata.format.format_name : 'unknown',
        hasAudio,
        streams: metadata.streams || [],
      });
    });
  });
}

/**
 * Extract audio from a video file using FFmpeg
 * Optimized for Speech-to-Text: 16kHz sample rate, mono channel, MP3 format
 * @param {string} videoPath
 * @param {string} audioOutputPath
 * @returns {Promise<{ audioPath: string, duration: number }>}
 */
function extractAudio(videoPath, audioOutputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .audioFrequency(16000)
      .audioChannels(1)
      .audioBitrate('64k')
      .output(audioOutputPath)
      .on('start', (cmd) => {
        console.log(`[FFmpeg] Started extraction: ${cmd}`);
      })
      .on('error', (err) => {
        console.error(`[FFmpeg] Error extracting audio:`, err);
        reject(err);
      })
      .on('end', async () => {
        console.log(`[FFmpeg] Audio extraction completed: ${audioOutputPath}`);
        try {
          const meta = await getMediaMetadata(audioOutputPath);
          resolve({ audioPath: audioOutputPath, duration: meta.duration });
        } catch (metaErr) {
          // If metadata fails on output, still return the path
          resolve({ audioPath: audioOutputPath, duration: 0 });
        }
      })
      .run();
  });
}

module.exports = {
  ffmpeg,
  getMediaMetadata,
  extractAudio,
  ffmpegPath: ffmpegInstaller.path,
  ffprobePath: ffprobeInstaller.path,
};
