'use strict'

// MongoDB 
let mongo = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
let assert = require("assert");
const user = "admin";
const password = "password123";
const host = "127.0.0.1";
const port = "27017";
const name = "heroku_zp6jl2nt";
const url = `mongodb+srv://${user}:${password}@entullo.q8g1t.mongodb.net/${name}?retryWrites=true&w=majority`;
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')
const passport = require('passport')

// Lang template
const espTemplate = require("../templates/esp.json");
const dish = require("../public/javascripts/dish.js");
var util = require('util');

// Bring mondels
const Dish = require("../models/dish");
const Users = require("../models/user");
const Menu = require("../models/menu");
const Planification = require("../models/planification");
const Recommendation = require("../models/recommendation");
const Valuation = require("../models/valuation");
const User = require("../models/user");



const { Console } = require("console");
const { db } = require("../models/dish");
const { query } = require("express");
const { resolve } = require("path");

const mainController = require("../controllers/mainController");

// Routes
let apiController = {

    food: function (req, res) {
        return res.status(200).json("hola");
    },

    foodDocs: function (req, res) {
        console.log(req.query)
        let query = {};

        if (req.query.name != undefined)
            query = { shrt_desc: { $regex: req.query.name } };
        console.log(query);
        client.connect(function (err, client) {
            assert.equal(null, err);
            console.log("\nConnected successfully to server");
            const db = client.db(name);
            const collection = db.collection("food");
            findAllDocuments(req, db, query, collection, function (data) {
                return res.status(200).json(data)
            });
        });

    },

    dishDocs: async function (req, res) {
        let query = {};
        console.log(req.query.name)
        if (req.query.name != undefined)
            query = { _id: { $regex: req.query["name"] } };
        console.log(query);
        if (parseInt(req.query.limit) != undefined) {
            Dish.find(query, async function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    return res.status(200).json(data)
                }
            })
                .limit(parseInt(req.query.limit))
                .sort({ _id: 1 })
        } else {
            Dish.find(query, async function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    return res.status(200).json(data)
                }
            })
                .sort({ _id: 1 })
        }
    },

    menuDocs: async function (req, res) {
        let query = {};

        if (req.query.name != undefined)
            query = { _id: { $regex: req.query.name } };

        if (parseInt(req.query.limit) != undefined) {
            Menu.find(query, async function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    return res.status(200).json(data)
                }
            })
                .limit(parseInt(req.query.limit))
                .sort({ _id: 1 })
        } else {
            Menu.find(query, async function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    return res.status(200).json(data)
                }
            })
                .sort({ _id: 1 })
        }
    },

    planDocs: async function (req, res) {
        let query = {};

        if (req.query.name != undefined)
            query = { _id: { $regex: req.query.name } };

        if (parseInt(req.query.limit) != undefined) {
            Planification.find(query, async function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    return res.status(200).json(data)
                }
            })
                .limit(parseInt(req.query.limit))
                .sort({ _id: 1 })
        } else {
            Planification.find(query, async function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    return res.status(200).json(data)
                }
            })
                .sort({ _id: 1 })
        }
    },

    recDocs: async function (req, res) {
        let query = {};

        if (req.query.name != undefined)
            query = { _id: { $regex: req.query.name } };

        if (parseInt(req.query.limit) != undefined) {
            Recommendation.find(query, async function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    return res.status(200).json(data)
                }
            })
                .limit(parseInt(req.query.limit))
                .sort({ _id: 1 })
        } else {
            Recommendation.find(query, async function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    return res.status(200).json(data)
                }
            })
                .sort({ _id: 1 })
        }
    },

    evalDocs: async function (req, res) {
        let query = {};

        if (req.query.name != undefined)
            query = { candidato: { $regex: req.query.name } };

        if (parseInt(req.query.limit) != undefined) {
            Valuation.find(query, async function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    return res.status(200).json(data)
                }
            })
                .limit(parseInt(req.query.limit))
                .sort({ _id: 1 })
        } else {
            Valuation.find(query, async function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    return res.status(200).json(data)
                }
            })
                .sort({ _id: 1 })
        }
    },


    dishEval: async function (req, res) {
        console.log(req.body);

        const queryR = { _id: req.body.recommendation };
        const queryC = { _id: req.body.candidate };

        const recData = await myFunctionRecomendacion(queryR);
        const CanData = await myFunction(queryC);

        const nutrientes = await calculateNutrientsDish(CanData);
        const datos = await calculadora(recData, nutrientes);

        console.log("\n\n\n" + util.inspect(datos));
        return res.status(200).json(datos)


    },

    menuEval: async function (req, res) {
        console.log(req.body);

        const queryR = { _id: req.body.recommendation };
        const queryC = { _id: req.body.candidate };

        const recData = await myFunctionRecomendacion(queryR);
        const CanData = await myFunctionMenu(queryC);

        const nutrientes = await calculateNutrientsMenu(CanData[0]);

        const datos = await calculadora(recData, nutrientes);
        return res.status(200).json(datos)


    },

    planEval: async function (req, res) {

        console.log(req.body);

        const queryR = { _id: req.body.recommendation };
        const queryC = { _id: req.body.candidate };


        const recData = await myFunctionRecomendacion(queryR);
        const CanData = await myFunctionPlanification(queryC);

        const nutrientes = await calculateNutrientsPlanificacion(CanData);
        const datos = await calculadora(recData, nutrientes);

        console.log("\n\n\n" + util.inspect(datos));
        return res.status(200).json(datos)


    }

}


