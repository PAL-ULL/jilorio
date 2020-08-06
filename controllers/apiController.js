'use strict'

// MongoDB 
let mongo = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
let assert = require("assert");
const user = "admin";
const password = "password123";
const host = "127.0.0.1";
const port = "27017";
const name = "heroku_zp6jl2nt";
const url = "mongodb://jilorio:cl0udcanteen@ds123662.mlab.com:23662/heroku_zp6jl2nt";
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')
const passport = require('passport')

// Lang template
const espTemplate = require("../templates/esp.json");
const dish = require("../public/javascripts/dish.js");
const usdaJson = require("../public/food.json");
var util = require('util');

// Bring mondels
const Dish = require("../models/dish");
const Users = require("../models/user");
const Menu = require("../models/menu");
const Planification = require("../models/planification");
const Recommendation = require("../models/recommendation");
const Valuation = require("../models/valuation");
const User = require("../models/user");



const { Console } = require("console");
const { db } = require("../models/dish");
const { query } = require("express");
const { resolve } = require("path");


// Routes
let apiController = {
    food: function (req, res) {
        return res.status(200).json("hola");
    }
}



module.exports = apiController;

