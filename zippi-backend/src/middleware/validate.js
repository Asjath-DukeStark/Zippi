const { validationResult } = require('express-validator');
const { fail } = require('../utils/response');

/** Runs express-validator chains, returns 422 with field errors on failure. */
const validate = (chains) => [
  ...chains,
  (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return res.status(422).json({
      success: false,
      message: details[0]?.message || 'Validation failed',
      error: 'VALIDATION_ERROR',
      details
    });
  }
];

module.exports = validate;
