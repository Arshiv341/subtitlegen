/**
 * Base abstract provider interface
 */
class BaseTranscriptionProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * @param {string} audioPath
   * @param {object} options
   * @returns {Promise<{ text: string, segments: Array<{ start: number, end: number, text: string }>, language: string }>}
   */
  async transcribe(audioPath, options = {}) {
    throw new Error(`transcribe() must be implemented by ${this.name} provider`);
  }

  /**
   * Check if provider is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    return true;
  }
}

module.exports = BaseTranscriptionProvider;
