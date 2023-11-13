require('path');
const dotenv = require('dotenv');
dotenv.config();
const logger = require('../logs/logger');
const UserModel = require('../models/user');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { sendEmailWithNodemailer } = require('../helpers/email');
const _ = require('lodash');
const fetch = require('node-fetch');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const signUpController = async (req, res) => {
  const { name, email, password } = req.body;

  UserModel.findOne({ email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: 'Email is taken',
      });
    }

    const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, {
      expiresIn: '10m',
    });

    const emailData = {
      from: process.env.EMAIL_TO, // MAKE SURE THIS EMAIL IS YOUR GMAIL FOR WHICH YOU GENERATED APP PASSWORD
      to: email, // WHO SHOULD BE RECEIVING THIS EMAIL? IT SHOULD BE THE USER EMAIL (VALID EMAIL ADDRESS) WHO IS TRYING TO SIGNUP
      subject: 'ACCOUNT ACTIVATION LINK',
      html: `
                <h1>Please use the following link to activate your account</h1>
                <p>http://localhost:3000/auth/activate/${token}</p>
                <hr />
                <p>This email may contain sensitive information</p>
                <p>http://localhost:3000</p>
            `,
    };

    sendEmailWithNodemailer(req, res, emailData);
  });
};

const accountActivationController = async (req, res) => {
  const { token } = req.body;

  if (token) {
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (err, decoded) {
      if (err) {
        console.log('JWT VERIFY IN ACCOUNT ACTIVATION ERROR', err);
        return res.status(401).json({
          error: 'Expired link. Signup again',
        });
      }

      const { name, email, password } = jwt.decode(token);

      const user = new UserModel({ name, email, password });

      user.save((err, user) => {
        if (err) {
          console.log('SAVE USER IN ACCOUNT ACTIVATION ERROR', err);
          return res.status(401).json({
            error: 'Error saving user in database. Try signup again',
          });
        }
        return res.json({
          message: 'Signup success. Please signin.',
        });
      });
    });
  } else {
    return res.json({
      message: 'Something went wrong. Try again.',
    });
  }
};

const signInController = (req, res) => {
  const { email, password } = req.body;
  // check if user exist
  UserModel.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User with that email does not exist. Please signup',
      });
    }
    // authenticate
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: 'Email and password do not match',
      });
    }
    // generate a token and send to client
    const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { _id, name, email, role } = user;

    return res.json({
      token,
      user: { _id, name, email, role },
    });
  });
};

