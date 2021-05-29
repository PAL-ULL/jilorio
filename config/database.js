
'use strict'

var mongoose = require("mongoose");

const user = "jilorio";
const password = "jilorio";
const host = "127.0.0.0";
const port = "27017";
const name = "entullo";


module.exports = {

    database: `mongodb+srv://${user}:${password}@entullo.q8g1t.mongodb.net/${name}?retryWrites=true&w=majority`,
    secret: 'yoursecret'
}