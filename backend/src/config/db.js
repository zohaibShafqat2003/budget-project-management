// src/config/db.js
require('dotenv').config()

const { Sequelize, DataTypes } = require('sequelize');

const {
  DB_NAME     = 'budget_project_db',
  DB_USER     = 'postgres',
  DB_PASSWORD = '1122',
  DB_HOST     = 'localhost',
  DB_PORT     = 5432,
  NODE_ENV    = 'development',
  DATABASE_URL = 'postgresql://postgres:1122@localhost:5432/budget_project_db' // For Railway or other providers that give a single URL
} = process.env;

let sequelize;

if (DATABASE_URL && NODE_ENV !== 'development') { // Prefer DATABASE_URL in production if available
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    logging: false, // Usually disable detailed logging in prod
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // This may be needed depending on the provider
      }
    },
    pool: {
      max:     5,
      min:     0,
      acquire: 30000,
      idle:    10000
    },
    retry: {
      max: 3
    }
  });
} else { // Fallback to individual variables or for development
  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host:     DB_HOST,
    port:     parseInt(DB_PORT, 10),
    dialect:  'postgres',
    logging:  NODE_ENV === 'development' ? console.log : false,
    dialectOptions: NODE_ENV !== 'development' ? { // Add SSL for non-development if not using DATABASE_URL
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {},
    pool: {
      max:     5,
      min:     0,
      acquire: 30000,
      idle:    10000
    },
    retry: {
      max: 3
    }
  });
}

/**
 * Try to authenticate up to `retries` times before throwing.
 */
async function testConnection(retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate()
      console.log('✅ Database connection established.')
      return
    } catch (err) {
      console.error(`⚠️  DB connect attempt ${attempt}/${retries} failed:`, err.message)
      if (attempt === retries) {
        throw new Error('❌ Unable to connect to the database after all retries')
      }
      await new Promise(res => setTimeout(res, delay))
    }
  }
}

module.exports = {
  sequelize,
  DataTypes,
  testConnection
}
