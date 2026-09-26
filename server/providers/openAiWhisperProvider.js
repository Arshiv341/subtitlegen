const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const BaseTranscriptionProvider = require('./baseProvider');

class OpenAiWhisperProvider extends BaseTranscriptionProvider {
  constructor(apiKey) {
    super('whisper-openai');
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.openai.com/v1/audio/transcriptions';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async transcribe(audioPath, options = {}) {
    if (!this.isConfigured()) {
      throw new Error(
        'OpenAI Whisper provider is not configured. Please set OPENAI_API_KEY in server/.env or configure it in Settings.'
      );
    }

    if (!fs.existsSync(audioPath)) {
      throw new Error(`Audio file not found at ${audioPath}`);
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(audioPath));
    form.append('model', options.model || 'whisper-1');
    form.append('response_format', 'verbose_json');
    if (options.language) {
      form.append('language', options.language);
    }

    try {
      console.log('[OpenAiWhisper] Sending audio to OpenAI Whisper API...');
      const response = await axios.post(this.apiUrl, form, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          ...form.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 180000,
      });

      const data = response.data;
      const rawSegments = data.segments || [];

      const segments = rawSegments.map((seg) => ({
        start: parseFloat(seg.start.toFixed(2)),
        end: parseFloat(seg.end.toFixed(2)),
        text: (seg.text || '').trim(),
      }));

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
        err.response?.data?.error?.message || err.message || 'OpenAI transcription failed';
      console.error('[OpenAiWhisper] Error:', errMsg);
      throw new Error(`OpenAI Whisper Error: ${errMsg}`);
    }
  }
}

module.exports = OpenAiWhisperProvider;
