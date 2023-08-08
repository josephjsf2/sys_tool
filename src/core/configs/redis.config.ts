export default (): any => ({
  redisUrl: process.env.REDIS_URL,
  redisPort: process.env.REDIS_PORT,
  redisDb: process.env.INDEX || 0,
  redisUser: process.env.REDIS_USER,
  redisPwd: process.env.REDIS_PED,
});
