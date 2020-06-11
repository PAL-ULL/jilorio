'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let recomendationSchema = new Schema({
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
    date: { type: Date, default: Date.now },
});


let Recomendation = module.exports = mongoose.model("recomendations", recomendationSchema);