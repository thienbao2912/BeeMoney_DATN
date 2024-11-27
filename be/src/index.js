'use strict';
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const ejsMate = require('ejs-mate');
const categorieRoutes = require("./routes/admin/categorieRoutes");
const transactionRoutes = require("./routes/transaction");
const userRoutes = require("./routes/admin/userRoutes");
const authRoutes = require("./routes/auth");
const savingsFund = require("./routes/savingsFund");
const fundRoutes = require('./routes/fund');
const notifiRoutes = require('./routes/notification');
const jwt = require('jsonwebtoken');
const authGoogle = require("./routes/authGoogle");
const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
require('../passport');
const User = require('./models/User');

// const expenseRoutes= require("./routes/expenseRoutes");
const income = require("./routes/income");
const budgetRoutes = require("./routes/budget")
const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.URL_FE,
  methods:"GET, POST, PUT, DELETE, PATCH",
  credentials:true
}))

app.use(session({
  secret: process.env.JWT_ACCESS_KEY,
  resave:false,
  saveUninitialized:true,
  cookie: { secure: false, httpOnly: true, sameSite: 'Lax' }
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new OAuth2Strategy({
        clientID:process.env.GOOGLE_CLIENT_ID,
        clientSecret:process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:"/auth/google/callback",
        scope:["profile","email"],
        prompt: "consent",
    },
    async(accessToken,refreshToken,profile,done)=>{
        try {
            let user = await User.findOne({ "socialLogin.googleId": profile.id });

            if(!user){
                user = new User({
                    socialLogin: { googleId: profile.id },
                    name:profile.displayName,
                    email:profile.emails[0].value,
                    avatar:profile.photos[0].value,
                    role: 'user',
                    status: 'active'
                });

                await user.save();
            }
            
            if (!accessToken) {
                console.error("Failed to obtain access token");
                return done(new Error("Failed to obtain access token"), null);
            }
            const payload = {
                id: user.id,
                role: user.role,
                name: user.name,
            };

            const jwtSecret = process.env.JWT_ACCESS_KEY;
            const token = jwt.sign(payload, jwtSecret, { expiresIn: '100h' });
            return done(null,{ user, token })
        } catch (error) {
            return done(error,null)
        }
    }
    )
)

passport.serializeUser((user,done)=>{
    done(null,user);
})

passport.deserializeUser((user,done)=>{
    done(null,user);
});

app.get("/auth/google",passport.authenticate("google",{scope:["profile","email"],prompt: "select_account"}));

app.get("/auth/google/callback", passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login?error=google_auth_failed",
}), (req, res) => {
    if (req.user?.user?.status === "locked") {
        return res.redirect("http://localhost:3000/login?error=account_locked");
      }
    if (req.user && req.user.token && req.user.user._id) {
        const { token, user } = req.user;
        res.redirect(`http://localhost:3000/login?token=${token}&userId=${user._id}&userName=${user.name}&role=${user.role}`);
    } else {
        res.redirect("http://localhost:3000/login?error=login_failed");
    }
});

app.get("/login/sucess",async(req,res)=>{

    if(req.user){
        res.status(200).json({message:"user Login",user:req.user})
    }else{
        res.status(400).json({message:"Not Authorized"})
    }
})

app.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) return next(err);
      
        req.session.destroy((err) => {
          if (err) return console.error("Session destruction error:", err);
          res.clearCookie("connect.sid", { path: "/" });
          res.redirect("http://localhost:3000/login");
        });
      });
  });

app.use(express.urlencoded({ extended: true }));

// Routes
// app.use("/api/auth", authGoogle);
app.use("/api/categories", categorieRoutes);
app.use("/api/v2/categories", require('./routes/category'));
app.use("/api/transactions", transactionRoutes);
app.use('/api/savings-goals', require('./routes/savingsGoal'));
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/savings-fund", savingsFund)
app.use('/api', fundRoutes);
app.use('/api/notification', notifiRoutes);
connectDB();

// app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', income);
app.use('/api/budgets', budgetRoutes);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});