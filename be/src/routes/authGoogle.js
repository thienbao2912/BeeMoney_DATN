// const router = require('express').Router();
// require("dotenv").config();
// const passport = require('passport');
// const googleController = require('../controllers/googleController');

// router.get('/google',
//   passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// router.get('/google/callback', (req, res, next) => {
//   passport.authenticate('google', (err, profile) => {
//     req.user = profile;
//     next();
//   })(req, res, next);
// }, (req, res) => {
//   res.redirect(`${process.env.URL_FE}/login-success/${req.user ? req.user.id : ''}/${req.user && req.user.tokenLogin ? req.user.tokenLogin : ''}`);
// });


// router.get('/facebook',
//   passport.authenticate('facebook', { session: false, scope: ['email'] }));

// router.get('/facebook/callback',
//   passport.authenticate('facebook', { session: false }),
//   (req, res) => {
//     res.redirect(`${process.env.URL_FE}/login-success/${req.user ? req.user.id : ''}/${req.user && req.user.tokenLogin ? req.user.tokenLogin : ''}`);
//   });


// router.post('/login-success', googleController.loginSuccess);


// module.exports = router;
