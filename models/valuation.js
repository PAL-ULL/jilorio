'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let valuationSchema = new Schema({
    recomendacion: { type: String, required: true },
    tipo: { type: String, required: true },
    candidato: { type: String, required: true },
    resultados: {type: Array, required: true },
    date: { type: Date, default: Date.now },
});


let Valuation = module.exports = mongoose.model("evaluations", valuationSchema);