const express = require('express');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const mongoose = require('mongoose');
require ('../models/User');
const User = mongoose.model('users');
const bcrypt = require('bcrypt');
const passport = require('passport');
const router = express.Router();

router.get('/wantLogin', (req, res, next) => {
    res.render('users/wantLogin');
});

router.get('/register', (req, res, next) => {
    res.render('users/register');
});

router.get('/credentials', (req, res, next) => {
    res.render('users/credentials');
});

router.post('/newaccount', async (req, res, next) => {

    const newAccErrors = [];

    const name = req.body.newUserFirstName;
    const lName = req.body.newUserLastName;
    const cpany = req.body.newUserCompany;
    const email = req.body.newUserEmail;
    const psw = req.body.newUserPassword;
    const cPsw = req.body.newUserPasswordConfirm;

    const numbPsw = (psw.match(/\d/g) || []).length

    // Special characters count
    function sCharacters (str) {
        const specialChar = /[^a-zA-Z0-9\s]/g;
        const matches = str.match(specialChar);
        return matches ? matches.length : 0
    }

    // Validations from Form below

    // Password different from confirmation 
    if (psw !== cPsw) {
        newAccErrors.push({text: `The password is not equal the password confirm.`})
    }
    
    // Undefined inputs
    if (name == undefined ||
        lName == undefined ||
        cpany == undefined ||
        email == undefined ||
        psw == undefined ||
        cPsw == undefined
    ) {
        newAccErrors.push({text: 'Undefined Fields!'});
    }

    // Null inputs
    if (
        name == null ||
        lName == null ||
        cpany == null ||
        email == null ||
        psw == null ||
        cPsw == null
    ) {
        newAccErrors.push({text: 'Null fields!'})
    }

    // Empty inputs
    if (
        !name ||
        !lName ||
        !cpany ||
        !email ||
        !psw ||
        !cPsw
    ) {
        newAccErrors.push({text: 'Empty fields!'})
    }
    
    // Too short passwords
    if (
        psw.length < 8
    ) {
        newAccErrors.push({text: 'Too short password. The minimum is 8 characters.'});
    }
    
    // Weak passwords
    if (numbPsw < 1 || sCharacters(psw) < 1) {
        newAccErrors.push({text: 'Too weak password. It need\'s at least one number and one special character.'})
    }

    // If it got some error
    if (newAccErrors.length > 0) {
        const errorMessages = newAccErrors.map(error => error.text); // Cria um array de mensagens de erro
        req.flash('errorMsg', errorMessages); // Adiciona a array ao flash
        res.redirect('register'); // Redireciona para a página de registro
        return;
    }
    
    
    else {

        // To check if the Form email already exists
        async function emailExists(email) {
            try {
                const user = await User.findOne({ email: email });
                return !!user;

            } catch (err) {
                req.flash('errorMsg', 'Error checking email');
                console.error(`Error checking email: ${err}`)
                throw err;
            }
        }

        // If an user with this email already exists
        if (await emailExists(email) == true) {
            req.flash('errorMsg', 'An user with this email already exists');
            console.log('An user with this email already exists');
            res.redirect('register');
        } else {

            // Well, saving user on db
            const newAcc = new User({
                firstName: name,
                lastName: lName,
                company: cpany,
                email: email
            });
            
            // Hashing password for security
            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    req.flash('errorMsg', 'There was an error generating salt');
                    console.log(`There was an error generating salt: ${err}`);
                    return res.redirect('register');
                }
            
                bcrypt.hash(psw, salt, (err, hash) => {
                    if (err) {
                        req.flash('errorMsg', 'There was an error creating hash');
                        console.log(`There was an error creating hash: ${err}`);
                        return res.redirect('register');
                    }
            
                    // Add hash to object
                    newAcc.password = hash;
            
                    // Save in mongoDb
                    newAcc.save()
                        .then(() => {
                            req.flash('successMsg', 'New user saved successfully');
                            console.log('New user saved successfully!');
                            res.redirect('credentials');
                        })
                        .catch((err) => {
                            req.flash('errorMsg', 'User not created');
                            console.log(`User not created: ${err}`);
                            res.status(500).send('Error saving user');
                        });
                });
            });
        };
    };



});

router.post('/signin', async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            req.flash('errorMsg', 'An error occurred during authentication.');
            return res.redirect('/users/credentials');
        }
        if (!user) {
            req.flash('errorMsg', info.message || 'Invalid credentials.');
            return res.redirect('/users/credentials');
        }
        req.logIn(user, (err) => {
            if (err) {
                req.flash('errorMsg', 'An error occurred during login.');
                return res.redirect('/users/credentials');
            }
            req.flash('successMsg', 'Welcome! You have successfully signed in.');
            return res.redirect('/');
        });
    })(req, res, next);
});


module.exports = router;