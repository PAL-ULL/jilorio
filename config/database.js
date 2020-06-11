
'use strict'

var mongoose = require("mongoose");
const user = "admin";
const password = "password123";
const host = "193.145.96.30";
const port = "8081";
const name = "entullo";


module.exports = {
    database:`mongodb://${user}:${password}@${host}:${port}/${name}`,
    secret: 'yoursecret'
}