//jshint esversion:6

require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
//const md5 = require("md5");  //Level 3
//const encrypt = require("mongoose-encryption");  //level 2

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

//userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});  //Level 2

const User = mongoose.model("User", userSchema);


app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", function(req, res){
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const username = req.body.username;
    const password = hash;
    User.findOne({email: username}, function(err, foundUser){
      if(err){
        res.send(err);
      }else{
        if(foundUser){
          res.send("Email already registered.");
        }else{
          const newUser = new User({
            email: username,
            password: password
          });
          newUser.save(function(err){
            if(err){
              console.log(err);
            }else{
              res.render("secrets");
            }
          });
        }
      }
    });
});
});

app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if(result==true){
            res.render("secrets");
          }else{
            res.send("Password is incorrect!");
          }
        });
      }else{
        res.send("User not found, please register!");
      }
    }
  });
});








app.listen(3000, function(){
  console.log("Server started on port 3000.");
})
