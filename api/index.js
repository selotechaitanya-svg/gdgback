const app = require('../backend/server');
const connectDB = require('../backend/config/db');

// Vercel Serverless Function entry point
module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('MongoDB connection error on serverless request:', err.message);
  }
  return app(req, res);
};
