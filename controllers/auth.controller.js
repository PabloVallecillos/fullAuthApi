const User = require('../models/auth.model');
const expressJwt  = require('express-jwt');
const _ = require('lodash');
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');

const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const { errorHandler } = require('../helpers/dbErrorHandling');
const sgMail = require('@sendgrid/mail');
const path = require('path');
const fs = require('fs');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.registerController = (req, res) => {
  const { name, email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({ error: firstError });
  } else {
    User.findOne({ email }).exec((err, user) => {
      if (user) {
        res.status(400).json({ error: 'Email is taken' });
      }
    });
  }

  // Generate Token jsonwebtoken
  const token = jwt.sign(
    {
      name,
      email,
      password,
    },
    process.env.JWT_ACCOUNT_ACTIVATION,
    {
      expiresIn: '15m',
    }
  );

  // Email data sending
  const emailData = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Account activation link',
    html: `
      <h1> Please Click to link to activate </h1> 
      <p> ${process.env.CLIENT_URL}/users/activate/${token} </p>
      <p> This email contains sensitive info </p>
      <p> ${process.env.CLIENT_URL} </p>`,
  };

  sgMail
    .send(emailData)
    .then((sent) => {
      return res.json({
        message: `Email has been sent to ${email}`,
      });
    })
    .catch((err) => {
      return res.status(400).json({
        error: errorHandler(err),
      });
    });
};


// Register for backend done let's create for it
// Activation and save to database
exports.activationController = (req, res) => {
  const { token } = req.body;

  if (token) {
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decode) => {
      if (err) {
        console.log('Activation error');
        return res.status(401).json({
          errors: 'Expired link. Signup again',
        });
      } else {
        const { name, email, password } = jwt.decode(token);

        const user = new User({
          name,
          email,
          password,
          emailVerifiedAt: Date.now(),
        });

        user.save((err, user) => {
          if (err) {
            console.log(err);
            console.log('Save error', errorHandler(err));
            return res.status(401).json({
              errors: errorHandler(err),
            });
          } else {
            console.log(user);
            return res.json({
              success: true,
              message: 'Signup success',
              user,
            });
          }
        });
      }
    });
  } else {
    return res.json({
      message: 'error happening please try again',
    });
  }
};

exports.loginController = (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({ error: firstError });
  } else {
    // check if user exits
    User.findOne({
      email,
    }).exec((err, user) => {
      if (err || !user) {
        return res
          .status(422)
          .json({ error: "User with that email don't exist, Please Sign up" });
      }

      if (!user.authenticate(password)) {
        return res
          .status(400)
          .json({ error: "Email and password don't match " });
      }

      // Generate token
      const token = jwt.sign(
        {
          _id: user._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '7d',
        }
      );

      const { _id, name, email, role } = user;
      return res.json({
        token,
        user: {
          _id,
          name,
          email,
          role,
        },
      });
    });
  }
};

exports.forgetController = (req, res) => {
  const { email } = req.body;

  const errors = validationResult(req);

  // Validation to req.body we will create custom validation in seconds
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      error: firstError,
    });
  } else {
    User.findOne({ email }, (err, user) => {
      if (err || !user) {
        return res
          .status(404)
          .json({ error: 'User with that email does not exits' });
      }
      // generate token with user with _id for only 10 min
      const token = jwt.sign(
        {
          _id: user._id,
        },
        process.env.JWT_RESET_PASSWORD,
        {
          expiresIn: '10m',
        }
      );

      // Send email with this token
      const emailData = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Password reset link',
        html: `
          <h1> Please Click to link to reset your password !  </h1> 
          <p> ${process.env.CLIENT_URL}/user/password/reset/${token} </p>
          <p> This email contains sensitive info </p>
          <p> ${process.env.CLIENT_URL} </p>`,
      };

      return user.updateOne({ resetPasswordLink: token }, (err, success) => {
        if (err) {
          return res.status(400).json({ error: errorHandler(err) });
        } else {
          sgMail
            .send(emailData)
            .then((sent) => {
              return res.json({ message: `Email has been sent to ${email}` });
            })
            .catch((err) => {
              return res.json({ error: err.message });
            });
        }
      });
    });
  }
};

exports.resetController = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      error: firstError,
    });
  } else {
    if (resetPasswordLink) {
      jwt.verify(
        resetPasswordLink,
        process.env.JWT_RESET_PASSWORD,
        (err, decoded) => {
          if (err) {
            return res.status(400).json({
              error: 'Expired link, try again',
            });
          }
          User.findOne({ resetPasswordLink }, (err, user) => {
            if (err || !user) {
              return res
                .status(400)
                .json({ error: 'Something went wrong. Try later' });
            }

            const updatedFields = {
              password: newPassword,
              resetPasswordLink: '',
            };

            user = _.extend(user, updatedFields);

            user.save((err, result) => {
              if (err) {
                return res.status(400).json({
                  error: 'Error reseting user password',
                });
              }

              res.json({
                message:
                  "Great! Now you can login with your new password don't forget then ",
              });
            });
          });
        }
      );
    }
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleController = (req, res) => {
  console.log(req.body);
  const { idToken } = req.body;
  client
    .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
    .then((response) => {
      const { email_verified, name, email } = response.payload;
      if (email_verified) {
        User.findOne({ email }).exec((err, user) => {
          if (user) {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: '7d',
            });
            const { _id, email, name, role } = user;
            return res.json({
              token,
              user: { _id, email, name, role },
            });
          } else {
            let password = email + process.env.JWT_SECRET;
            user = new User({ name, email, password });
            user.save((err, data) => {
              if (err) {
                console.log('ERROR GOOGLE LOGIN ON USER SAVE', err);
                return res.status(400).json({
                  error: 'User signup failed with google',
                });
              }
              const token = jwt.sign(
                { _id: data._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
              );
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

exports.signinController = (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  } else {
    // check if user exist
    User.findOne({
      email
    }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          errors: 'User with that email does not exist. Please signup'
        });
      }
      // authenticate
      if (!user.authenticate(password)) {
        return res.status(400).json({
          errors: 'Email and password do not match'
        });
      }
      // generate a token and send to client
      const token = jwt.sign(
        {
          _id: user._id
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '7d'
        }
      );
      const { _id, name, email, role } = user;

      return res.json({
        token,
        user: {
          _id,
          name,
          email,
          role
        }
      });
    });
  }
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'] // req.user._id
});

exports.adminMiddleware = (req, res, next) => {
  User.findById({
    _id: req.user._id
  }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found'
      });
    }

    if (user.role !== 'admin') {
      return res.status(400).json({
        error: 'Admin resource. Access denied.'
      });
    }

    req.profile = user;
    next();
  });
};

exports.facebookController = (req, res) => {
  const { userID, accessToken } = req.body; // this from react
  const url = `https://graph.facebook.com/v2.11/${userID}?fields=id,name,email&acces_token=${accessToken}`;

  return fetch(url, {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((res) => {
      const { email, name } = response;
      User.findOne({ email }).exec((err, user) => {
        if (user) {
          const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
          });
          const { _id, email, name, role } = user;
          return res.json({
            token,
            user: { _id, email, name, role },
          });
        } else {
          let password = email + process.env.JWT_SECRET;
          user = new User({ name, email, password });
          user.save((err, data) => {
            if (err) {
              console.log('ERROR FACEBOOK LOGIN ON USER SAVE', err);
              return res.status(400).json({
                error: 'User signup failed with facebook',
              });
            }
            const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, {
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
    });
};


