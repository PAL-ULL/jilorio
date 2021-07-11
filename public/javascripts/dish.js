const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

var util = require('util');
var mongoose = require("mongoose");
// const user = "admin";
// const password = "password123";
// const host = "127.0.0.1";
// const port = "27017";
// const name = "heroku_zp6jl2nt";.

// const user = "newAdmin";
// const password = "admin123";
// const host = "193.145.96.29";
// const port = "8081";
// const name = "entullo";

const user = "jilorio";
const password = "jilorio";
const host = "127.0.0.0";
const port = "27017";
const name = "entullo";

// CIM NodeJS API Service
const CIMApiService = require('cim-api-service/src/CIMApiService').CIMApiService;
const cimConfig = require('../../config/cim.js').getConfig();
const ApiService = new CIMApiService(cimConfig);


const fs = require("fs");
const Dish = require('../../models/dish');

const DishCollection = "dishes";
const foodCollection = "food";
const dish = {};

dish.storeDishes = async (query) => {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(`mongodb+srv://${user}:${password}@entullo.q8g1t.mongodb.net/${name}?retryWrites=true&w=majority`, function (err, db) {
            if (err) throw err;
            var dbo = db.db("heroku_zp6jl2nt");

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
        // console.log(util.inspect(ingredients));
        const RESOURCE = "ingredients";
        const ROUTE_PREFIX = "/api/";
        const ROUTE_POSTFIX = "/transformed_list";
        const ID = "?id=";
        const FETCH_URL = `${ROUTE_PREFIX}${RESOURCE}${ROUTE_POSTFIX}${ID}${ingredients.ndbno}`;
        // console.log("EL FETCH_URL ES: " + FETCH_URL);
        ApiService.init().then((apiServiceInstance) => {
            // console.log("............................. CIM -------------------> " + FETCH_URL);
            apiServiceInstance.getData(FETCH_URL).then(resultArray => {
                CIMApiService.dump(resultArray);

                resolve(resultArray);
            })
        })
    })
}
// });
// const MongoClient = require("mongodb").MongoClient;

// MongoClient.connect(`mongodb+srv://${user}:${password}@entullo.q8g1t.mongodb.net/${name}?retryWrites=true&w=majority`, function (err, db) {
//     if (err) throw err;
//     var dbo = db.db("entullo");
//     const resultados = [];

//     const query = { ndb_no: ingredients.ndbno };

//     dbo.collection(`${foodCollection}`)
//         .find(query)
//         .sort({ ndb_no: 1 })
//         .toArray(function (err, result) {
//             if (err) throw reject(err);

//             resolve(result);
//         });

