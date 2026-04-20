require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  },
  migrations: {
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
  pool: {
    min: 2,
    max: isProduction ? 10 : 30,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    propagateCreateError: false,
    afterCreate: (conn, done) => {
      conn.query('SET statement_timeout = 30000;', (err) => done(err, conn));
    },
  },
};
