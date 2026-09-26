const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const transcriptionController = require('../controllers/transcriptionController');

// Upload video
router.post('/', upload.single('video'), transcriptionController.uploadVideo);

// Start transcription pipeline
router.post('/:id/transcribe', transcriptionController.transcribe);

// List all transcriptions
router.get('/', transcriptionController.getAll);

// Get single transcription
router.get('/:id', transcriptionController.getById);

// Update title or segments
router.patch('/:id', transcriptionController.update);

// Delete transcription
router.delete('/:id', transcriptionController.remove);

// Export file
router.get('/:id/export', transcriptionController.exportTranscript);

module.exports = router;
