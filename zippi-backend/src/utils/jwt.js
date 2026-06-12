const jwt = require('jsonwebtoken');
const env = require('../config/env');

const cleanSecret = typeof env.jwtSecret === 'string' ? env.jwtSecret.replace(/['"]/g, '').trim() : env.jwtSecret;
const cleanExpires = typeof env.jwtExpiresIn === 'string' ? env.jwtExpiresIn.replace(/['"]/g, '').trim() : env.jwtExpiresIn;

const sign = (user) =>
  jwt.sign({ sub: user.id, role: user.role, name: user.name }, cleanSecret, {
    expiresIn: Number(cleanExpires) || cleanExpires
  });

const verify = (token) => jwt.verify(token, cleanSecret);

module.exports = { sign, verify };