const forgotPasswordController = async (req, res) => {
  const { email } = req.body;

  UserModel.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User with that email does not exist',
      });
    }

    const token = jwt.sign({ _id: user._id, name: user.name }, process.env.JWT_RESET_PASSWORD, {
      expiresIn: '10m',
    });

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Password Reset link`,
      html: `
                <h1>Please use the following link to reset your password</h1>
                <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                <hr />
                <p>This email may contain sensetive information</p>
                <p>${process.env.CLIENT_URL}</p>
            `,
    };

    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        console.log('RESET PASSWORD LINK ERROR', err);
        return res.status(400).json({
          error: 'Database connection error on user password forgot request',
        });
      } else {
        sgMail
          .send(emailData)
          .then((sent) => {
            // console.log('SIGNUP EMAIL SENT', sent)
            return res.json({
              message: `Email has been sent to ${email}. Follow the instruction to activate your account`,
            });
          })
          .catch((err) => {
            // console.log('SIGNUP EMAIL SENT ERROR', err)
            return res.json({
              message: err.message,
            });
          });
      }
    });
  });
};

const resetPasswordController = async (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  if (resetPasswordLink) {
    jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function (err, decoded) {
      if (err) {
        return res.status(400).json({
          error: 'Expired link. Try again',
        });
      }

      UserModel.findOne({ resetPasswordLink }, (err, user) => {
        if (err || !user) {
          return res.status(400).json({
            error: 'Something went wrong. Try later',
          });
        }

        const updatedFields = {
          password: newPassword,
          resetPasswordLink: '',
        };

        user = _.extend(user, updatedFields);

        user.save((err, result) => {
          if (err) {
            return res.status(400).json({
              error: 'Error resetting user password',
            });
          }
          res.json({
            message: `Great! Now you can login with your new password`,
          });
        });
      });
    });
  }
};

const googleLoginController = async (req, res) => {
  const { idToken } = req.body;

  client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID }).then((response) => {
    // console.log('GOOGLE LOGIN RESPONSE',response)
    const { email_verified, name, email } = response.payload;
    if (email_verified) {
      UserModel.findOne({ email }).exec((err, user) => {
        if (user) {
          const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
          const { _id, email, name, role } = user;
          return res.json({
            token,
            user: { _id, email, name, role },
          });
        } else {
          let password = email + process.env.JWT_SECRET;
          user = new UserModel({ name, email, password });
          user.save((err, data) => {
            if (err) {
              console.log('ERROR GOOGLE LOGIN ON USER SAVE', err);
              return res.status(400).json({
                error: 'User signup failed with google',
              });
            }
            const token = jwt.sign({ _id: data.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
            const { _id, email, name, role } = data;
            return res.json({
              token,
              user: { _id, email, name, role },
            });
          });
        }
      });
    } else {
      return res.status(400).json({
        error: 'Google login failed. Try again',
      });
    }
  });
};

const facebookLoginController = async (req, res) => {
  console.log('FACEBOOK LOGIN REQ BODY', req.body);
  const { userID, accessToken } = req.body;

  const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;

  return (
    fetch(url, {
      method: 'GET',
    })
      .then((response) => response.json())
      // .then(response => console.log(response))
      .then((response) => {
        const { email, name } = response;
        UserModel.findOne({ email }).exec((err, user) => {
          if (user) {
            const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
            const { _id, email, name, role } = user;
            return res.json({
              token,
              user: { _id, email, name, role },
            });
          } else {
            let password = email + process.env.JWT_SECRET;
            user = new UserModel({ name, email, password });
            user.save((err, data) => {
              if (err) {
                console.log('ERROR FACEBOOK LOGIN ON USER SAVE', err);
                return res.status(400).json({
                  error: 'User signup failed with facebook',
                });
              }
              const token = jwt.sign({ _id: data.id }, process.env.JWT_SECRET, {
                expiresIn: '7d',
              });
              const { _id, email, name, role } = data;
              return res.json({
                token,
                user: { _id, email, name, role },
              });
            });
          }
        });
      })
      .catch((error) => {
        res.json({
          error: 'Facebook login failed. Try later',
        });
      })
  );
};

const readUserController = async (req, res) => {
  const userId = req.params.id;
  UserModel.findById(userId).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found',
      });
    }
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json(user);
  });
};

const updateUserController = async (req, res) => {
  // console.log('UPDATE USER - req.user', req.user, 'UPDATE DATA', req.body);
  const { name, password } = req.body;

  UserModel.findOne({ _id: req.user._id }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found',
      });
    }
    if (!name) {
      return res.status(400).json({
        error: 'Name is required',
      });
    } else {
      user.name = name;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          error: 'Password should be min 6 characters long',
        });
      } else {
        user.password = password;
      }
    }

    user.save((err, updatedUser) => {
      if (err) {
        console.log('USER UPDATE ERROR', err);
        return res.status(400).json({
          error: 'User update failed',
        });
      }
      updatedUser.hashed_password = undefined;
      updatedUser.salt = undefined;
      res.json(updatedUser);
    });
  });
};

module.exports = {
  signUpController,
  accountActivationController,
  signInController,
  forgotPasswordController,
  resetPasswordController,
  googleLoginController,
  facebookLoginController,
  updateUserController,
  readUserController,
};
