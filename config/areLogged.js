// To verify if the user are authenticated or not, and assign the result to a variable

module.exports = {
    areLogged: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }

        req.flash('errorMsg', 'User are not logged');
        res.redirect('/');
    }
}