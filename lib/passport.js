const passport = require('passport');
//const FacebookStrategy = require('passport-facebook');
const GoogleStrategy = require('passport-google-oauth20');

const config = require('../config/config')

const { google, facebook } =  config.conf.oauth

const transformFacebookProfile = (profile, accessToken, refreshToken) => ({
  name: profile.name,
  avatar: profile.picture.data.url,
});

// Transform Google profile into user object
const transformGoogleProfile = (profile, accessToken, refreshToken) => ({
  name: profile.name,
  avatar: profile.picture,
  email: profile.email,
  profile: profile,
  token: accessToken,
  refreshToken: refreshToken
});

/* passport.use(new FacebookStrategy(facebook,
  // Gets called when user authorizes access to their profile
  async (accessToken, refreshToken, profile, done) => {
    return done(null, transformFacebookProfile(profile._json, accessToken, refreshToken))
  } 
)); */

// Register Google Passport strategy
passport.use(new GoogleStrategy(google,
  async (accessToken, refreshToken, profile, done) => {
    return done(null, transformGoogleProfile(profile._json, accessToken, refreshToken))
  }
));


// Serialize user into the sessions
passport.serializeUser((user, done) => done(null, user));

// Deserialize user from the sessions
passport.deserializeUser((user, done) => done(null, user));


module.exports =  passport

