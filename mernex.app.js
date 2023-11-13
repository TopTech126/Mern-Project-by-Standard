const express = require('express');
const { authRouter, userRouter } = require('./routes/mernex.routes');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const mong = require('./databases/mernex.dbs');
const logger = require('./logs/logger');
require('dotenv').config({ path: '.env' });
const compression = require('compression');
const app = express();

// Cors config

if ((process.env.NODE_ENV = 'development')) {
  app.use(cors({ origin: `http://localhost:3000` }));
}

// Compression

app.use(compression());

// CORS Setup
const corsOptions = {
  origin: 'http://localhost:3000',
};
app.use(cors(corsOptions));

// Basic express config
app.use(express.json({ limit: '30mb', extended: true }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(helmet());

// Making database connection

mong();

// Routes
app.use('/auth', authRouter);
app.use('/user', userRouter);

// Static view configuration

// app.use(express.static('view/build'));
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, 'view', 'build', 'index.html'));
//   logger.info('Static files i.e. client served');
// });

// Making Port and connection for express.js
const port = process.env.PORT || '5000';
const host = 'localhost';

app.listen(port, () => {
  logger.info(`Server started and running on http://${host}:${port}`);
});
