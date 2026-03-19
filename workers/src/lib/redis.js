const IORedis = require("ioredis");

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

console.log(`📡 Workers connecting to Redis: ${redisUrl.replace(/:[^:@]+@/, ':****@')}`);

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null
});

connection.on('error', (err) => {
  console.error('❌ Workers Redis Error:', err.message);
});

connection.on('connect', () => {
  console.log('✅ Workers connected to Redis');
});

module.exports = connection;