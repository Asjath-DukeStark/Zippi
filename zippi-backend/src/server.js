const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const apiRouter = require('./routes');
const errorHandler = require('./middleware/error');
const casingMiddleware = require('./middleware/casing');

const app = express();
const PORT = process.env.PORT || 3001;

// Global Middleware Config
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(casingMiddleware);
app.use(morgan('dev'));

// Mount routes
app.use('/api', apiRouter);

// Base Route Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Zippi Grocery Delivery API Server is active',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Handle 404 routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.url}`,
    error: 'ROUTE_NOT_FOUND'
  });
});

// Bind Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log('==================================================');
  console.log(`💚 Zippi Grocery Delivery Backend running on port ${PORT}`);
  console.log(`   Local Address: http://localhost:${PORT}`);
  console.log('==================================================');
});

module.exports = app;
