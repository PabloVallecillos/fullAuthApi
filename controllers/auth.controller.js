const User = require('../models/auth.model');
const expressJwt = require('express-jwt');
const _ = require('lodash');
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');

const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const { errorHandler } = require('../helpers/dbErrorHandling');
const sgMail = require('@sendgrid/mail');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const xoauth2 = require('xoauth2');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.registerController = (req, res) => {
  const { name, email, password } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    console.log(firstError);
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

  // // Email data sending
  // const emailData = {
  //   from: process.env.EMAIL_FROM,
  //   to: email,
  //   subject: 'Account activation link',
  //   html: `
  //     <h1> Please Click to link to activate </h1>
  //     <p> ${process.env.CLIENT_URL}/users/activate/${token} </p>
  //     <p> This email contains sensitive info </p>
  //     <p> ${process.env.CLIENT_URL} </p>`,
  // };

  // sgMail
  //   .send(emailData)
  //   .then((sent) => {

  //     return res.json({
  //       message: `Email has been sent to ${email}`,
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err +'asdfasdf')
  //     return res.status(400).json({
  //       error: errorHandler(err),
  //     });
  //   });
  // (async () => {
  //   try {
  //     await sgMail.send(emailData);
  //     // return res.json({
  //     //   message: `Email has been sent to ${email}`,
  //     // });
  //   } catch (error) {
  //     console.error(error);

  //     if (error.response) {
  //       console.error(error.response.body)
  //     }
  //   }
  // })();

  // async function start() {
  //   const transporter = nodemailer.createTransport({
  //     host: 'smtp.gmail.com',
  //     port: 465,
  //     secure: true,
  //     auth: {
  //       type: 'OAuth2',
  //       user: 'vallecillospablo@gmail.com',
  //       serviceClient: '116580561011771305809',
  //       privateKey: '\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDjyOsjjlHdIJIH\ncnraNQ0Vs9qwJZfnPclY34/mfp/UepP33O0E+Ya0uOKExCphNZWeSp2hw1m6DnSs\n7xIEJ+jMUMRNHbLBnbRiqpM9NpKl2f2lpT5zTiAauZcK7uOTwS6FOIZ4TntShUDF\njHn/WK06MKsmc0M6RhNKzQlLGHTroAfhC4USRUJRQBPn0KKUWsroBNCLlQ5/CF6Z\nHDh//YP09NuntUDFLGRg38iSetns7884Gv6j2IN8bSfBXA1q1mA1VjTwTybZCJDJ\n3tddBMIt7PHcAbP2tVflQfsDfpfp2HqwdweQEh7CKqrohi/bOhdOf1MQ9NeCUIz9\nyi9L/kpJAgMBAAECggEAAqWPgeLB9cFOoRKF9eoe5E0qMdjF+pRftg4m9GUtQ0FH\nXd5tzJx/obLyQtuqqGWAfw3b5gjIjp5jYa0Hdw/lpxYbKdA6BwDnmyvjORdcvdua\nFGYmox1ZxyW36RMchtd8TGT7PwOecDeHKKR4uGxV2vK80l4NfmxZBgn63SoEFcbJ\nI2LzYcP36Cq9CH2pFbQOgElnl6zxY7zoHrIbfQQ6rz4VfpjJQ9WVl3cGuh98PU2Y\nQCXgHaKlwRNV0zJ4a0efNaiSI1bTYWTfRCfb6nBddG/w25r+UwEG3KIYvFbY3yII\n9vHvvim6oq9bxIKIfbSCipbNfGmzrbtV8JwutTAgOQKBgQD40V4kXjxy1uz76k0O\nXmhdyAcK+n8hXdxKx85aCy7hWwpv4Nh8cxoJjzaxkCbxmH8EW8ZBTuZilb5Fnc5D\nwt4Mb0kLJK7Dsyap0GyJZiB+w18OR9xVaGa5AK5Cndbh/3k61OFJ6/2xSFceyLww\nPGZJZNFzhOqNELxkYAPzN5mlhQKBgQDqXCDDzaJi2L3uZSj0EUGHEDj60vb51/Qm\nxvltH1g7km30imyHmY9wJlZ+VXXoZqZlFcZyh0i7TNnymcoXu8pxQ1oMaPhkazfo\n+2vko+3hUYtEt/+9sf37n9esJeviTDs+2x0oWBzmXGmqwrwL+pqSNTQmvpJpj/+C\nj/Ms/sP69QKBgDPcj97MtZTKL4MihwUjsGU7uBwVskHmKnB7zQr/obnfHAHNv9HQ\nu/CaJTBFd5iLzI3AA0bBh0utIoeoKMH+8AFvgK4N609nG/vxMW5CFyvU1Q9I8yfq\nJt8QwUGpXIymj0Iv9PVPdwVoqqAD/xWewUMy/GUzox/cCShyyt/7Cs9xAoGAdYOo\nskYEbQg9hLKY7HlSoEUULUFnsjQFKwSOwZb8CTMNi5d1gDER6axvpn132AbQ3NMk\nZP1NDQ4mIy3WVjxF8LFTD/H6y2+v41Ve7pD8kQTwjo6s4BPGRUwLOzjwpNKQyp3Y\nawhzxVcFbSikXmVU6IdhFSRuChy4hGFmEGPXJZkCgYBTOoAguLO9Pg1AdpxIHVX/\nnE6Qb4+gsLNSePgcwlTr6UKCjzMDKGJOnUbcUC2LJSt3S8oOQU4sLW6YSlfvDWnR\ntsHwItm8tG3cZRu5pZqs6uOfOQySiYfI1pH0H41FWtX9T2VyJkhE3E3yxzZHCUW4\ncNmyPatfaWUJOIxe97IV5g==\n',
  //     },
  //   });
  //   try {
  //     await transporter.verify();
  //     await transporter.sendMail({
  //       from: 'vallecillospablo@gmail.com',
  //       to: email,
  //       subject: 'John Doe opens new farm YOU GOTTA SEE IT',
  //       text: 'It is beautiful.',
  //       html:
  //            `<h1> Please Click to link to activate </h1>
  //            <p> ${process.env.CLIENT_URL}/users/activate/${token} </p>
  //            <p> This email contains sensitive info </p>
  //            <p> ${process.env.CLIENT_URL} </p>`,

  //     });
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

  // start();

  async function main() {
    let transporter = nodemailer.createTransport({
      host: 'smtp.googlemail.com', // Gmail Host
      port: 465, // Port
      secure: true, // this is true as port is 465
      auth: {
        type: 'Oauth2',
        user: 'vallecillospablo@gmail.com',
        clientId:
          '139793166023-23ujo2m3273guo49gvot3jq04hcb8vrh.apps.googleusercontent.com',
        clientSecret: 'oM2p9z0nknNY9U6Qos6xLPES',
        refreshToken:
          '1//04D0qvB75v2yLCgYIARAAGAQSNwF-L9IrDTNax03XngMqwBiSMgSheRM7LwyhOjSqBSE4pdiH3PZX0omqHBVOjarE3-pgVvCWKBw',
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: 'Pablo <vallecillospablo@gmail.com>', // sender address
      to: email, // list of receivers
      subject: 'Welcome Email', // Subject line
      //text: "Hello world?", // plain text body
      html: `${process.env.CLIENT_URL}/users/activate/${token}`, // html body
    });

    console.log('Message sent: %s', info.messageId);
  }

  main()
    .then(() => {
      return res.json({
        message: `Email has been sent to ${email}`,
      });
    })
    .catch((err) => {
      console.log(err)
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
              console.log(err);
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
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      errors: firstError,
    });
  } else {
    // check if user exist
    User.findOne({
      email,
    }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          errors: 'User with that email does not exist. Please signup',
        });
      }
      // authenticate
      if (!user.authenticate(password)) {
        return res.status(400).json({
          errors: 'Email and password do not match',
        });
      }
      // generate a token and send to client
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

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'], // req.user._id
});

exports.adminMiddleware = (req, res, next) => {
  User.findById({
    _id: req.user._id,
  }).exec((err, user) => {
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
