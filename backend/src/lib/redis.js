const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Log connection attempt (hiding password)
const safeUrl = redisUrl.replace(/:[^:@]+@/, ':****@');
console.log(`📡 Attempting to connect to Redis at: ${safeUrl}`);

const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        return Math.min(times * 200, 5000);
    }
});

redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err.message);
});

redis.on('connect', () => {
    console.log('✅ Connected to Redis successfully');
});

module.exports = redis;