async function calculateNutrientsPlanificacion(doc) {
    let valores = [];
    for (let i = 0; i < doc[0].menus.length; i++) {
        for (let j = 0; j < doc[0].menus[i].length; j++) {


            const value = await calculateNutrientsMenu(doc[0].menus[i][j])
            valores.push(value);
        }
    }

    let newVector = [];
    let water = 0;
    let energKcal = 0;
    let protein = 0;
    let lipidTotal = 0;
    let carbohydrt = 0;
    let fiber = 0;
    let sodium = 0;
    let cholestrl = 0;
    let sugar = 0;



    for (let i = 0; i < valores.length; i++) {

        water += (parseFloat(valores[i][0]));
        energKcal += (parseFloat(valores[i][1]));
        protein += (parseFloat(valores[i][2]));
        lipidTotal += (parseFloat(valores[i][3]));
        carbohydrt += (parseFloat(valores[i][4]));
        fiber += (parseFloat(valores[i][5]));
        sodium += (parseFloat(valores[i][6]));
        cholestrl += (parseFloat(valores[i][7]));
        sugar += (parseFloat(valores[i][8]));

    }

    newVector.push(water.toFixed(2));
    newVector.push(energKcal.toFixed(2));
    newVector.push(protein.toFixed(2));
    newVector.push(lipidTotal.toFixed(2));
    newVector.push(carbohydrt.toFixed(2));
    newVector.push(fiber.toFixed(2));
    newVector.push(sodium.toFixed(2));
    newVector.push(cholestrl.toFixed(2));
    newVector.push(sugar.toFixed(2));
    return newVector;
}

async function myFunction(query) {
    return Dish.find(query).exec()
}

async function myFunctionMenu(query) {
    return Menu.find(query).exec()
}

async function myFunctionPlanification(query) {
    return Planification.find(query).exec()
}


async function myFunctionRecomendacion(query) {
    return Recommendation.find(query).exec()
}

async function calculateNutrientsDish(doc) {

    let nut_vector = [];
    for (let i = 0; i < doc[0].ingredients.length; i++) {
        const nutrients = await dish.storeNutrients(doc[0].ingredients[i]);
        nut_vector.push(nutrients);
    }

    const valores = dish.computeNutrients(doc[0].ingredients, nut_vector);
    const vector = [];
    vector.push(valores["water"]);
    vector.push(valores["energKcal"]);
    vector.push(valores["protein"]);
    vector.push(valores["lipidTotal"]);
    vector.push(valores["carbohydrt"]);
    vector.push(valores["fiber"]);
    vector.push(valores["sodium"]);
    vector.push(valores["sugar"]);
    vector.push(valores["cholestrl"]);

    return vector;
}


async function calculadora(recData, nutrientes) {


    const obj = {
        energia: [nutrientes[1], await energy(recData[0], nutrientes)],
        proteinas: [((nutrientes[2] * 4).toFixed(2)), await proteinas(recData[0], nutrientes)],
        lipidos: [((nutrientes[3] * 9).toFixed(2)), await lipidos(recData[0], nutrientes)],
        carbohidratos: [((nutrientes[4] * 4).toFixed(2)), await carbohidratos(recData[0], nutrientes)]
    }

    return (obj);

};

