require('dotenv').config();

const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'JWT_SECRET'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`[env] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}
const rawCors = process.env.CORS_ORIGINS;
const corsOrigins = !rawCors || rawCors === '*'
  ? '*'
  : rawCors.split(',').map((o) => o.trim().replace(/\/$/, ''));

module.exports = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL?.trim(),
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY?.trim(),
  jwtSecret: process.env.JWT_SECRET?.trim(),
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '7d').trim(),
  storageBucket: (process.env.STORAGE_BUCKET || 'zippi-uploads').trim(),
  corsOrigins
};
