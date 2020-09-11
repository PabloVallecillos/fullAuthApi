const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const fileUpload = require('express-fileupload');
const path = require('path');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
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

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: '/auth/facebook/callback',
    },
    (accessToken, refreshToken, profile, cb) => {
      console.log(chalk.blue(JSON.stringify(profile)));
      return cb(null, profile);
    }
  )
);
app.use(passport.initialize());


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

// Use Routes
app.use(fileUpload());
app.use('/api/', authRouter);
app.use('/api/', userRouter);
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Page Not Founded',
  });
});

// app.get('/auth/facebook', passport.authenticate('facebook'));
// app.get(
//   '/auth/facebook/callback',
//   passport.authenticate('facebook'),
//   (req, res) => {

//     res.redirect('/private');
//   }
// );

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
