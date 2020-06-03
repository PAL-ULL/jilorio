
'use strict'

var mongoose = require("mongoose");
const user = "myFirstUser";
const password = "myFirstPassword";
const host = "193.145.96.30";
const port = "8081";
const name = "usda-db";


module.exports = {
    database:`mongodb://${user}:${password}@${host}:${port}/${name}`,
    secret: 'yoursecret'
}