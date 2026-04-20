module.exports = {
  secret: process.env.JWT_SECRET || 'fallback-dev-secret',
  expiry: process.env.JWT_EXPIRY || '8h',
};
