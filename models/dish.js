'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const food = require("./food");


let dishSchema = new Schema({
    _id: { type: String, required: true },
    description: { type: String, required: true },
    ingredients: {type: Array, required: true},
    date: { type: Date, default: Date.now },
    relationatedDishes: {type: Array, required: false},
    recipe: {type: String, required: false},
    imageURL: { type: String, required: false, default: "https://lh3.googleusercontent.com/proxy/GecFC2DtHu2iru8fKakVhZMVlX4Mi7m90aNO-YyezwKD4lpuXVpjvmeJ1aw6T6x9lDaepeelP0-Sq9DvvovCRGaQ1AVt0oYOLwu4miczI-jSOM9baH2i1OkhQeaPonZy5M357U4TD6biD-AZLa4xyXHtqCq-D974toW1tMyhS0g6aNwtr1Blb8uDeFF6SpfY3i38_nBwfsrTYFn4qcOW6URPjTXM7XsORTDjiDFm90Tz_20ZdgQsn2OucA"}
});


let Dish = module.exports = mongoose.model("dish", dishSchema);