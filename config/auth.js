const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

require('../models/User')
const User = mongoose.model('users');

// Local authentication by email and passowrd
module.exports = function (passport) {

    // by email with callback function
    passport.use(new localStrategy({
        usernameField: 'signUserEmail',
        passwordField: 'signUserPassword'}, (email, password, done) => {

            // Find user by email
            User.findOne({email: email}).then((user) => {
    
                // If does not found the email
                if (!user) {
                    return done(null, false, {message: 'This account does not exist!'})
                }
    
                // Checking password
                bcrypt.compare(password, user.password, (err, ok) => {
    
                    // Email and password OK
                    if (ok) {
                        return done(null, user)
                    }
                    else {
                        return done(null, false, {message: 'Incorrect password!'})
                    }
    
                })
            })
    
        }))

    // Save data to the session
    passport.serializeUser(async (user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id); // findById retorna uma Promise
            done(null, user); // Passa o usuário encontrado
        } catch (err) {
            done(err, null); // Passa o erro, caso ocorra
        }
    });
    

}