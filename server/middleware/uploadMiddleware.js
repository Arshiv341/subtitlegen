const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

// Safe storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.videosDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${uuidv4()}${ext}`;
    cb(null, safeName);
  },
});

// Allowed video extensions and mimetypes
const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];
const ALLOWED_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'video/x-matroska',
  'application/octet-stream', // sometimes sent by browsers for mov/avi
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext) || ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Unsupported video format. Please upload an MP4, MOV, AVI, or WEBM file.'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSizeMb * 1024 * 1024,
  },
});

module.exports = upload;
