const express = require('express');
const router = express.Router();
const passport = require('passport');
// import controller
const { requireSignin, adminMiddleware } = require('../controllers/auth.controller');
const {
  readController,
  updateController,
  uploadController,
} = require('../controllers/user.controller');

router.get('/user/:id', requireSignin, readController);
router.post('/upload', requireSignin, uploadController);
router.put('/user/update', requireSignin, updateController);
router.put('/admin/update', requireSignin, adminMiddleware, updateController);


module.exports = router;
