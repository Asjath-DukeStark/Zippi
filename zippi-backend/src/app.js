const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const apiRouter = require('./routes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.corsOrigins }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
if (env.nodeEnv !== 'test') app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/', (req, res) =>
  res.json({ success: true, message: 'Zippi API is running', version: '2.0.0', timestamp: new Date().toISOString() })
);
app.get('/health', (req, res) => res.json({ success: true, status: 'healthy' }));

app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
