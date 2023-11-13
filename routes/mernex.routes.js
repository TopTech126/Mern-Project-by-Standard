const express = require('express');
const {
  signUpController,
  accountActivationController,
  signInController,
  forgotPasswordController,
  resetPasswordController,
  googleLoginController,
  facebookLoginController,
  updateUserController,
  readUserController,
} = require('../controllers/mernex.controllers');
const {
  userSignupValidator,
  userSigninValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/auth');
const { runValidation } = require('../validators');
const { adminMiddleware } = require('../middlewares/adminMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const authRouter = express.Router();
const userRouter = express.Router();

// @route POST /auth/create/1
// @desc Registration Route using JWT
// @access Public
authRouter.post('/create/1', userSignupValidator, runValidation, signUpController);

// @route POST /auth/create/2
// @desc Login Route using JWT
// @access Public
authRouter.post('/create/2', userSigninValidator, runValidation, signInController);

// @route POST /auth/create/3
// @desc User Activation
// @access Public
authRouter.post('/create/3', accountActivationController);

// @route PUT /auth/update/1
// @desc Forgot Password Route
// @access Public
authRouter.put('/update/1', forgotPasswordValidator, runValidation, forgotPasswordController);

// @route PUT /auth/update/2
// @desc Reset Password Route
// @access Public
authRouter.put('/update/2', resetPasswordValidator, runValidation, resetPasswordController);

// @route POST /auth/create/4
// @desc Google authentication Route
// @access Public
authRouter.post('/create/4', googleLoginController);

// @route POST /auth/create/5
// @desc Facebook authentication
// @access Public
authRouter.post('/create/5', facebookLoginController);

// @route GET /user/read/:id
// @desc Retrieve User Data
// @access Public
userRouter.get('/read/:id', readUserController);

// @route PUT /user/update/1
// @desc Update User Data
// @access Public
userRouter.put('/update/1', authMiddleware, updateUserController);

// @route PUT /user/update/2
// @desc Update Admin Data
// @access Public
userRouter.put('/update/2', authMiddleware, adminMiddleware, updateUserController);

module.exports = { authRouter, userRouter };
