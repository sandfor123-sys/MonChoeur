const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static assets
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const chantRoutes = require('./routes/chantRoutes');
const playlistRoutes = require('./routes/playlistRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/chants', chantRoutes);
app.use('/api/playlists', playlistRoutes);

app.get('/api', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API MonChoeur',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      chants: '/api/chants',
      playlists: '/api/playlists'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server if not running as a Vercel function
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
    console.log(`📍 API disponible sur http://localhost:${PORT}/api`);
    console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
