const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const leadRoutes = require('./routes/leads');
const contactRoutes = require('./routes/contacts');
const propertyRoutes = require('./routes/properties');
const dealRoutes = require('./routes/deals');
const taskRoutes = require('./routes/tasks');
const activityRoutes = require('./routes/activities');
const documentRoutes = require('./routes/documents');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global process error logging to surface hidden failures
process.on('unhandledRejection', (reason, promise) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('Uncaught Exception thrown:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/documents', documentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS origin allowed: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});