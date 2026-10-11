const { createClient } = require('redis');

let redisClient = null;
let isConnected = false;

const initRedis = async () => {
  if (!process.env.REDIS_URI && (process.env.NODE_ENV === 'production' || process.env.VERCEL)) {
    // Redis is optional. Skip in production/cloud if no dedicated REDIS_URI is provided
    isConnected = false;
    redisClient = null;
    return;
  }

  const redisUri = process.env.REDIS_URI || 'redis://localhost:6379';

  try {
    redisClient = createClient({
      url: redisUri,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            // Stop retrying after 3 attempts in standalone local dev
            return false;
          }
          return 1000;
        },
      },
    });

    redisClient.on('connect', () => {
      isConnected = true;
      console.log('⚡ Redis Cache Connected successfully');
    });

    redisClient.on('error', (err) => {
      // Graceful error logging without crashing backend
      if (isConnected) {
        console.warn('⚠️  Redis Cache Error:', err.message);
      }
      isConnected = false;
    });

    await redisClient.connect().catch(() => {
      // Redis is optional; if it's not active locally, continue seamlessly
      isConnected = false;
    });
  } catch (error) {
    isConnected = false;
  }
};

const getCache = async (key) => {
  if (!isConnected || !redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const setCache = async (key, value, ttlSeconds = 60) => {
  if (!isConnected || !redisClient) return false;
  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

const clearCachePattern = async (pattern = 'events:*') => {
  if (!isConnected || !redisClient) return false;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  initRedis,
  getCache,
  setCache,
  clearCachePattern,
  isRedisConnected: () => isConnected,
};