async function energy(recData, nutrientes) {
    if ((parseInt(nutrientes[1]) > recData.energyMin) && (parseInt(nutrientes[1]) < recData.energyMax)) {
        const resultEnergia = "Muy recomendable"

        return resultEnergia;
    } else if ((parseInt(nutrientes[1]) > recData.energyMin - 200) && (parseInt(nutrientes[1]) < recData.energyMax + 200)) {
        const resultEnergia = "Recomendable"

        return resultEnergia;
    } else {
        const resultEnergia = "No recomendable"

        return resultEnergia;
    }

};

async function proteinas(recData, nutrientes) {
    if (((parseInt(nutrientes[2]) * 4) > recData.proteinMin) && ((parseInt(nutrientes[2]) * 4) < recData.proteinMax)) {
        const resultproteins = "Muy recomendable"

        return resultproteins;
    } else if (((parseInt(nutrientes[2]) * 4) > recData.proteinMin - 50) && ((parseInt(nutrientes[2]) * 4) < recData.proteinMax + 50)) {
        const resultproteins = "Recomendable"
        return resultproteins;
    } else {
        const resultproteins = "No recomendable"

        return resultproteins;
    }

};

async function lipidos(recData, nutrientes) {
    if (((parseInt(nutrientes[3]) * 9) > recData.lipidsMin) && ((parseInt(nutrientes[3]) * 9) < recData.lipidsMax)) {
        const resultlipidos = "Muy recomendable"

        return resultlipidos;
    } else if (((parseInt(nutrientes[3]) * 9) > recData.lipidsMin - 100) && ((parseInt(nutrientes[3]) * 9) < recData.lipidsMax + 100)) {
        const resultlipidos = "Recomendable"

        return resultlipidos;
    } else {
        const resultlipidos = "No recomendable"

        return resultlipidos;
    }
};

async function carbohidratos(recData, nutrientes) {
    if (((parseInt(nutrientes[4]) * 4) > recData.carbohydrtMin) && ((parseInt(nutrientes[4]) * 4) < recData.carbohydrtMax)) {
        const resultcarbohidratos = "Muy recomendable"

        return resultcarbohidratos;
    } else if (((parseInt(nutrientes[4]) * 4) > recData.carbohydrtMin - 300) && ((parseInt(nutrientes[4]) * 4) < recData.carbohydrtMax + 300)) {
        const resultcarbohidratos = "Recomendable"

        return resultcarbohidratos;
    } else {
        const resultcarbohidratos = "No recomendable"

        return resultcarbohidratos;
    }

};

async function findAllDocuments(req, db, query, collection, callback) {
    if (parseInt(req.query.limit) != undefined) {
        collection
            .find(query)
            .limit(parseInt(req.query.limit))
            .sort({ ndb_no: 1 })
            .toArray(function (err, docs) {
                assert.equal(err, null);
                callback(docs);
            });
    } else {
        collection
            .find(query)
            .sort({ ndb_no: 1 })
            .toArray(function (err, docs) {
                assert.equal(err, null);
                callback(docs);
            });
    }

}


async function calculateNutrientsMenu(doc) {
    let vector = [];
    console.log(doc);
    for (let i = 0; i < doc.dishes.length; i++) {
        let nut_vector = []
        for (let j = 0; j < doc.dishes[i].ingredients.length; j++) {
            const nutrients = await dish.storeNutrients(doc.dishes[i].ingredients[j]);

            nut_vector.push(nutrients);
        }

        console.log("nut_vector: " + util.inspect(nut_vector))
        const valores = dish.computeNutrients(doc.dishes[i].ingredients, nut_vector);

        vector.push(valores);
    }


    let water = 0;
    let energKcal = 0;
    let protein = 0;
    let lipidTotal = 0;
    let carbohydrt = 0;
    let fiber = 0;
    let sodium = 0;
    let cholestrl = 0;
    let sugar = 0;

    for (let i = 0; i < vector.length; i++) {
        water += vector[i]["water"];
        energKcal += vector[i]["energKcal"];

        protein += vector[i]["protein"];
        lipidTotal += vector[i]["lipidTotal"];
        carbohydrt += vector[i]["carbohydrt"];
        fiber += vector[i]["fiber"];
        sodium += vector[i]["sodium"];
        cholestrl += vector[i]["cholestrl"];
        sugar += vector[i]["sugar"];
    }

    const total = [
        water.toFixed(2),
        energKcal.toFixed(2),
        protein.toFixed(2),
        lipidTotal.toFixed(2),
        carbohydrt.toFixed(2),
        fiber.toFixed(2),
        sugar.toFixed(2),
        sodium.toFixed(2),
        cholestrl.toFixed(2)

    ]

    return total;
}



module.exports = apiController;


