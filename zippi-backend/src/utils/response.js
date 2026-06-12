/**
 * Standard API envelope helpers + snake_case → camelCase conversion,
 * so all clients (web, admin, rider, mobile) receive camelCase JSON.
 */
const toCamel = (s) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

const camelize = (value) => {
  if (Array.isArray(value)) return value.map(camelize);
  if (value && typeof value === 'object' && value.constructor === Object) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [toCamel(k), camelize(v)]));
  }
  return value;
};

const ok = (res, data, status = 200, extra = {}) =>
  res.status(status).json({ success: true, data: camelize(data), ...extra });

const fail = (res, message, status = 400, error = undefined) =>
  res.status(status).json({ success: false, message, ...(error ? { error } : {}) });

class ApiError extends Error {
  constructor(message, status = 400, code = undefined) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

module.exports = { ok, fail, camelize, ApiError };
