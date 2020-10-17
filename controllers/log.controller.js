const LogEntry = require('../models/travel.model');

exports.getController = async (req, res, next) => {
    try {
        const entries = await LogEntry.find();
        res.json(entries)
    } catch (error) {
        next(error);
    }
}

exports.postController = async (req, res, next) => {
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
}