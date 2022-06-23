// ***********************************************************************************************
// Configure dotenv, hiding log data
// ***********************************************************************************************
require('dotenv').config({debug: false});

// ***********************************************************************************************
// Imports
// ***********************************************************************************************
console.log(process.env);
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const {Schema} = require("mongoose");
const encrypt = require('mongoose-encryption');

// ***********************************************************************************************
// Create and configure the App
// ***********************************************************************************************
const app = express();

// Configure the app to use EJS
app.set('view engine', 'ejs');

// Configure the app to use the body parser
app.use(bodyParser.urlencoded({extended: true}));

// Serve up static files from the 'public' directory
app.use(express.static("public"));

// ***********************************************************************************************
// Connect to MongoDB
// ***********************************************************************************************
console.log('Connecting to MongoDB ...');
mongoose.connect('mongodb://localhost:27017/userDB');

// ***********************************************************************************************
// Create User Schema / Model
// ***********************************************************************************************

// Create MongoDB Schema
const userSchema = new Schema({
    email: {type: String, required: true},
    password: {type: String, required: true}
});

// Configure encryption for the userSchema
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

// Create MongoDB model
const User = mongoose.model('User', userSchema);


// ***********************************************************************************************
// ROUTE: /home
// ***********************************************************************************************
app.route('/')
    .get((req, res) => {
        res.render('home');
    });

// ***********************************************************************************************
// ROUTE: /login
// ***********************************************************************************************
app.route('/login')
    .get((req, res) => {
        res.render('login');
    })
    .post((req, res) => {
        const username = req.body.username;
        const password = req.body.password;

        // Confirm user/password exists in database
        User.findOne(
            {email: username},
            (err, foundUser) => {
                // An error occurred while looking up the user
                if (err) {
                    console.log(err);
                } else {
                    // Does the user exist?
                    if (foundUser) {
                        // Is the password correct for this user?
                        if (foundUser.password === password) {
                            res.render('secrets');
                        } else {
                            console.log(`Incorrect password for user [${username}]!`);
                        }
                    } else {
                        console.log(`User [${username}] does not exist!`);
                    }
                }
            }
        );
    });

// ***********************************************************************************************
// ROUTE: /register
// ***********************************************************************************************
app.route('/register')
    .get((req, res) => {
        res.render('register');
    })
    .post((req, res) => {

        // Get data from registration form
        const emailAddress = req.body.username;
        const password = req.body.password;

        // Create the new User object
        const newUser = new User({
            email: emailAddress,
            password: password
        });

        // Save the new User to the database
        console.log(`Saving new User [${newUser.email}] to database ...`);
        newUser.save((err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log('User saved successfully.');
                res.render('secrets');
            }
        });
    });

// ***********************************************************************************************
// ROUTE: /logout
// ***********************************************************************************************
app.route('/logout')
    .get((req, res) => {
        res.render('home');
    });

// ***********************************************************************************************
// Start Server
// ***********************************************************************************************
app.listen(3000, () => {
    console.log('Server listening on port 3000 ...');
});