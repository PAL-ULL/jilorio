const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const espTemplate = require("../templates/esp.json");

module.exports = function (passport) {
    // Local Strategy
    passport.use(new LocalStrategy({ passReqToCallback: true, }, function (req, username, password, done) {
        // Match Username
        let query = { username: username };
        User.findOne(query, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, req.flash('error', espTemplate.errors.userNotFound));
            }

            // Match Password
            bcrypt.compare(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, req.flash('error', espTemplate.errors.incorrectPassword));
                }
            });
        });
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
}