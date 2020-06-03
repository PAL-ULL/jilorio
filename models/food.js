'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const food = new Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    unitMeasure: { type: String, required: true },
    ndbno: { type: String, required: true }

});

module.exports = mongoose.model("food", food);