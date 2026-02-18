/**
 * LAR University - Main Server Entry Point
 * AI-powered specialization recommender
 * 
 * Storage: In-memory (no DB yet)
 * TODO: Connect PostgreSQL when ready
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { errorHandler, notFound } = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/auth.routes');
const chatRoutes = require('./src/routes/chat.routes');
const cvRoutes = require('./src/routes/cv.routes');
const recommendationRoutes = require('./src/routes/recommendation.routes');
const userRoutes = require('./src/routes/user.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        message: 'Demasiadas solicitudes, por favor intenta más tarde.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'LAR University API is running 🚀',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        storage: 'in-memory (PostgreSQL pending)',
    });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/recommendations', recommendationRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║     LAR University Backend Server        ║
  ║     Port    : ${PORT}                       ║
  ║     Mode    : ${(process.env.NODE_ENV || 'development').padEnd(12)}          ║
  ║     Storage : In-Memory (no DB yet)      ║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = app;
