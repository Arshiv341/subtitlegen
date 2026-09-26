const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');
const BaseTranscriptionProvider = require('./baseProvider');
const { getMediaMetadata } = require('../utils/ffmpeg');

class GeminiTranscriptionProvider extends BaseTranscriptionProvider {
  constructor(apiKey) {
    super('gemini');
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.model = 'gemini-3.5-transcribe';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Helper to parse time offset string ("3.45s", "00:00:03.450", or number) to seconds
   */
  parseOffset(offset) {
    if (typeof offset === 'number') return offset;
    if (!offset) return 0;
    const str = String(offset).trim();
    if (str.endsWith('s')) {
      return parseFloat(str.slice(0, -1)) || 0;
    }
    if (str.includes(':')) {
      const parts = str.split(':').map(Number);
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
    }
    return parseFloat(str) || 0;
  }

  /**
   * Extract words with timestamps from interaction object
   */
  extractWords(interaction) {
    const words = [];

    const inspectItems = (items) => {
      if (!Array.isArray(items)) return;
      for (const item of items) {
        if (!item) continue;
        if (item.type === 'word_info' || item.word || (item.text && (item.start_offset || item.startOffset))) {
          const text = item.text || item.word;
          const start = this.parseOffset(item.start_offset || item.startOffset || 0);
          const end = this.parseOffset(item.end_offset || item.endOffset || start + 0.5);
          if (text) {
            words.push({ text: text.trim(), start, end });
          }
        }
        if (item.words) inspectItems(item.words);
        if (item.annotations) inspectItems(item.annotations);
        if (item.content) inspectItems(item.content);
        if (item.parts) inspectItems(item.parts);
        if (item.steps) inspectItems(item.steps);
      }
    };

    if (interaction.words) inspectItems(interaction.words);
    if (interaction.steps) inspectItems(interaction.steps);
    if (interaction.outputs) inspectItems(interaction.outputs);
    if (interaction.annotations) inspectItems(interaction.annotations);

    return words;
  }

  /**
   * Group word-level timestamps into readable sentence segments
   */
  groupWordsIntoSegments(words, fallbackText = '') {
    if (!words || words.length === 0) {
      return [];
    }

    const segments = [];
    let currentWords = [];
    let segmentStart = words[0].start;

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      currentWords.push(w.text);

      const isLastWord = i === words.length - 1;
      const endsWithPunct = /[.?!।|]$/.test(w.text);
      const longPause = !isLastWord && (words[i + 1].start - w.end > 1.2);
      const isLongEnough = currentWords.length >= 8;

      if (endsWithPunct || longPause || isLongEnough || isLastWord) {
        segments.push({
          start: parseFloat(segmentStart.toFixed(2)),
          end: parseFloat(w.end.toFixed(2)),
          text: currentWords.join(' ').trim(),
        });
        currentWords = [];
        if (!isLastWord) {
          segmentStart = words[i + 1].start;
        }
      }
    }

    return segments;
  }

  /**
   * Split plain text into natural segments if word timestamps were unavailable
   */
  splitTextIntoSegments(fullText, totalDuration) {
    if (!fullText || !fullText.trim()) return [];

    const rawSentences = fullText
      .split(/(?<=[.?!।|\n])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (rawSentences.length === 0) {
      return [{ start: 0, end: totalDuration || 10, text: fullText.trim() }];
    }

    const duration = totalDuration && totalDuration > 0 ? totalDuration : rawSentences.length * 4;
    const totalChars = fullText.length;
    let currentOffset = 0;
    const segments = [];

    for (let i = 0; i < rawSentences.length; i++) {
      const sentence = rawSentences[i];
      const start = parseFloat(((currentOffset / totalChars) * duration).toFixed(2));
      currentOffset += sentence.length;
      const end = parseFloat(
        Math.min(duration, ((currentOffset / totalChars) * duration)).toFixed(2)
      );

      segments.push({
        start,
        end: end > start ? end : parseFloat((start + 2).toFixed(2)),
        text: sentence,
      });
    }

    return segments;
  }

  async transcribe(audioPath, options = {}) {
    if (!this.isConfigured()) {
      throw new Error(
        'Speech-to-text provider is not configured. Please set GEMINI_API_KEY in server/.env or configure it in Settings.'
      );
    }

    if (!fs.existsSync(audioPath)) {
      throw new Error('Audio file not found at ' + audioPath);
    }

    console.log('[GeminiProvider] Initializing GoogleGenAI client with model:', this.model);
    const client = new GoogleGenAI({
      apiKey: this.apiKey,
    });

    let uploadedFile = null;

    try {
      // 1. Upload audio using Google Files API
      console.log('[GeminiProvider] Uploading audio...');
      uploadedFile = await client.files.upload({
        file: audioPath,
        config: {
          mimeType: 'audio/mp3',
        },
      });
      console.log('[GeminiProvider] Audio uploaded successfully:', uploadedFile.uri || uploadedFile.name);

      // 2. Transcribe speech using dedicated gemini-3.5-transcribe model
      console.log('[GeminiProvider] Starting transcription...');
      
      const interactionParams = {
        model: this.model,
        input: [
          {
            type: 'audio',
            uri: uploadedFile.uri,
            mime_type: uploadedFile.mimeType || 'audio/mp3',
          },
        ],
        generation_config: {
          transcription_config: {
            mode: 'verbatim',
            timestamp_granularities: ['word'],
          },
        },
      };

      const interaction = await client.interactions.create(interactionParams);
      console.log('[GeminiProvider] Transcription completed');

      // 3. Extract text
      let fullText = (interaction.output_text || '').trim();

      if (!fullText && interaction.outputs && interaction.outputs.length > 0) {
        fullText = interaction.outputs
          .map((o) => o.text || (o.content && o.content.map((c) => c.text).join(' ')) || '')
          .join(' ')
          .trim();
      }

      // 4. Extract word timestamps and build segments
      const words = this.extractWords(interaction);
      let segments = [];

      if (words.length > 0) {
        console.log('[GeminiProvider] Found ' + words.length + ' word-level timestamps. Grouping into segments...');
        segments = this.groupWordsIntoSegments(words, fullText);
      } else {
        console.log('[GeminiProvider] Word timestamps not present. Segmenting full text across audio duration...');
        let duration = options.duration;
        if (!duration || duration <= 0) {
          try {
            const meta = await getMediaMetadata(audioPath);
            duration = meta.duration || 30;
          } catch (e) {
            duration = 30;
          }
        }
        segments = this.splitTextIntoSegments(fullText, duration);
      }

      if (segments.length === 0 && fullText) {
        segments.push({
          start: 0,
          end: options.duration || 10,
          text: fullText,
        });
      }

      return {
        text: fullText || segments.map((s) => s.text).join(' '),
        segments,
        language: 'auto',
      };
    } catch (err) {
      const errMsg = err.message || 'Gemini transcription failed';
      console.error('[GeminiProvider] Error:', errMsg);
      throw new Error('Gemini Transcription Error: ' + errMsg);
    } finally {
      if (uploadedFile && uploadedFile.name) {
        try {
          await client.files.delete({ name: uploadedFile.name });
          console.log('[GeminiProvider] Cleaned up remote file:', uploadedFile.name);
        } catch (cleanErr) {
          // Non-blocking cleanup error
        }
      }
    }
  }
}

module.exports = GeminiTranscriptionProvider;
