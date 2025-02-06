const express = require('express');
const Handlebars = require('handlebars');
const { engine } = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const mongoose = require('mongoose');
const router = express.Router();
const { areLogged } = require('../config/areLogged');

router.get('/ultra-secret-area', areLogged, (req, res, next) => {
    res.render('admin/ultrasecret')
})

module.exports = router;