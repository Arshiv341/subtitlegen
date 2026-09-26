const BaseTranscriptionProvider = require('./baseProvider');
const { getMediaMetadata } = require('../utils/ffmpeg');

/**
 * Mock / Offline Provider
 * STRICTLY FOR LOCAL DEV AND TESTING WHEN NO API KEY IS CONFIGURED.
 * Not for production use.
 */
class MockTranscriptionProvider extends BaseTranscriptionProvider {
  constructor() {
    super('mock');
  }

  isConfigured() {
    return true;
  }

  async transcribe(audioPath, options = {}) {
    console.log('[MockProvider] Generating test transcript for development/offline mode...');
    
    // Simulate real network/inference latency
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let duration = options.duration;
    if (!duration || duration <= 0) {
      try {
        const meta = await getMediaMetadata(audioPath);
        duration = meta.duration || 30;
      } catch (e) {
        duration = 30;
      }
    }

    // Realistic demo sentences demonstrating timestamp sync, search, and editing
    const demoSentences = [
      'Welcome to this video presentation. Today we will explore modern web architecture.',
      'We will examine how audio extraction works with FFmpeg and speech recognition models.',
      'JavaScript and Node.js provide an asynchronous runtime suited for multimedia workloads.',
      'When audio is extracted, speech-to-text algorithms convert spoken acoustic frequencies into text tokens.',
      'Timestamps allow users to jump directly to relevant segments within the video player.',
      'You can search through these transcript segments, filter keywords, or edit transcript lines directly.',
      'Export options include plain text, SubRip subtitle format, PDF reports, and Microsoft Word documents.',
      'Thank you for watching this demonstration of the VideoText platform.',
    ];

    const segmentDuration = Math.max(3, duration / demoSentences.length);
    const segments = [];

    for (let i = 0; i < demoSentences.length; i++) {
      const start = parseFloat((i * segmentDuration).toFixed(2));
      const end = parseFloat(Math.min((i + 1) * segmentDuration, duration).toFixed(2));
      if (start >= duration) break;
      segments.push({
        start,
        end,
        text: demoSentences[i],
      });
    }

    return {
      text: segments.map((s) => s.text).join(' '),
      segments,
      language: 'en',
    };
  }
}

module.exports = MockTranscriptionProvider;
