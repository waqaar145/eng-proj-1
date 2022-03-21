module.exports = {
  SERVER_URL: process.env.SERVER_URL,
  PORT: process.env.PORT,
  SECRET_KEY: process.env.SECRET_KEY,
  COOKIE_NAME: process.env.COOKIE_NAME,
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || 6379
}