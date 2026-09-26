const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const BaseTranscriptionProvider = require('./baseProvider');

class GroqWhisperProvider extends BaseTranscriptionProvider {
  constructor(apiKey) {
    super('whisper-groq');
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.groq.com/openai/v1/audio/transcriptions';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async transcribe(audioPath, options = {}) {
    if (!this.isConfigured()) {
      throw new Error(
        'Groq Whisper provider is not configured. Please set GROQ_API_KEY in server/.env or configure it in Settings.'
      );
    }

    if (!fs.existsSync(audioPath)) {
      throw new Error(`Audio file not found at ${audioPath}`);
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(audioPath));
    form.append('model', options.model || 'whisper-large-v3');
    form.append('response_format', 'verbose_json');
    if (options.language) {
      form.append('language', options.language);
    }
    if (options.prompt) {
      form.append('prompt', options.prompt);
    }

    try {
      console.log('[GroqWhisper] Sending audio to Groq Whisper API...');
      const response = await axios.post(this.apiUrl, form, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          ...form.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 180000, // 3 minutes timeout for long files
      });

      const data = response.data;
      const rawSegments = data.segments || [];

      // Normalize segments to { start, end, text }
      const segments = rawSegments.map((seg) => ({
        start: parseFloat(seg.start.toFixed(2)),
        end: parseFloat(seg.end.toFixed(2)),
        text: (seg.text || '').trim(),
      }));

      // If no segments returned but full text exists, create single segment
      if (segments.length === 0 && data.text) {
        segments.push({
          start: 0,
          end: options.duration || 10,
          text: data.text.trim(),
        });
      }

      return {
        text: data.text || '',
        segments,
        language: data.language || 'en',
      };
    } catch (err) {
      const errMsg =
        err.response?.data?.error?.message || err.message || 'Groq transcription failed';
      console.error('[GroqWhisper] Error:', errMsg);
      throw new Error(`Groq Whisper Error: ${errMsg}`);
    }
  }
}

module.exports = GroqWhisperProvider;
