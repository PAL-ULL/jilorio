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
    },

    foodDocs: function (req, res) {
        // console.log(req.params)
        let query = {};
  
        if (req.query.name != undefined)
            query = {shrt_desc: { $regex: req.query.name} };
            console.log(query);
        client.connect(function (err, client) {
            assert.equal(null, err);
            console.log("\nConnected successfully to server");
            const db = client.db(name);
            const collection = db.collection("food");
            findAllDocuments(req, db, query, collection, function (data) {
                return res.status(200).json(data)
            });
        });

    },

    dishDocs: async function (req, res) {
        let query = {};
  
        if (req.query.name != undefined)
            query = { _id: { $regex: req.query["name"] } };
        console.log(query);
        if (parseInt(req.query.limit) != undefined){
            Dish.find(query, async function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    return res.status(200).json(data)
                }
            })
            .limit(parseInt(req.query.limit))
            .sort({ _id: 1 })
        } else {
            Dish.find(query, async function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    return res.status(200).json(data)
                }
            })
            .sort({ _id: 1 })
        }
    },

    menuDocs: async function (req, res) {
        let query = {};
  
        if (req.query.name != undefined)
            query = {_id: { $regex: req.query.name} };

        if (parseInt(req.query.limit) != undefined){
            Menu.find(query, async function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    return res.status(200).json(data)
                }
            })
            .limit(parseInt(req.query.limit))
            .sort({ _id: 1 })
        } else {
            Menu.find(query, async function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    return res.status(200).json(data)
                }
            })
            .sort({ _id: 1 })
        }
    },

    planDocs: async function (req, res) {
        let query = {};
  
        if (req.query.name != undefined)
            query = {_id: { $regex: req.query.name} };

        if (parseInt(req.query.limit) != undefined){
            Planification.find(query, async function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    return res.status(200).json(data)
                }
            })
            .limit(parseInt(req.query.limit))
            .sort({ _id: 1 })
        } else {
            Planification.find(query, async function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    return res.status(200).json(data)
                }
            })
            .sort({ _id: 1 })
        }
    },

    recDocs: async function (req, res) {
        let query = {};
  
        if (req.query.name != undefined)
            query = {_id: { $regex: req.query.name} };

        if (parseInt(req.query.limit) != undefined){
            Recommendation.find(query, async function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    return res.status(200).json(data)
                }
            })
            .limit(parseInt(req.query.limit))
            .sort({ _id: 1 })
        } else {
            Recommendation.find(query, async function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    return res.status(200).json(data)
                }
            })
            .sort({ _id: 1 })
        }
    },

    evalDocs: async function (req, res) {
        let query = {};
  
        if (req.query.name != undefined)
            query = {candidato: { $regex: req.query.name} };

        if (parseInt(req.query.limit) != undefined){
            Valuation.find(query, async function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    return res.status(200).json(data)
                }
            })
            .limit(parseInt(req.query.limit))
            .sort({ _id: 1 })
        } else {
            Valuation.find(query, async function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    return res.status(200).json(data)
                }
            })
            .sort({ _id: 1 })
        }
    },

}

async function findAllDocuments(req, db, query, collection, callback) {
    if (parseInt(req.query.limit) != undefined){
        collection
        .find(query)
        .limit(parseInt(req.query.limit))
        .sort({ ndb_no: 1 })
        .toArray(function (err, docs) {
            assert.equal(err, null);
            callback(docs);
        });
    }else{
        collection
        .find(query)
        .sort({ ndb_no: 1 })
        .toArray(function (err, docs) {
            assert.equal(err, null);
            callback(docs);
        });
    }
   
}





module.exports = apiController;


