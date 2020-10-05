
'use strict'

var mongoose = require("mongoose");
// const user = "admin";
// const password = "password123";
// const host = "127.0.0.1";
// const port = "27017";
// const name = "heroku_zp6jl2nt";


// module.exports = {
//     database:"mongodb://jilorio:cl0udcanteen@ds123662.mlab.com:23662/heroku_zp6jl2nt",
//     secret: 'yoursecret'
// }
const user = "newAdmin";
const password = "admin123";
const host = "193.145.96.29";
const port = "8081";
const name = "entullo";


module.exports = {
    database:`mongodb://${user}:${password}@${host}:${port}/${name}`,
    secret: 'yoursecret'
} 