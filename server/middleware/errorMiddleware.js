/**
 * Centralized error-handling middleware
 */
function errorMiddleware(err, req, res, next) {
  console.error('[ErrorMiddleware] Captured error:', err);

  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let userMessage = 'An unexpected error occurred while processing your request.';

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    userMessage = 'The uploaded file is too large. Please upload a smaller video.';
  } else if (err.message && err.message.includes('Unsupported video format')) {
    statusCode = 400;
    userMessage = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    userMessage = 'Invalid data provided.';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    userMessage = 'Resource not found or invalid identifier format.';
  } else if (err.message && !err.message.includes('ENOENT') && !err.message.includes('connect')) {
    // Clean domain error message
    userMessage = err.message;
  }

  res.status(statusCode).json({
    success: false,
    error: userMessage,
  });
}

function notFoundMiddleware(req, res) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = {
  errorMiddleware,
  notFoundMiddleware,
};
