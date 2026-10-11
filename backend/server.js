const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { initRedis, isRedisConnected } = require('./config/redis');

// Load environment variables
dotenv.config();

const app = express();

// Connect to Databases & Cache
connectDB();
initRedis();

// Global Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or vercel preview/prod deployments
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      process.env.NODE_ENV !== 'production' ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure Database is connected before executing API routes
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/events') || req.path.startsWith('/auth')) {
    try {
      await connectDB();
    } catch (err) {
      console.warn('DB connection check:', err.message);
    }
  }
  next();
});

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 40, // 40 requests per 15 minutes for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes',
  },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/request-otp', authLimiter);
app.use('/api/auth/send-otp', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);
app.use('/api/auth/check-email', authLimiter);
app.use('/api/auth/refresh', authLimiter);

// Request Logger (Lightweight)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// API Routes
app.use(['/api/auth', '/auth'], require('./routes/auth'));
app.use(['/api/admin', '/admin'], require('./routes/admin'));
app.use(['/api/user', '/user'], require('./routes/user'));
app.use(['/api/events', '/events'], require('./routes/events'));
app.use(['/api/registrations', '/registrations'], require('./routes/registrations'));
app.use(['/api/reminders', '/reminders'], require('./routes/reminders'));

const path = require('path');
const fs = require('fs');

// Root & Healthcheck Endpoints
app.get(['/api/health', '/health'], (req, res) => {
  const mongoose = require('mongoose');
  const isDbConnected = mongoose.connection && mongoose.connection.readyState === 1;
  res.json({
    status: isDbConnected ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: isDbConnected ? 'connected' : `disconnected (readyState: ${mongoose.connection ? mongoose.connection.readyState : 0})`,
      mongoUriConfigured: Boolean(process.env.MONGODB_URI),
      rateLimiter: 'active',
      qrGenerator: 'active',
      backgroundJobs: 'active',
      redisCache: isRedisConnected() ? 'connected' : 'ready (in-memory fallback)',
    },
  });
});

// Serve Frontend Static Build if available (Single-Agency Deployment on Render)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath, { maxAge: '1d' }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      name: 'GDG RBU EventHub API',
      version: '1.0.0',
      status: 'online',
      description: 'Event Management & Registration API for Google Developer Group on Campus - Ramdeobaba University',
      documentation: '/api/health',
    });
  });
}

// 404 Route Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;
let server;

if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`
🚀 ====================================================
   GDG RBU EventHub API Server
   Running on: http://localhost:${PORT}
   Mode:       ${process.env.NODE_ENV || 'development'}
   Health:     http://localhost:${PORT}/api/health
==================================================== ⚡
    `);
  });

  // Friendly message when the port is already taken by a stale/orphaned process
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use.`);
      console.error(
        `   A previous \`npm run dev\` instance is probably still running.\n` +
          `   Find and stop it, then start again:\n\n` +
          `   Windows:  netstat -ano | findstr :${PORT}   then   taskkill /PID <pid> /T /F\n` +
          `   macOS:    lsof -ti tcp:${PORT} | xargs kill -9\n` +
          `   Linux:    fuser -k ${PORT}/tcp\n`
      );
      process.exit(1);
    }
    throw err;
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
}

module.exports = app;
