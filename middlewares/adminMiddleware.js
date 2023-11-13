const dotenv = require('dotenv');
const logger = require('../logs/logger');
const UserModel = require('../models/user');

dotenv.config();

const adminMiddleware = async (req, res, next) => {
  UserModel.findById({ _id: req.user._id }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found',
      });
    }

    if (user.role !== 'admin') {
      return res.status(400).json({
        error: 'Admin resource. Access denied.',
      });
    }

    req.profile = user;
    next();
  });
};

module.exports = { adminMiddleware };
