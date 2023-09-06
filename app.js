//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  bcrypt.hash(req.body.password, saltRounds, function(error, hash) {
    const newUser = new User({
      email: req.body.username,
      password: hash
    });

    try {
      saveNewUser(newUser).then(function() {
          res.render("secrets");
      });
    } catch (error) {
      console.log(error);
    }
  });
});

app.post("/login", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  try {
    findUserByUsername(username).then(function(foundUser) {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(error, result) {
          if (result === true) {
            res.render("secrets");
          }
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

const saveNewUser = async function(newUser) {
  return await newUser.save();
}

const findUserByUsername = async function(username) {
  return await User.findOne({email: username});
}

app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
