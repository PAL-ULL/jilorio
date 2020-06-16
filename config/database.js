
'use strict'

var mongoose = require("mongoose");
const user = "admin";
const password = "password123";
const host = "127.0.0.1";
const port = "27017";
const name = "entullo";


module.exports = {
    database:`mongodb://${host}:${port}/${name}`,
    secret: 'yoursecret'
}