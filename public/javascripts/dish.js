const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");


var mongoose = require("mongoose");
const user = "myFirstUser";
const password = "myFirstPassword";
const host = "193.145.96.30";
const port = "8081";
const name = "usda-db";
const fs = require("fs");
const Dish = require('../../models/dish');
const DishCollection = "dishes";
const foodCollection = "food";
const dish = {};

dish.storeDishes = async (query) => {
    return new Promise(function (resolve, reject) {
        // const MongoClient = require("mongodb").MongoClient;

        MongoClient.connect(`mongodb://${user}:${password}@${host}:${port}/${name}`, function (err, db) {
            if (err) throw err;
            var dbo = db.db("usda-db");

            dbo.collection(`${DishCollection}`).find(query)
                .toArray(function (err, result) {
                    if (err) throw reject(err);
                    resolve(result);
                });
            db.close();
        });
    });
};


dish.storeNutrients = async (ingredients) => {
    // console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<< Ingredientes de store nutrientes " + ingredients[0]);
    return new Promise(function (resolve, reject) {
        const MongoClient = require("mongodb").MongoClient;

        MongoClient.connect(`mongodb://${user}:${password}@${host}:${port}/${name}`, function (err, db) {
            if (err) throw err;
            var dbo = db.db("usda-db");
            const resultados = [];
       
            for (const ingrediente in ingredients) {
                var query = { ndb_no: ingredients[ingrediente].ndbno };
                // console.log(query);
                dbo.collection(`${foodCollection}`).find(query)
                    .toArray(function (err, result) {
                        if (err) throw reject(err);
                        resultados.push(result[0]);
                        // console.log(result[0]);
                        if (resultados.length === ingredients.length) {
                            
                            resolve(resultados);
                        }
                    });
            }
            db.close();
        });
    });
};

// // Función para calcular los nutrientes de un conjunto de ingredientes
dish.computeNutrients = (ingredientes, nutrientes) => {
    // console.log(ingredientes);
    // console.log(nutrientes);
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
        // console.log("Cantidad: " + amount);
        // console.log("Ingrediente: " + ingredientes[ingrediente]);
        water = water + ((parseFloat(nutrientes[ingrediente]["water_(g)"]) * amount) / 100);
        // console.log("Water " + water);
        energKcal = energKcal + ((parseFloat(nutrientes[ingrediente].energ_kcal) * amount) / 100);
        protein = protein + ((parseFloat(nutrientes[ingrediente]["protein_(g)"]) * amount) / 100);
        lipidTotal = lipidTotal + ((parseFloat(nutrientes[ingrediente]["lipid_tot_(g)"]) * amount) / 100);
        carbohydrt = carbohydrt + ((parseFloat(nutrientes[ingrediente]["carbohydrt_(g)"]) * amount) / 100);
        fiber = fiber + ((parseFloat(nutrientes[ingrediente]["fiber_td_(g)"]) * amount) / 100);
        sodium = sodium + (((parseFloat(nutrientes[ingrediente]["sodium_(mg)"]) * amount) / 100) / 1000);
        fatSat = fatSat + ((parseFloat(nutrientes[ingrediente]["fa_sat_(g)"]) * amount) / 100);
        fatMonoSat = fatMonoSat + ((parseFloat(nutrientes[ingrediente]["fa_mono_(g)"]) * amount) / 100);
        fatPolySat = fatPolySat + ((parseFloat(nutrientes[ingrediente]["fa_poly_(g)"]) * amount) / 100);
        cholestrl = cholestrl + (((parseFloat(nutrientes[ingrediente]["cholestrl_(mg)"]) * amount) / 100) / 1000);
        sugar = sugar + ((parseFloat(Number(nutrientes[ingrediente]["sugar_tot_(g)"]) * amount)) / 100);
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


// dish.calculate = async (plato) => {


//     const result = await dish.storeDishes();
//     const nutrientes = await dish.storeNutrients(result[0].ingredients);
//     console.log( nutrientes[0]["energ_kcal"]);
// };

// console.log(dish.calculate());



module.exports = dish;




