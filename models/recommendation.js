'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let recommendationSchema = new Schema({
    _id: { type: String, required: true },
    description: { type: String, required: true },
    edad: { type: String, required: true },
    energyMin: {type: Number, required: true},
    energyMax: {type: Number, required: true},
    lipidsMin: {type: Number, required: true},
    lipidsMax: {type: Number, required: true},
    proteinMin: {type: Number, required: true},
    proteinMax: {type: Number, required: true},
    carbohydrtMin: {type: Number, required: true},
    carbohydrtMax: {type: Number, required: true},
    vitAMin: {type: Number, required: false},
    vitAMax: {type: Number, required: false},
    vitCMin: {type: Number, required: false},
    vitCMax: {type: Number, required: false},
    vitB1Min: {type: Number, required: false},
    vitB1Max: {type: Number, required: false},
    vitB2Min: {type: Number, required: false},
    vitB2Max: {type: Number, required: false},
    vitB3Min: {type: Number, required: false},
    vitB3Max: {type: Number, required: false},
    vitB6Min: {type: Number, required: false},
    vitB6Max: {type: Number, required: false},
    folMin: {type: Number, required: false},
    folMax: {type: Number, required: false},
    feMin: {type: Number, required: false},
    feMax: {type: Number, required: false},
    zincMin: {type: Number, required: false},
    zincMax: {type: Number, required: false},
    caMin: {type: Number, required: false},
    caMax: {type: Number, required: false},

    date: { type: Date, default: Date.now },
});


let Recommendation = module.exports = mongoose.model("recommendations", recommendationSchema);