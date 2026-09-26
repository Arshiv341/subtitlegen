const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const ROOT_DIR = path.resolve(__dirname, '../..');
const UPLOAD_BASE = process.env.UPLOAD_DIR
  ? path.resolve(ROOT_DIR, process.env.UPLOAD_DIR)
  : path.resolve(ROOT_DIR, 'uploads');

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/videotext',
  transcriptionProvider: process.env.TRANSCRIPTION_PROVIDER || 'gemini',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  uploadDir: UPLOAD_BASE,
  videosDir: path.join(UPLOAD_BASE, 'videos'),
  audioDir: path.join(UPLOAD_BASE, 'audio'),
  exportsDir: path.join(UPLOAD_BASE, 'exports'),
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 500,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
