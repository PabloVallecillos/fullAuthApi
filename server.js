const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const fileUpload = require('express-fileupload');
const path = require('path');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const logs = require('./api/logs');

// Config .env to ./config/config.env
require('dotenv').config({
  path: './config/config.env',
});

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

// Connect DB
connectDB();

// Use body parser --> TypeError: Cannot destructure property 'name' of 'req.body' as it is undefined.
app.use(bodyParser.json());

// Config for only development
if (process.env.NODE_ENV === 'development') {
  app.use(
    cors({
      origin: process.env.CLIENT_URL,
    })
  );
  app.use(morgan('dev'));
  // Morgan give information about each request and
  // Cors it's allow to deal with React for localhost at port 3000 without any problem
}

// Load all routes
const authRouter = require('./routes/auth.route');
const userRouter = require('./routes/user.route');

app.all('/*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use(passport.initialize());
// Use Routes
app.use(fileUpload());
app.use('/api/', authRouter);
app.use('/api/', userRouter);
app.use('/api/logs', logs);
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Page Not Founded',
  });
});
require('./config/passport');

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('dev'));
  // Set static folder
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
