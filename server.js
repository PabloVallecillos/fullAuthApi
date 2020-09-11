const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const fileUpload = require('express-fileupload');
const path = require('path');
// Config .env to ./config/config.env
require('dotenv').config({
  path: './config/config.env',
});

const app = express();

// Set up a whitelist and check against it:
// var whitelist = ['https://fullauth.netlify.app']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

// Then pass them to cors:
app.use(cors({
  origin: process.env.CLIENT_URL
}));

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

// Serve static assets if in production 
if(process.env.NODE_ENV === 'production'){
  app.use(morgan('dev'));
  // Set static folder 
  app.use(express.static("client/build"))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
