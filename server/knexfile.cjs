require('dotenv').config();

module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: {
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
  pool: {
    min: 5,
    max: 30,
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
