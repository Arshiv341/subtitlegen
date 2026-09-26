const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const { isMongoConnected } = require('../config/database');

// Mongoose Schema Definition
const segmentSchema = new mongoose.Schema(
  {
    start: { type: Number, required: true },
    end: { type: Number, required: true },
    text: { type: String, required: true },
  },
  { _id: false }
);

const transcriptionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    originalFileName: { type: String, required: true },
    videoPath: { type: String, required: true },
    videoUrl: { type: String },
    audioPath: { type: String },
    fileSize: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    processingStage: {
      type: String,
      enum: ['uploading', 'extracting_audio', 'transcribing', 'completed', 'failed'],
      default: 'uploading',
    },
    errorMessage: { type: String, default: null },
    language: { type: String, default: 'en' },
    provider: { type: String, default: 'mock' },
    transcript: [segmentSchema],
  },
  { timestamps: true }
);

// Normalize _id to id in JSON output
transcriptionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : ret.id;
    return ret;
  },
});

const MongoTranscription = mongoose.model('Transcription', transcriptionSchema);

// Local JSON File Fallback Implementation
const DATA_FILE = path.join(__dirname, '../data/transcriptions.json');

function readLocalData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf8');
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('[Fallback DB] Read error:', err.message);
    return [];
  }
}

function writeLocalData(data) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB] Write error:', err.message);
  }
}

// Unified Repository Object
const Transcription = {
  async create(data) {
    if (isMongoConnected()) {
      return await MongoTranscription.create(data);
    }
    const list = readLocalData();
    const newRecord = {
      id: uuidv4(),
      title: data.title || 'Untitled Video',
      originalFileName: data.originalFileName || '',
      videoPath: data.videoPath || '',
      videoUrl: data.videoUrl || '',
      audioPath: data.audioPath || '',
      fileSize: data.fileSize || 0,
      duration: data.duration || 0,
      status: data.status || 'processing',
      processingStage: data.processingStage || 'uploading',
      errorMessage: data.errorMessage || null,
      language: data.language || 'en',
      provider: data.provider || 'mock',
      transcript: data.transcript || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newRecord);
    writeLocalData(list);
    return newRecord;
  },

  async find(filter = {}, sort = { createdAt: -1 }) {
    if (isMongoConnected()) {
      return await MongoTranscription.find(filter).sort(sort).exec();
    }
    let list = readLocalData();
    // Default sort by createdAt descending
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  },

  async findById(id) {
    if (!id) return null;
    if (isMongoConnected()) {
      // Validate mongo ObjectId format if mongo is connected
      if (mongoose.Types.ObjectId.isValid(id)) {
        return await MongoTranscription.findById(id).exec();
      }
    }
    const list = readLocalData();
    return list.find((item) => item.id === id || item._id === id) || null;
  },

  async findByIdAndUpdate(id, updates, options = { new: true }) {
    if (!id) return null;
    if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
      return await MongoTranscription.findByIdAndUpdate(id, updates, options).exec();
    }
    const list = readLocalData();
    const index = list.findIndex((item) => item.id === id || item._id === id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeLocalData(list);
    return list[index];
  },

  async findByIdAndDelete(id) {
    if (!id) return null;
    if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
      return await MongoTranscription.findByIdAndDelete(id).exec();
    }
    const list = readLocalData();
    const index = list.findIndex((item) => item.id === id || item._id === id);
    if (index === -1) return null;
    const [deleted] = list.splice(index, 1);
    writeLocalData(list);
    return deleted;
  },
};

module.exports = Transcription;
