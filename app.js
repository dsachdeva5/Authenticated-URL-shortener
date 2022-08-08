const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ShortUrl = require("./models/shortUrl");
require("dotenv").config();
const port = process.env.PORT || 3000;
const app = express();
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const shortUrl = require("./models/shortUrl");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "Our little secrets.",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
const connectDB = require("./config/db");
connectDB();
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: false,
    trim: true,
  },
  password: {
    type: String,
    required: false,
    trim: true,
  },
});

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.get("/url", async function (req, res) {
  if (req.isAuthenticated()) {
    const shorturl = await ShortUrl.find();
    res.render("short", { shorturl: shorturl });
  } else {
    res.redirect("/login");
  }
});
app.get("/", function (req, res) {
  res.render("home");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/register", function (req, res) {
  res.render("register");
});
app.get("/short", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/url");
  } else {
    res.redirect("/login");
  }
});
app.post("/delete", async function (req, res) {
  const dlt = req.body.clear;
  await ShortUrl.findByIdAndRemove(dlt, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Deleted!");
      res.redirect("/url");
    }
  })
    .clone()
    .catch(function (err) {
      console.log(err);
    });
});

app.post("/url", async function (req, res) {
  await ShortUrl.create({ full: req.body.fullUrl });
  res.redirect("/url");
});
var k = 1;
app.post("/register", function (req, res) {
  User.findOne({ username: req.body.username }, function (err, user) {
    if (err) console.log(err);
    if (user) {
      k = 0;
    }
  });
  if (k) {
    User.register(
      { username: req.body.username },
      req.body.password,
      function (err, user) {
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, function () {
            res.redirect("/short");
          });
        }
      }
    );
  }
});
app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/short");
      });
    }
  });
});

app.get("/:topic", async function (req, res) {
  const st = await ShortUrl.findOne({ short: req.params.topic });
  if (st == null) return res.sendStatus(404);
  await st.click++;
  await st.save();
  res.redirect(st.full);
});
app.listen(port, function () {
  console.log("server has started");
});
