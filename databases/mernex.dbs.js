const mongoose = require('mongoose');
const logger = require('../logs/logger');
require('path');
require('dotenv').config({ path: '.env' });

mongoose.Promise = global.Promise;

const mong = async () => {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  try {
    mongoose.connect(process.env.DBURI, connectionParams);
    logger.info('MongoDB Connection Successful');
  } catch (err) {
    logger.error(`${err.status || 500} - ${err.message}`);
    process.exit(1);
  }
};

module.exports = mong;
