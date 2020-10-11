// router

const { Router } = require('express');

const LogEntry = require('../models/travel.model');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const entries = await LogEntry.find();
    res.json(entries)
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const entries = new LogEntry(req.body);
    const createdEntry = await entries.save();
    res.json(createdEntry);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status('422');
    }
    next(error);
  }
});

module.exports = router;
