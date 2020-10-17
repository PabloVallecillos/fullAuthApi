const express = require('express');
const router = express.Router();

const {
  getController,
  postController,
} = require('../controllers/log.controller.js');

router.get('/logs', getController);
router.post('/logs', postController);

module.exports = router;