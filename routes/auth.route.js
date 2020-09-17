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
  faceRecognitionController,
  checkController,
} = require('../controllers/auth.controller.js');

router.post('/register', validSign, registerController);
router.post('/login', validLogin, loginController);
router.post('/activation', activationController);
router.put('/password/forget', forgotPasswordValidator, forgetController);
router.put('/password/reset', resetPasswordValidator, resetController);
router.post('/googlelogin', googleController);
router.post('/facebooklogin', facebookController);
router.post('/uploadFace', faceRecognitionController);
router.post('/check', checkController);



module.exports = router;
