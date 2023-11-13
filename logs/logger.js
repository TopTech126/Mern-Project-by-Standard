const { createLogger, format, transports } = require('winston');
require('path');
require('dotenv').config({ path: '.env' });

// Import mongodb
require('winston-mongodb');

module.exports = createLogger({
  transports: [
    // File transport
    new transports.File({
      filename: 'logs/server.log',
      format: format.combine(
        format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
        format.align(),
        format.printf((info) => `${info.level}: ${[info.timestamp]}: ${info.message}`)
      ),
    }),

    // MongoDB transport
    new transports.MongoDB({
      level: 'error',
      // mongo database connection link
      db: process.env.DBURI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      // A collection to save json formatted logs
      collection: 'server_logs',
      format: format.combine(
        format.timestamp(),
        // Convert logs to a json format
        format.json()
      ),
    }),
  ],
});
