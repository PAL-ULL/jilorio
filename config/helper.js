const helpers = {};
const espTemplate = require("../templates/esp.json");
helpers.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', espTemplate.errors.userNotAuth)
    res.redirect('/login');
}

helpers.authRole = (role) => {
    return (req, res, next) => {

        if (req.user.rol !== role) {
            res.status(401);
            req.flash('error_msg', espTemplate.errors.userNotAuth)
            return res.redirect('/login');
        }
        next();
    }
}

helpers.authRoleMultiple = (roles) => {
    return (req, res, next) => {
        let counter = 0;

        for (let i = 0; i < roles.length; i++) {
            if (req.user.rol === roles[i]) {
                counter++;
            }
        }
        if (counter > 0) {
            next();

        } else {
            res.status(401);
            req.flash('error_msg', espTemplate.errors.userNotAuth)
            return res.redirect('/login');
        }

    }
}


module.exports = helpers;