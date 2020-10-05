'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let planificationSchema = new Schema({
    _id: { type: String, required: true },
    description: { type: String, required: true },
    dias: { type: Number, required: true },
    menus: {type: Array, required: true},
    date: { type: Date, default: Date.now },
});



let Planification = module.exports = mongoose.model("planning", planificationSchema);