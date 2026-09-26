const path = require('path');
const fs = require('fs');
const Transcription = require('../models/Transcription');
const audioService = require('../services/audioService');
const transcriptionService = require('../services/transcriptionService');
const exportService = require('../services/exportService');
const storageService = require('../services/storageService');
const config = require('../config/config');

/**
 * Upload video endpoint
 * POST /api/transcriptions
 */
async function uploadVideo(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please select a video file to upload.',
      });
    }

    const originalName = req.file.originalname;
    const baseTitle = path.parse(originalName).name.replace(/[-_]/g, ' ');
    const title = baseTitle.charAt(0).toUpperCase() + baseTitle.slice(1);
    const videoFileName = req.file.filename;
    const videoPath = req.file.path;
    const videoUrl = `/uploads/videos/${videoFileName}`;

    // Probe duration
    let duration = 0;
    try {
      const meta = await audioService.getVideoMetadata(videoPath);
      duration = Math.round(meta.duration || 0);
    } catch (metaErr) {
      console.warn('[Upload] Could not probe video duration:', metaErr.message);
    }

    const providerInfo = transcriptionService.getActiveProviderInfo();

    const record = await Transcription.create({
      title,
      originalFileName: originalName,
      videoPath,
      videoUrl,
      fileSize: req.file.size,
      duration,
      status: 'processing',
      processingStage: 'uploading',
      provider: providerInfo.provider,
      transcript: [],
    });

    const responseRecord = record.toJSON ? record.toJSON() : record;
    res.status(201).json({
      success: true,
      data: responseRecord,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Execute transcription pipeline
 * POST /api/transcriptions/:id/transcribe
 */
async function transcribe(req, res, next) {
  const { id } = req.params;

  try {
    const item = await Transcription.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Transcription job not found.',
      });
    }

    // Immediate response or start pipeline
    res.status(200).json({
      success: true,
      message: 'Transcription process started.',
      data: { id, status: 'processing', processingStage: 'extracting_audio' },
    });

    // Run processing pipeline asynchronously
    (async () => {
      try {
        console.log(`[Pipeline] Starting job ${id}...`);

        // Stage 1: Extract Audio
        await Transcription.findByIdAndUpdate(id, {
          status: 'processing',
          processingStage: 'extracting_audio',
        });

        const { audioPath, duration } = await audioService.extractFromVideo(
          item.videoPath,
          id
        );

        const finalDuration = duration || item.duration || 0;

        // Stage 2: Transcribe Speech
        await Transcription.findByIdAndUpdate(id, {
          audioPath,
          duration: Math.round(finalDuration),
          processingStage: 'transcribing',
        });

        const activeProvider = transcriptionService.getProvider();
        const transcriptionResult = await transcriptionService.transcribeAudio(
          audioPath,
          {
            duration: finalDuration,
            provider: item.provider,
          }
        );

        // Stage 3: Complete
        await Transcription.findByIdAndUpdate(id, {
          status: 'completed',
          processingStage: 'completed',
          language: transcriptionResult.language || 'en',
          transcript: transcriptionResult.segments || [],
          errorMessage: null,
        });

        console.log(`[Pipeline] Job ${id} completed successfully with ${transcriptionResult.segments?.length || 0} segments.`);
      } catch (pipelineErr) {
        console.error(`[Pipeline] Job ${id} failed:`, pipelineErr);
        let userMessage = 'We could not transcribe this video. Please try again.';
        if (pipelineErr.message && pipelineErr.message.includes('not configured')) {
          userMessage = pipelineErr.message;
        } else if (pipelineErr.message && pipelineErr.message.includes('Groq Whisper Error')) {
          userMessage = pipelineErr.message;
        } else if (pipelineErr.message && pipelineErr.message.includes('OpenAI Whisper Error')) {
          userMessage = pipelineErr.message;
        } else if (pipelineErr.message && pipelineErr.message.includes('Gemini Transcription Error')) {
          userMessage = pipelineErr.message;
        }

        await Transcription.findByIdAndUpdate(id, {
          status: 'failed',
          processingStage: 'failed',
          errorMessage: userMessage,
        });
      }
    })();
  } catch (err) {
    next(err);
  }
}

/**
 * Get all transcriptions
 * GET /api/transcriptions
 */
async function getAll(req, res, next) {
  try {
    const list = await Transcription.find({}, { createdAt: -1 });
    const formatted = list.map((item) => (item.toJSON ? item.toJSON() : item));
    res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single transcription
 * GET /api/transcriptions/:id
 */
async function getById(req, res, next) {
  try {
    const item = await Transcription.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Transcription not found.',
      });
    }
    const data = item.toJSON ? item.toJSON() : item;
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update transcription (title or segments)
 * PATCH /api/transcriptions/:id
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { title, transcript } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (transcript !== undefined) updates.transcript = transcript;

    const updated = await Transcription.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Transcription not found.',
      });
    }

    const data = updated.toJSON ? updated.toJSON() : updated;
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete transcription
 * DELETE /api/transcriptions/:id
 */
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const item = await Transcription.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Transcription not found.',
      });
    }

    // Clean up files
    if (item.videoPath) storageService.deleteFileSafe(item.videoPath);
    if (item.audioPath) storageService.deleteFileSafe(item.audioPath);

    await Transcription.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Transcription deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Export transcript in various formats
 * GET /api/transcriptions/:id/export?format=txt|srt|pdf|docx
 */
async function exportTranscript(req, res, next) {
  try {
    const { id } = req.params;
    const format = (req.query.format || 'txt').toLowerCase();

    const item = await Transcription.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Transcription not found.',
      });
    }

    const baseName = (item.title || 'transcript').replace(/[^a-zA-Z0-9_-]/g, '_');

    if (format === 'txt') {
      const content = exportService.generateTxt(item);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${baseName}.txt"`);
      return res.send(content);
    }

    if (format === 'srt') {
      const content = exportService.generateSrt(item);
      res.setHeader('Content-Type', 'application/x-subrip; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${baseName}.srt"`);
      return res.send(content);
    }

    if (format === 'pdf') {
      const pdfBuffer = await exportService.generatePdf(item);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${baseName}.pdf"`);
      return res.send(pdfBuffer);
    }

    if (format === 'docx') {
      const docxBuffer = await exportService.generateDocx(item);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${baseName}.docx"`);
      return res.send(docxBuffer);
    }

    return res.status(400).json({
      success: false,
      error: `Unsupported format: ${format}. Allowed: txt, srt, pdf, docx.`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadVideo,
  transcribe,
  getAll,
  getById,
  update,
  remove,
  exportTranscript,
};
