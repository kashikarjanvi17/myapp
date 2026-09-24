/**
 * Catches any error passed to next(err) or thrown inside an async
 * route (via the asyncHandler wrapper below) and returns a consistent
 * JSON error shape instead of leaking a stack trace to the client.
 */
function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err);

  // MySQL duplicate-entry errors (e.g. duplicate student email)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'A record with these details already exists.' });
  }

  const status = err.status || 500;
  const message = err.message || 'Something went wrong on the server.';
  res.status(status).json({ success: false, message });
}

/** Wraps an async route handler so rejected promises reach errorHandler. */
function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

/** 404 handler for unmatched routes. */
function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found.` });
}

module.exports = { errorHandler, asyncHandler, notFound };
