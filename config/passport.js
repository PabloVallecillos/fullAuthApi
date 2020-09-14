var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.serializeUser(function(user, done) {
 done(null, user);
});
passport.deserializeUser(function(user, done) {
 done(null, user);
});

passport.use(
 new GoogleStrategy(
  {
   clientID: process.env.GOOGLE_CLIENT_ID,
   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
   callbackURL: `http://localhost:5000/api/auth/google/callback`
  },
  function(accessToken, refreshToken, profile, done) {
   var userData = {
    image: profile.photos[0].value,
    email: profile.emails[0].value,
    name: profile.displayName,
    token: accessToken
   };

   console.log(userData)

   done(null, userData);
  }
 )
);