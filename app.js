const express = require('express');
const flash = require('express-flash');
const session = require('express-session');
const app = express();

const Handlebars = require('handlebars');
const { engine } = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

const mongoose = require('mongoose');

const Users = require('./routes/Users');
const Admin = require('./routes/Admin');

const passport = require('passport');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('./config/auth')(passport);

// Config

    // Sessions
    app.use(
        session({
          secret: 'romero brito katrina',
          resave: false,
          saveUninitialized: true
        })
      );

    // Passport
    app.use(passport.initialize());
    app.use(passport.session());

    // Flash
    app.use(flash());

    // Global variables
    app.use((req, res, next) => {
        res.locals.successMsg = req.flash('successMsg');
        res.locals.errorMsg = req.flash('errorMsg');
        res.locals.user = req.user || null; // authenticated user or not

        // Flash messages are not working, I think because here was returning undefined
        next();
    })

    // Public
    app.use(express.static('public'));

    // Mongoose (Database)
    mongoose.connect('mongodb://localhost/authusersdb').then(() => {
        console.log('Connected successfully!');
    }).catch((err) => {
        console.log(`There was an error connecting to mongodb: ${err}`);
    });

    // Handlebars (Template Engine)
    app.engine('handlebars', engine({ 
        defaultLayout: 'main', // default archive: main.handlebars
        handlebars: allowInsecurePrototypeAccess(Handlebars) // to access json prototypes
    }));
    app.set('view engine', 'handlebars');
    app.set('views', './views');

    // Body-Parser (body's requires)
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(express.json());

    
app.get('/', (req, res) => {
    res.render('users/home');
});

// Other routes
app.use('/users', Users);
app.use('/admin', Admin);

app.listen(8088, 'localhost', () => {
    console.log('Server running right now!');
});



