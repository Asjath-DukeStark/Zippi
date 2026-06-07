const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred';
  const errorCode = err.code || 'INTERNAL_ERROR';

  res.status(statusCode).json({
    success: false,
    message: message,
    error: errorCode
  });
};

module.exports = errorHandler;
