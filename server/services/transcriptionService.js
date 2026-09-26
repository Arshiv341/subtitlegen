const config = require('../config/config');
const GroqWhisperProvider = require('../providers/groqWhisperProvider');
const OpenAiWhisperProvider = require('../providers/openAiWhisperProvider');
const GeminiTranscriptionProvider = require('../providers/geminiProvider');
const MockTranscriptionProvider = require('../providers/mockProvider');

class TranscriptionService {
  constructor() {
    this.currentProviderName = config.transcriptionProvider;
    this.geminiApiKey = config.geminiApiKey;
    this.groqApiKey = config.groqApiKey;
    this.openAiApiKey = config.openAiApiKey;
  }

  getProvider(providerName = null) {
    const selected = (providerName || this.currentProviderName || 'gemini').toLowerCase();

    if (selected === 'gemini' || selected === 'google' || selected === 'whisper-gemini') {
      return new GeminiTranscriptionProvider(this.geminiApiKey);
    }
    if (selected === 'whisper-groq' || selected === 'groq') {
      return new GroqWhisperProvider(this.groqApiKey);
    }
    if (selected === 'whisper-openai' || selected === 'openai') {
      return new OpenAiWhisperProvider(this.openAiApiKey);
    }
    return new MockTranscriptionProvider();
  }

  async transcribeAudio(audioPath, options = {}) {
    const provider = this.getProvider(options.provider);
    console.log('[TranscriptionService] Transcribing audio with provider: ' + provider.name);
    return await provider.transcribe(audioPath, options);
  }

  getActiveProviderInfo() {
    const provider = this.getProvider();
    return {
      provider: this.currentProviderName,
      isConfigured: provider.isConfigured(),
    };
  }
}

const transcriptionServiceInstance = new TranscriptionService();

module.exports = transcriptionServiceInstance;