//     db.close();
// });
//     });
// };




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
dish.computeNutrients = async (ingredientes, nutrientes) => {
    console.log("\n\n\nFUNCION\n\n\n");
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

    // console.log(util.inspect(nutrientes[ingrediente]));

    for (const ingrediente in ingredientes) {
        amount = ingredientes[ingrediente].amount;
        console.log(util.inspect(nutrientes[ingrediente]));

        console.log("-> INICIO ahora el energKcal es: " + energKcal);
        // console.log("-> INICIO ahora las kcal es: " + energKcal);
        if (isNaN(parseFloat(nutrientes[ingrediente][0]["water_(g)"]))) {
            water = water + 0;
          
        } else {
          
            water = water + ((parseFloat(nutrientes[ingrediente][0]["water_(g)"]) * amount) / 100);
            
        }
  

        if (isNaN(parseFloat(nutrientes[ingrediente][0]["energ_kcal"]))) {
           
            energKcal = energKcal + 0;
       
        } else {
            console.log("\n\n OPERACIONES:\n: energKcal: "+ (parseFloat(nutrientes[ingrediente][0]["energ_kcal"]) + " X " + amount + " /100 \n\n"))
            energKcal = energKcal + ((parseFloat(nutrientes[ingrediente][0]["energ_kcal"]) * amount) / 100);
         
        }

        console.log("----------> ahora el energKcal es: " + energKcal);


        if (isNaN(parseFloat(nutrientes[ingrediente][0]["protein_(g)"]))) {
            protein = protein + 0;
        } else {
            protein = protein + ((parseFloat(nutrientes[ingrediente][0]["protein_(g)"]) * amount) / 100);
        }

        if (isNaN(parseFloat(nutrientes[ingrediente][0]["lipid_tot_(g)"]))) {
            lipidTotal = lipidTotal + 0;
        } else {
            lipidTotal = lipidTotal + ((parseFloat(nutrientes[ingrediente][0]["lipid_tot_(g)"]) * amount) / 100);
        }

        if (isNaN(parseFloat(nutrientes[ingrediente][0]["carbohydrt_(g)"]))) {
            carbohydrt = carbohydrt + 0;
        } else {
            carbohydrt = carbohydrt + ((parseFloat(nutrientes[ingrediente][0]["carbohydrt_(g)"]) * amount) / 100);
        }


        if (isNaN(parseFloat(nutrientes[ingrediente][0]["fiber_td_(g)"]))) {
            fiber = fiber + 0;
        } else {
            fiber = fiber + ((parseFloat(nutrientes[ingrediente][0]["fiber_td_(g)"]) * amount) / 100);
        }

        if (isNaN(parseFloat(nutrientes[ingrediente][0]["sodium_(mg)"]))) {
            sodium = sodium + 0;
        } else {
            sodium = sodium + (((parseFloat(nutrientes[ingrediente][0]["sodium_(mg)"]) * amount) / 100) / 1000);
        }

        if (isNaN(parseFloat(nutrientes[ingrediente][0]["fa_sat_(g)"]))) {
            fatSat = fatSat + 0;
        } else {
            fatSat = fatSat + ((parseFloat(nutrientes[ingrediente][0]["fa_sat_(g)"]) * amount) / 100);
        }

        if (isNaN(parseFloat(nutrientes[ingrediente][0]["fa_mono_(g)"]))) {
            fatMonoSat = fatMonoSat + 0;
        } else {
            fatMonoSat = fatMonoSat + ((parseFloat(nutrientes[ingrediente][0]["fa_mono_(g)"]) * amount) / 100);
        }

        if (isNaN(parseFloat(nutrientes[ingrediente][0]["fa_poly_(g)"]))) {
            fatPolySat = fatPolySat + 0;
        } else {
            fatPolySat = fatPolySat + ((parseFloat(nutrientes[ingrediente][0]["fa_poly_(g)"]) * amount) / 100);
        }

        if (isNaN(parseFloat(nutrientes[ingrediente][0]["cholestrl_(mg)"]))) {
            cholestrl = cholestrl + 0;
        } else {
            cholestrl = cholestrl + (((parseFloat(nutrientes[ingrediente][0]["cholestrl_(mg)"]) * amount) / 100) / 1000);
        }

        if (isNaN(parseFloat(nutrientes[ingrediente][0]["sugar_tot_(g)"]))) {
            sugar = sugar + 0;
        } else {
            sugar = sugar + ((parseFloat(Number(nutrientes[ingrediente][0]["sugar_tot_(g)"]) * amount)) / 100);
        }
    }


    const totalNutrients = {
        water: Number(water.toFixed(2)),
        energKcal: Number(energKcal.toFixed(2)),
        protein: Number(protein.toFixed(2)),
        lipidTotal: Number(lipidTotal.toFixed(2)),
        carbohydrt: Number(carbohydrt.toFixed(2)),
        fiber: Number(fiber.toFixed(2)),
        sugar: Number(sugar.toFixed(2)),
        sodium: Number(sodium.toFixed(2)),
        cholestrl: Number(cholestrl.toFixed(2))

    };
     console.log("total nutrients: " + util.inspect(totalNutrients))

     console.log("\n\n\n");
    return totalNutrients;
};





module.exports = dish;




