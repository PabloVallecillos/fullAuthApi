const express = require('express');
const router = express.Router();
const passport = require('passport');
// import controller
const { requireSignin, adminMiddleware } = require('../controllers/auth.controller');
const {
  readController,
  updateController,
  uploadController,
  facebookController
} = require('../controllers/user.controller');

router.get('/user/:id', requireSignin, readController);
router.post('/upload', requireSignin, uploadController);
router.put('/user/update', requireSignin, updateController);
router.put('/admin/update', requireSignin, adminMiddleware, updateController);

router.get("/auth/facebook", passport.authenticate("facebook"));
router.get("/auth/facebook/callback",
    passport.authenticate("facebook"),
    facebookController);
module.exports = router;
