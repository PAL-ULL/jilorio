const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

var util = require('util');
var mongoose = require("mongoose");
const user = "admin";
const password = "password123";
const host = "193.145.96.30";
const port = "8081";
const name = "entullo";
const fs = require("fs");
const Dish = require('../../models/dish');

const DishCollection = "dishes";
const foodCollection = "food";
const dish = {};

dish.storeDishes = async (query) => {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(`mongodb://${user}:${password}@${host}:${port}/${name}`, function (err, db) {
            if (err) throw err;
            var dbo = db.db("entullo");

            dbo.collection(`${DishCollection}`).find(query)
                .sort({ ndb_no: 1 })
                .toArray(function (err, result) {
                    if (err) throw reject(err);
                    resolve(result);
                });
            db.close();
        });
    });
};


dish.storeNutrients = async (ingredients) => {
    return new Promise(function (resolve, reject) {
        const MongoClient = require("mongodb").MongoClient;

        MongoClient.connect(`mongodb://${user}:${password}@${host}:${port}/${name}`, function (err, db) {
            if (err) throw err;
            var dbo = db.db("entullo");
            const resultados = [];

            const query = { ndb_no: ingredients.ndbno };

            dbo.collection(`${foodCollection}`)
                .find(query)
                .sort({ ndb_no: 1 })
                .toArray(function (err, result) {
                    if (err) throw reject(err);

                    resolve(result);
                });

            db.close();
        });
    });
};




async function findAllDocuments(db, query, collection, callback) {

    collection
        .find(query)
        .limit(10)
        .sort({ ndb_no: 1 })
        .toArray(function (err, docs) {
            assert.equal(err, null);
            console.log("\nFound the following records");

            callback(docs);
        });

}

// // Función para calcular los nutrientes de un conjunto de ingredientes
dish.computeNutrients = (ingredientes, nutrientes) => {

    let water = 0;
    let energKcal = 0;
    let protein = 0;
    let lipidTotal = 0;
    let carbohydrt = 0;
    let fiber = 0;
    let sodium = 0;
    let fatSat = 0;
    let fatMonoSat = 0;
    let fatPolySat = 0;
    let cholestrl = 0;
    let sugar = 0;
    let amount = 0;

    for (const ingrediente in ingredientes) {
        amount = ingredientes[ingrediente].amount;


        water = water + ((parseFloat(nutrientes[ingrediente][0]["water_(g)"]) * amount) / 100);


        energKcal = energKcal + ((parseFloat(nutrientes[ingrediente][0]["energ_kcal"]) * amount) / 100);
        protein = protein + ((parseFloat(nutrientes[ingrediente][0]["protein_(g)"]) * amount) / 100);
        lipidTotal = lipidTotal + ((parseFloat(nutrientes[ingrediente][0]["lipid_tot_(g)"]) * amount) / 100);
        carbohydrt = carbohydrt + ((parseFloat(nutrientes[ingrediente][0]["carbohydrt_(g)"]) * amount) / 100);
        if (isNaN(parseFloat(nutrientes[ingrediente][0]["fiber_td_(g)"]))){
            console.log("ENTRA " + fiber);
            fiber = fiber + 0;
        }else{
            fiber = fiber + ((parseFloat(nutrientes[ingrediente][0]["fiber_td_(g)"]) * amount) / 100);
            
        }

        sodium = sodium + (((parseFloat(nutrientes[ingrediente][0]["sodium_(mg)"]) * amount) / 100) / 1000);
        fatSat = fatSat + ((parseFloat(nutrientes[ingrediente][0]["fa_sat_(g)"]) * amount) / 100);
        fatMonoSat = fatMonoSat + ((parseFloat(nutrientes[ingrediente][0]["fa_mono_(g)"]) * amount) / 100);
        fatPolySat = fatPolySat + ((parseFloat(nutrientes[ingrediente][0]["fa_poly_(g)"]) * amount) / 100);
        cholestrl = cholestrl + (((parseFloat(nutrientes[ingrediente][0]["cholestrl_(mg)"]) * amount) / 100) / 1000);
        sugar = sugar + ((parseFloat(Number(nutrientes[ingrediente][0]["sugar_tot_(g)"]) * amount)) / 100);
    }


    const totalNutrients = {
        water: Number(water.toFixed(2)),
        energKcal: Number(energKcal.toFixed(2)),
        protein: Number(protein.toFixed(2)),
        lipidTotal: Number(lipidTotal.toFixed(2)),
        carbohydrt: Number(carbohydrt.toFixed(2)),
        fiber: Number(fiber.toFixed(2)),
        sodium: Number(sodium.toFixed(2)),
        cholestrl: Number(cholestrl.toFixed(2)),
        sugar: Number(sugar.toFixed(2))
    };

    return totalNutrients;
};





module.exports = dish;




