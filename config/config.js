require('dotenv').config();

module.exports = {
  development: {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  },
  test: {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  },
  production: {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  }
};
