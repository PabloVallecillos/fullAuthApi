const express = require('express');
const router = express.Router();
var passport = require('passport');
// Validation
const {
  validSign,
  validLogin,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../helpers/valid');

// Load Controllers
const {
  registerController,
  activationController,
  loginController,
  forgetController,
  resetController,
  googleController,
  facebookController,
} = require('../controllers/auth.controller.js');

router.post('/register', validSign, registerController);
router.post('/login', validLogin, loginController);
router.post('/activation', activationController);
router.put('/password/forget', forgotPasswordValidator, forgetController);
router.put('/password/reset', resetPasswordValidator, resetController);
router.post('/googlelogin', googleController);
router.post('/facebooklogin', facebookController);

/* GET Google Authentication API. */
// router.get(
//   '/auth/google',
//   passport.authenticate('google', { scope: ['profile', 'email'] })
// );
// router.get(
//   '/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: '/', session: false }),
//   googleController2
// );

module.exports = router;
