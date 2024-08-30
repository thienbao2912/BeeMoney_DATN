const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
require("dotenv").config();
const passport = require('passport');
const User = require('./src/models/User');
const { v4: uuidv4 } = require('uuid');
const { sendRandomPasswordEmail } = require('./src/services/emailservices');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
},
async function (accessToken, refreshToken, profile, cb) {
  try {
    if (profile && profile.id) {
      let user = await User.findOne({ 'socialLogin.googleId': profile.id });
      const randomPassword = Math.random().toString(36).slice(-8);
      let created = false;

      if (!user) {
        const tokenLogin = uuidv4();
        profile.tokenLogin = tokenLogin;
        user = new User({
          name: profile.displayName,
          email: profile.emails && profile.emails[0] ? profile.emails[0].value : '',
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
          socialLogin: { googleId: profile.id },
          password: randomPassword,
          isEmailVerified: true,
          tokenLogin
        });
        await user.save();
        await sendRandomPasswordEmail(user.email, randomPassword);
        created = true;
      }

      // Nếu người dùng đã tồn tại, cập nhật tokenLogin
      if (!created) {
        const tokenLogin = uuidv4();
        profile.tokenLogin = tokenLogin;
        await User.updateOne({ 'socialLogin.googleId': profile.id }, { tokenLogin });
        user.tokenLogin = tokenLogin; // Cập nhật lại tokenLogin cho user object
      }

      return cb(null, user);
    } else {
      return cb(new Error("Không tìm thấy ID hồ sơ"), null);
    }
  } catch (err) {
    return cb(err, null); // Trả về lỗi nếu có lỗi xảy ra
  }
}
));


passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/api/auth/facebook/callback",
  profileFields: ['email', 'name', 'displayName', 'photos']
},
async function (accessToken, refreshToken, profile, cb) {
  try {
    if (profile && profile.id) {
      let user = await User.findOne({ 'socialLogin.facebookId': profile.id });
      const randomPassword = Math.random().toString(36).slice(-8);
      let created = false;

      if (!user) {
        const tokenLogin = uuidv4();
        profile.tokenLogin = tokenLogin;
        user = new User({
          name: profile.displayName,
          email: profile.emails && profile.emails[0] ? profile.emails[0].value : '',
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
          socialLogin: { facebookId: profile.id },
          password: randomPassword,
          isEmailVerified: true,
          tokenLogin
        });
        await user.save();
        await sendRandomPasswordEmail(user.email, randomPassword);
        created = true;
      }

      if (!created) {
        const tokenLogin = uuidv4();
        profile.tokenLogin = tokenLogin;
        await User.updateOne({ 'socialLogin.facebookId': profile.id }, { tokenLogin });
        user.tokenLogin = tokenLogin;
      }

      return cb(null, user);
    } else {
      return cb(new Error("Không tìm thấy ID hồ sơ"), null);
    }
  } catch (err) {
    return cb(err, null);
  }
}
));


module.exports = passport;
