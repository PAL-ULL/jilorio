'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;



let menuSchema = new Schema({
    _id: { type: String, required: true },
    description: { type: String, required: true },
    dishes: {type: Array, required: true},
    date: { type: Date, default: Date.now },
   });


let Menu = module.exports = mongoose.model("menus", menuSchema);