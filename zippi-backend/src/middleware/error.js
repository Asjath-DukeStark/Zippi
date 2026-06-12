const { fail } = require('../utils/response');

const notFound = (req, res) =>
  fail(res, `API route not found: ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error('[error]', err);
  return fail(
    res,
    err.message,
    status,
    err.code || (status >= 500 ? 'INTERNAL_ERROR' : undefined)
  );
};

module.exports = { notFound, errorHandler };
