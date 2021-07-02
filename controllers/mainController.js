'use strict'

// MongoDB 
let mongo = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
let assert = require("assert");

const user = "jilorio";
const password = "jilorio";
const host = "127.0.0.0";
const port = "27017";
const name = "entullo";

const url = `mongodb+srv://${user}:${password}@entullo.q8g1t.mongodb.net/${name}?retryWrites=true&w=majority`
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });


const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')
const passport = require('passport')

// Lang template
const espTemplate = require("../templates/esp.json");
const dish = require("../public/javascripts/dish.js");
const usdaJson = require("../public/food.json");
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


// CIM NodeJS API Service
const CIMApiService = require('cim-api-service/src/CIMApiService').CIMApiService;
const cimConfig = require('../config/cim.js').getConfig();
const ApiService = new CIMApiService(cimConfig);


const EventEmitter = require('events');
const myEmitter = new EventEmitter();




async function myExample(resultArray){
    
    try {
        CIMApiService.dump(resultArray);
               
        const suma = await calculateKcal(resultArray);
        // console.log(suma);
        res.render('dish/getDish', {
            items: {
                req: req,
                myObject: espTemplate,
                myDocs: resultArray,
                myKcal: suma
            }
        });
      }
      catch (err) {
        console.log('fetch failed', err);
      }
    
}
// Routes

let controller = {


    cimTest: async function (req, res) {
        
        const RESOURCE = req.query.resource;
        const ROUTE_PREFIX = "/api/";
        const ROUTE_POSTFIX = "/transformed_list?context=ica";
        const FETCH_URL = `${ROUTE_PREFIX}${RESOURCE}${ROUTE_POSTFIX}`;

        ApiService.init().then((apiServiceInstance) => {
            console.log("............................. CIM -------------------> " + FETCH_URL);
            apiServiceInstance.getData(FETCH_URL).then(resultArray => {
                CIMApiService.dump(resultArray);
           
                res.render('cim/cim-test.ejs', {
                    items: {
                        req: req,
                        resource: RESOURCE,
                        myObject: espTemplate,
                        data: resultArray
                    }
                });
            })
        });
    },

    home: function (req, res) {
        return res.status(200).render('index.ejs', {
            items: {
                req: req,
                myObject: espTemplate
            }
        });
    },



    food: function (req, res) {
        return res.status(200).render('food/food.ejs', {
            items: {
                req: req,
                myObject: espTemplate
            }
        });
    },
    

    foodView: async function (req, res) {
 
        const RESOURCE = req.query.resource;
        
        const ROUTE_PREFIX = "/api/";
        const ROUTE_POSTFIX = "/transformed_list.json?pagination=false";
        const FETCH_URL = `${ROUTE_PREFIX}${RESOURCE}${ROUTE_POSTFIX}`;
     
        
        ApiService.init().then((apiServiceInstance) => {
            apiServiceInstance.getData(FETCH_URL).then(resultArray => {
                CIMApiService.dump(resultArray);
                
                myEmitter.emit('event', "ya");
                
                res.render('food/getFood', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: resultArray
                    }
                });
            })
        });
       

    },

    getFood: function (req, res) {
        const searchData = req.body.shrt_desc;
        
        if ((searchData == null) || (searchData == "")) {
            req.flash('success', espTemplate.errors.dishNotRemove);
        }
        const query = { shrt_desc: { $regex: searchData } };

        const RESOURCE = req.query.resource;
        const ROUTE_PREFIX = "/api/";
        const ROUTE_POSTFIX = "/transformed_list.json?pagination=false";
        let fetch_url = "";

        if (searchData !=''){
            fetch_url = `${ROUTE_PREFIX}${RESOURCE}${ROUTE_POSTFIX}&name=${searchData}`;
        }else{
            fetch_url = `${ROUTE_PREFIX}${RESOURCE}${ROUTE_POSTFIX}`;
        }
        console.log(fetch_url);
        ApiService.init().then((apiServiceInstance) => {
            apiServiceInstance.getData(fetch_url).then(resultArray => {
                CIMApiService.dump(resultArray);
                console.log(resultArray);
                res.render('food/getFood', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: resultArray
                    }
                });
            })
        });


    },

    dish: function (req, res) {
    
        return res.status(200).render('dish/dish.ejs', {
            items: {
                req: req,
                myObject: espTemplate
            }
        });
    },

    dishView: async function (req, res) {

        const RESOURCE = req.query.resource;
        const ROUTE_PREFIX = "/api/";
        const ROUTE_POSTFIX = "/transformed_list?context=ica";
        const FETCH_URL = `${ROUTE_PREFIX}${RESOURCE}${ROUTE_POSTFIX}`;

        ApiService.init().then((apiServiceInstance) => {
            apiServiceInstance.getData(FETCH_URL).then(resultArray => {
                myExample(resultArray);
            })
        });

        // Dish.find({}, async function (err, docs) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         console.log(docs[0]);
        //         const suma = await calculateKcal(docs);

        //         res.render('dish/getDish', {
        //             items: {
        //                 req: req,
        //                 myObject: espTemplate,
        //                 myDocs: docs,
        //                 myKcal: suma

        //             }
        //         });
        //     }
        // }).sort({ _id: 1 })
    },

    dishDetails: async function (req, res) {

        let query = {};
        if (req.query.name != undefined)
            query = { _id: { $regex: req.query["name"] } };


        Dish.find(query, async function (err, doc) {
            if (err) {
                console.log(err);
            } else {
                const nutrientes = await calculateNutrients(doc);

                res.render('dish/dishDetails', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: doc[0],
                        myNutrients: nutrientes[0],
                        myNutIngredients: nutrientes[1]
                    }
                });
            }
        }).sort({ _id: 1 })
    },

    getDish: async function (req, res) {

        const searchData = req.body._id;
        if ((searchData == null) || (searchData == "")) {
            req.flash('danger', espTemplate.errors.dishNotExist);
        }

        const query = { _id: { $regex: `${searchData}` } };

        Dish.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {

                const suma = await calculateKcal(docs);
                res.render('dish/getDish', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: docs,
                        myKcal: suma
                    }
                });
            }
        }).sort({ _id: 1 })
    },
 
    downloadDish: async function (req, res) {

        const searchData = req.params._id;

        const query = { _id: searchData };

        Dish.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                const nutrientes = await calculateNutrients(docs);
                let filename = docs[0]._id + '.json';
                let absPath = path.join(__dirname, filename);
                var beautify = require('js-beautify').js;
                let json = beautify(JSON.stringify(docs), { indent_size: 4, space_in_empty_paren: true })

                fs.writeFile(absPath, json, (err) => {
                    if (err) {
                        console.log(err);
                    }
                    res.download(absPath, (err) => {
                        if (err) {
                            console.log(err);
                        }

                    });
                });
            }
        });

    },



    menu: function (req, res) {
        return res.status(200).render('menu/menu.ejs', {
            items: {
                req: req,
                myObject: espTemplate
            }
        });
    },

    menuView: async function (req, res) {
        Menu.find({}, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                let valores = [];
                for (let i = 0; i < docs.length; i++) {
                    const value = await calculateNutrientsMenu(docs[i])
                    valores.push(value);
                }

                res.render('menu/getMenu', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: docs,
                        myNutrientsMenu: valores,

                    }
                });
            }
        }).sort({ _id: 1 })
    },

    getMenu: async function (req, res) {
        const searchData = req.body["_id"];

        if ((searchData == null) || (searchData == "")) {
            req.flash('danger', espTemplate.errors.dishNotRemove);

        }

        const query = { _id: { $regex: `${searchData}` } };

        Menu.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                let valores = [];
                for (let i = 0; i < docs.length; i++) {
                    const value = await calculateNutrientsMenu(docs[i])
                    valores.push(value);
                }

                res.render('menu/getMenu', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: docs,
                        myNutrientsMenu: valores
                    }
                });
            }
        }).sort({ _id: 1 })
    },

    menuDetails: async function (req, res) {

        let menuId = req.params._id;
        const query = { _id: menuId };

        Menu.find(query, async function (err, doc) {
            if (err) {
                console.log(err);
            } else {

                let valores = [];
                valores = await calculateNutrientsMenu(doc[0]);
                let kcalPlatos = [];
                const kcal = await calculateKcal(doc[0].dishes);

                kcalPlatos.push(kcal);

                res.render('menu/menuDetails', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: doc[0],
                        myNutrientsMenu: valores,
                        myKcalDishes: kcalPlatos[0]
                    }
                });
            }
        }).sort({ _id: 1 })
    },

    downloadMenu: async function (req, res) {

        const searchData = req.params._id;

        const query = { _id: searchData };

        Menu.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {

                let filename = docs[0]._id + '.json';
                let absPath = path.join(__dirname, filename);

                var beautify = require('js-beautify').js;
                let json = beautify(JSON.stringify(docs), { indent_size: 4, space_in_empty_paren: true })

                fs.writeFile(absPath, json, (err) => {
                    if (err) {
                        console.log(err);
                    }
                    res.download(absPath, (err) => {
                        if (err) {
                            console.log(err);
                        }

                    });
                });
            }
        });

    },


    planification: function (req, res) {
        return res.status(200).render('planification/planification.ejs', {
            items: {
                req: req,
                myObject: espTemplate
            }
        });
    },



    planificationView: async function (req, res) {
        Planification.find({}, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                res.render('planification/getPlanification', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: docs

                    }
                });
            }
        }).sort({ _id: 1 })
    },



    getPlanification: async function (req, res) {
        const searchData = req.body["_id"];

        if ((searchData == null) || (searchData == "")) {
            req.flash('danger', espTemplate.errors.dishNotRemove);

        }

        const query = { _id: { $regex: `${searchData}` } };


        Planification.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {

                res.render('planification/getPlanification', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: docs

                    }
                });
            }
        }).sort({ _id: 1 })
    },

    planificationDetails: async function (req, res) {
        let planificationId = req.params._id;
        const query = { _id: planificationId };


        Planification.find(query, async function (err, doc) {
            if (err) {
                console.log(err);
            } else {
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


                res.render('planification/planificationDetails', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: doc[0],
                        myNutrients: newVector
                    }
                });
            }
        }).sort({ _id: 1 })
    },

    downloadPlanification: async function (req, res) {

        const searchData = req.params._id;

        const query = { _id: searchData };

        Planification.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {

                let filename = docs[0]._id + '.json';
                let absPath = path.join(__dirname, filename);

                var beautify = require('js-beautify').js;
                let json = beautify(JSON.stringify(docs), { indent_size: 4, space_in_empty_paren: true })

                fs.writeFile(absPath, json, (err) => {
                    if (err) {
                        console.log(err);
                    }
                    res.download(absPath, (err) => {
                        if (err) {
                            console.log(err);
                        }

                    });
                });
            }
        });

    },


    recommendation: function (req, res) {
        return res.status(200).render('recommendation/recommendation.ejs', {
            items: {
                req: req,
                myObject: espTemplate
            }
        });
    },

    recommendationView: function (req, res) {
        Recommendation.find({}, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                res.render('recommendation/recommendationView.ejs', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: docs
                    }
                });
            }
        }).sort({ _id: 1 })

    },


    getRecommendation: async function (req, res) {

        const searchData = req.body._id;
        if ((searchData == null) || (searchData == "")) {
            req.flash('danger', espTemplate.errors.dishNotRemove);
        }

        const query = { _id: { $regex: `${searchData}` } };

        Recommendation.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                res.render('recommendation/recommendationView.ejs', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: docs
                    }
                });
            }
        }).sort({ _id: 1 })
    },



    recommendationDetails: function (req, res) {
        let dishId = req.params._id;

        const query = { _id: dishId };


        Recommendation.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                res.render('recommendation/recommendationDetails.ejs', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: docs[0]
                    }
                });
            }
        }).sort({ _id: 1 })

    },

    removeRecommendation: function (req, res) {

        let recId = req.params._id;

        Recommendation.findByIdAndRemove(recId, (err, recRemoved) => {
            if (err) {
                return req.flash('danger', espTemplate.errors.recRemoveError);
            }
            if (!recRemoved) {
                return req.flash('danger', espTemplate.errors.recRemoveError);
            }


            res.redirect("/recommendation/view")



        })
    },

    insertRecommendation: function (req, res) {

        res.render('recommendation/recommendationInsert', {
            items: {
                req: req,
                myObject: espTemplate

            }
        });

    },

    insertRecommendationPost: function (req, res) {

        const _id = req.body._id;
        const description = req.body.description;
        const edad = req.body.edad;




        let errors = [];
        if (parseInt(req.body.energyMin) > parseInt(req.body.energyMax)) {
            errors.push({ msg: espTemplate.errors.enerComp });
        }
        if (parseInt(req.body.lipidsMin) > parseInt(req.body.lipidsMax)) {
            errors.push({ msg: espTemplate.errors.lipidComp });
        }
        if (parseInt(req.body.proteinMin) > parseInt(req.body.proteinMax)) {
            errors.push({ msg: espTemplate.errors.protComp });
        }
        if (parseInt(req.body.carbohydrtMin) > parseInt(req.body.carbohydrtMax)) {
            errors.push({ msg: espTemplate.errors.carbComp });
        }

        if (errors.length > 0) {
            return res.render("recommendation/recommendationInsert", {
                items: {
                    errors,
                    req: req,
                    myObject: espTemplate
                }
            })
        } else {


            const energyMin = req.body.energyMin;
            const energyMax = req.body.energyMax;
            const lipidsMin = req.body.lipidsMin;
            const lipidsMax = req.body.lipidsMax;
            const proteinMin = req.body.proteinMin;
            const proteinMax = req.body.proteinMax;
            const carbohydrtMin = req.body.carbohydrtMin;
            const carbohydrtMax = req.body.carbohydrtMax;

            const recomendacion = new Recommendation({
                _id: _id,
                description: description,
                edad: edad,
                energyMin: energyMin,
                energyMax: energyMax,
                lipidsMin: lipidsMin,
                lipidsMax: lipidsMax,
                proteinMin: proteinMin,
                proteinMax: proteinMax,
                carbohydrtMin: carbohydrtMin,
                carbohydrtMax: carbohydrtMax
            });

            recomendacion.save(async function (err) {
                if (err) {
                    console.log(err);
                } else {
                    Recommendation.find({}, async function (err, docs) {
                        if (err) {
                            console.log(err);
                        } else {

                            res.redirect("view")

                        }
                    }).sort({ _id: 1 })

                }
            })
        }
    },

    updateRecommendation: function (req, res) {
        let recId = req.params._id;
        const query = { _id: recId };

        Recommendation.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {

                res.render('recommendation/updateRecommendation.ejs', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: docs[0]
                    }
                });
            }
        }).sort({ _id: 1 })

    },


    updateRecommendationPost: function (req, res) {

        const query = { _id: req.params._id };
        let errors = [];

        if (parseInt(req.body.energyMin) > parseInt(req.body.energyMax)) {
            errors.push({ msg: espTemplate.errors.enerComp });
        }
        if (parseInt(req.body.lipidsMin) > parseInt(req.body.lipidsMax)) {
            errors.push({ msg: espTemplate.errors.lipidComp });
        }
        if (parseInt(req.body.proteinMin) > parseInt(req.body.proteinMax)) {
            errors.push({ msg: espTemplate.errors.protComp });
        }
        if (parseInt(req.body.carbohydrtMin) > parseInt(req.body.carbohydrtMax)) {
            errors.push({ msg: espTemplate.errors.carbComp });
        }

        if (errors.length > 0) {
            let recId = req.params._id;
            const query = { _id: recId };

            Recommendation.find(query, async function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    res.render('recommendation/updateRecommendation.ejs', {
                        items: {
                            req: req,
                            myObject: espTemplate,
                            myDocs: docs[0],
                            errors
                        }
                    });
                }
            }).sort({ _id: 1 })
        } else {


            const description = req.body.description;
            const edad = req.body.edad;
            const energyMin = req.body.energyMin;
            const energyMax = req.body.energyMax;
            const lipidsMin = req.body.lipidsMin;
            const lipidsMax = req.body.lipidsMax;
            const proteinMin = req.body.proteinMin;
            const proteinMax = req.body.proteinMax;
            const carbohydrtMin = req.body.carbohydrtMin;
            const carbohydrtMax = req.body.carbohydrtMax;

            const recomendacion = {

                description: description,
                edad: edad,
                energyMin: energyMin,
                energyMax: energyMax,
                lipidsMin: lipidsMin,
                lipidsMax: lipidsMax,
                proteinMin: proteinMin,
                proteinMax: proteinMax,
                carbohydrtMin: carbohydrtMin,
                carbohydrtMax: carbohydrtMax
            };
            Recommendation.findById(query).then(recEncontrado => {
                if (recEncontrado) {


                    const set = { $set: recomendacion };

                    Recommendation.updateOne(query, set, (err, updatedRec) => {
                        if (err) {
                            console.log(err);
                        } else {

                            req.flash(
                                'success_msg',
                                espTemplate.success.updateRec
                            );
                            res.redirect('/recommendation/view');
                        }
                    })
                }
            });
        }

    },

    insertRecommendationJson: async function (req, res, next) {
        var beautify = require('js-beautify').js;
        let json = require("../public/recExample.json")
        json = beautify(JSON.stringify(json), { indent_size: 2, space_in_empty_paren: true })

        res.render('recommendation/insertRecommendationJson', {
            items: {
                req: req,
                myObject: espTemplate,
                json: json
            }
        });
    },

    insertRecommendationJsonPost: async function (req, res, next) {
        let errors = [];

        if (!req.files) {
            errors.push({ msg: espTemplate.errors.dishNotRemove });
            showErrorsRecJson(errors, req, res);


        } else {


            let file = req.files.filename;  // here is the field name of the form

            const valor = JSON.parse(file.data)


            if (valor.length === 0) {
                errors.push({ msg: espTemplate.errors.recNotFound });
                return showErrorsRecJson(errors, req, res);
            } else {

                for (let i = 0; i < valor.length; i++) {

                    const title = valor[i]._id;
                    const description = valor[i].description;
                    const edad = valor[i].edad;
                    const energyMax = valor[i].energyMax;
                    const energyMin = valor[i].energyMin;
                    const lipidsMax = valor[i].lipidsMax;
                    const lipidsMin = valor[i].lipidsMin;
                    const proteinMax = valor[i].proteinMax;
                    const proteinMin = valor[i].proteinMin;
                    const carbohydrtMax = valor[i].carbohydrtMax;
                    const carbohydrtMin = valor[i].carbohydrtMin;

                    if (!title) {
                        errors.push({ msg: espTemplate.errors.recTitle });
                    }
                    if ((title === "") || (typeof title != "string")) {
                        errors.push({ msg: espTemplate.errors.recTitleString });
                    }
                    //////////////////////////////
                    if ((description === "") || (typeof description != "string")) {
                        errors.push({ msg: espTemplate.errors.recDescString });
                    }
                    //////////////////////////////
                    if (!edad) {
                        errors.push({ msg: espTemplate.errors.recEdad });
                    }
                    if ((edad === "") || (typeof edad != "string")) {
                        errors.push({ msg: espTemplate.errors.recEdadString });
                    }
                    //////////////////////////////
                    if (!energyMax) {
                        errors.push({ msg: espTemplate.errors.recEnergyMax });
                    }
                    if ((typeof energyMax != "number")) {
                        errors.push({ msg: espTemplate.errors.recEnergyMaxNumber });
                    }
                    if (parseInt(energyMax) < 1) {
                        errors.push({ msg: espTemplate.errors.recEnergyMaxMin });
                    }
                    if (!energyMin) {
                        errors.push({ msg: espTemplate.errors.recEnergyMin });
                    }
                    if ((typeof energyMin != "number")) {
                        errors.push({ msg: espTemplate.errors.recEnergyMinNumber });
                    }
                    if (parseInt(energyMin) < 1) {
                        errors.push({ msg: espTemplate.errors.recEnergyMinMin });
                    }
                    if (parseInt(energyMin) > parseInt(energyMax)) {
                        errors.push({ msg: espTemplate.errors.recEnergyMax });
                    }
                    //////////////////////////////
                    if (!lipidsMax) {
                        errors.push({ msg: espTemplate.errors.recLipidMax });
                    }
                    if ((typeof lipidsMax != "number")) {
                        errors.push({ msg: espTemplate.errors.recLipidMaxNumber });
                    }
                    if (parseInt(lipidsMax) < 1) {
                        errors.push({ msg: espTemplate.errors.recLipidMaxMin });
                    }
                    if (!lipidsMin) {
                        errors.push({ msg: espTemplate.errors.recLipidMin });
                    }
                    if (typeof lipidsMin != "number") {
                        errors.push({ msg: espTemplate.errors.recLipidMinNumber });
                    }
                    if (parseInt(lipidsMin) < 1) {
                        errors.push({ msg: espTemplate.errors.recLipidMinMin });
                    }
                    if (parseInt(lipidsMin) > parseInt(lipidsMax)) {
                        errors.push({ msg: espTemplate.errors.recCompLipidMinMax });
                    }
                    //////////////////////////////
                    if (!proteinMax) {
                        errors.push({ msg: espTemplate.errors.recProtMax });
                    }
                    if ((typeof proteinMax != "number")) {
                        errors.push({ msg: espTemplate.errors.recProtMaxNumber });
                    }
                    if (parseInt(proteinMax) < 1) {
                        errors.push({ msg: espTemplate.errors.recProtMaxMin });
                    }
                    if (!proteinMin) {
                        errors.push({ msg: espTemplate.errors.recProtMin });
                    }
                    if ((typeof proteinMin != "number")) {
                        errors.push({ msg: espTemplate.errors.recProtMinNumber });
                    }
                    if (parseInt(proteinMin) < 1) {
                        errors.push({ msg: espTemplate.errors.recProtMinMin });
                    }
                    if (parseInt(proteinMin) > parseInt(proteinMax)) {
                        errors.push({ msg: espTemplate.errors.recCompProtMinMax });
                    }
                    //////////////////////////////
                    if (!carbohydrtMax) {
                        errors.push({ msg: espTemplate.errors.recCarboMax });
                    }
                    if (typeof carbohydrtMax != "number") {
                        errors.push({ msg: espTemplate.errors.recCarboMaxNumber });
                    }
                    if (parseInt(carbohydrtMax) < 1) {
                        errors.push({ msg: espTemplate.errors.recCarboMaxMin });
                    }
                    if (!carbohydrtMin) {
                        errors.push({ msg: espTemplate.errors.recCarboMin });
                    }
                    if ((typeof carbohydrtMin != "number")) {
                        errors.push({ msg: espTemplate.errors.recCarboMinNumber });
                    }
                    if (parseInt(carbohydrtMin) < 1) {
                        errors.push({ msg: espTemplate.errors.recCarboMinMin });
                    }
                    if (parseInt(carbohydrtMin) > parseInt(carbohydrtMax)) {
                        errors.push({ msg: espTemplate.errors.recCompCarboMinMax });
                    }

                    if (errors.length > 0) {
                        return showErrorsRecJson(errors, req, res);
                    } else {
                        const recommendation = new Recommendation({
                            _id: title,
                            description: description,
                            edad: edad,
                            energyMin: energyMin,
                            energyMax: energyMax,
                            lipidsMin: lipidsMin,
                            lipidsMax: lipidsMax,
                            proteinMin: proteinMin,
                            proteinMax: proteinMax,
                            carbohydrtMin: carbohydrtMin,
                            carbohydrtMax: carbohydrtMax

                        });

                        recommendation.save()
                            .then(data => {
                                if ((i + 1) === valor.length) {
                                    return res.redirect("/recommendation/view");
                                }


                            }).catch(err => {
                                res.status(500).send({
                                    message: err.message
                                });
                            });
                    }
                }
            }

        }
    },

    downloadRecommendation: async function (req, res) {

        const searchData = req.params._id;

        const query = { _id: searchData };

        Recommendation.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {

                let filename = docs[0]._id + '.json';
                let absPath = path.join(__dirname, filename);

                var beautify = require('js-beautify').js;
                let json = beautify(JSON.stringify(docs), { indent_size: 4, space_in_empty_paren: true })

                fs.writeFile(absPath, json, (err) => {
                    if (err) {
                        console.log(err);
                    }
                    res.download(absPath, (err) => {
                        if (err) {
                            console.log(err);
                        }

                    });
                });
            }
        });

    },


    evaluation: function (req, res) {
        return res.status(200).render('evaluation/evaluation.ejs', {
            items: {
                req: req,
                myObject: espTemplate
            }
        });
    },


    evaluationView: function (req, res) {
        Valuation.find({}, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {

                res.render('evaluation/getEvaluation.ejs', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: docs
                    }
                });
            }
        }).sort({ _id: 1 })

    },

    getEvaluation: function (req, res) {

        const searchData = req.body._id;
        if ((searchData == null) || (searchData == "")) {
            req.flash('danger', espTemplate.errors.dishNotRemove);
        }

        let query = { candidato: { $regex: `${searchData}` } };


        Valuation.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {

                res.render('evaluation/getEvaluation.ejs', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: docs
                    }
                });
            }
        }).sort({ _id: 1 })

    },

    createEvaluation: function (req, res) {

        Recommendation.find({}, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                const recomendaciones = docs;
                Dish.find({}, async function (err, docs) {
                    if (err) {
                        console.log(err);
                    } else {
                        const platos = docs;
                        Menu.find({}, async function (err, docs) {
                            if (err) {
                                console.log(err);
                            } else {
                                const menus = docs;
                                Planification.find({}, async function (err, docs) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        const planificaciones = docs;
                                        return res.status(200).render('evaluation/createEvaluation.ejs', {
                                            items: {
                                                req: req,
                                                myObject: espTemplate,
                                                myRecommendations: recomendaciones,
                                                myDishes: platos,
                                                myMenus: menus,
                                                myPlanifications: planificaciones

                                            }
                                        });
                                    }
                                }).sort({ _id: 1 })
                            }
                        }).sort({ _id: 1 })
                    }
                }).sort({ _id: 1 })
            }
        }).sort({ _id: 1 })

    },

    createEvaluationPost: async function (req, res) {

        const recomendacion = req.body.recomendacion;
        const tipo = req.body.tipos;
        const candidato = req.body.select;

        const resultado = await evaluador(recomendacion, tipo, candidato);

        const valuation = new Valuation({
            recomendacion: recomendacion,
            tipo: tipo,
            candidato: candidato,
            resultados: resultado

        });


        valuation.save()
            .then(data => {
                res.send(data);
            }).catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });

    },

    removeEvaluation: function (req, res) {

        let evalId = req.params.id;

        Valuation.findByIdAndRemove(evalId, (err, evalIdRemoved) => {
            if (err) {
                return req.flash('danger', espTemplate.errors.errSaveEvaluation);
            }
            if (!evalIdRemoved) {
                return req.flash('danger', espTemplate.errors.errSaveEvaluation);
            }

            Valuation.find({}, async function (err, docs) {
                if (err) {
                    console.log(err);
                } else {

                    res.redirect('/evaluation/view')
                }
            }).sort({ _id: 1 })

        })
    },

    register: function (req, res) {
        res.render('user/register', {
            items: {
                req: req,
                myObject: espTemplate
            }
        });
    },

    newUser: function (req, res) {
        const { name, email, username, password, password2 } = req.body;
        let errors = [];

        if (!name || !email || !username || !password || !password2) {
            errors.push({ msg: espTemplate.errors.userRegFields });
        }

        const regex = new RegExp(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);

        if (!email.match(regex)) {
            errors.push({ msg: espTemplate.errors.userRegEmail });
        }



        if (password != password2) {
            errors.push({ msg: espTemplate.errors.userRegPasswordDif });
        }

        if (password.length < 6) {
            errors.push({ msg: espTemplate.errors.userRegPasswordTam });
        }

        if (errors.length > 0) {
            res.render('user/register', {
                items: {
                    req: req,
                    myObject: espTemplate,
                    errors,
                    name,
                    email,
                    username,
                    password,
                    password2
                }
            });
        } else {
            User.findOne({ email: email }).then(user => {

                if (user) {
                    errors.push({ msg: espTemplate.errors.userRegEmailExist });
                    res.render('user/register', {
                        items: {
                            req: req,
                            myObject: espTemplate,
                            errors,
                            name,
                            email,
                            username,
                            password,
                            password2
                        }
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        username,
                        password
                    });

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser
                                .save()
                                .then(user => {

                                    req.flash(
                                        'success_msg',
                                        espTemplate.success.userRegCorrect
                                    );
                                    res.redirect('/login');
                                })
                                .catch(err => console.log(err));
                        });
                    });
                }
            });
        }
    },

    login: function (req, res) {
        const errors = req.flash().error || [];
        res.render('user/login', {
            items: {
                req: req,
                myObject: espTemplate,
                errors: errors
            }
        });
    },

    viewUsers: function (req, res) {

        Users.find({}, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {

                res.render('user/users', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myUsers: docs
                    }
                });
            }
        }).sort({ _id: 1 })

    },


    viewUsersPost: function (req, res) {

        const searchData = req.body._id;
        if ((searchData == null) || (searchData == "")) {
            req.flash('danger', espTemplate.errors.dishNotRemove);
        }

        const query = { name: { $regex: `${searchData}` } };
        Users.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {

                res.render('user/users', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myUsers: docs
                    }
                });
            }
        }).sort({ _id: 1 })

    },

    removeUser: function (req, res) {
        let userId = req.params._id;

        Users.findByIdAndRemove(userId, (err, userId) => {
            if (err) {
                return req.flash('danger', espTemplate.errors.errDeleteUser);
            }
            if (!userId) {
                return req.flash('danger', espTemplate.errors.errDeleteUser);
            }

            Users.find({}, async function (err, docs) {
                if (err) {
                    console.log(err);
                } else {

                    res.render('user/users', {
                        items: {
                            req: req,
                            myObject: espTemplate,
                            myUsers: docs

                        }
                    });
                }
            }).sort({ _id: 1 })

        })
    },

    updateUser: function (req, res) {
        let userId = req.params._id;

        const query = { _id: userId };
        Users.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {

                res.render('user/updateUser', {
                    items: {
                        id: userId,
                        req: req,
                        myObject: espTemplate,
                        myUsers: docs
                    }
                });
            }
        }).sort({ _id: 1 })

    },

    updateUserPost: function (req, res) {

        const { name, email, username, password, password2, rol } = req.body;
        let errors = [];

        if (!name || !email || !username || !rol) {
            errors.push({ msg: espTemplate.errors.userRegFields });
        }

        const regex = new RegExp(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);

        if (!email.match(regex)) {
            errors.push({ msg: espTemplate.errors.userRegEmail });
        }


        req.checkBody('req.body.email', espTemplate.errors.userRegEmail).notEmpty();

        if ((password.length > 0) || (password2.length > 0)) {
            if (password != password2) {
                errors.push({ msg: espTemplate.errors.userRegPasswordDif });
            }

            if (password.length < 6) {
                errors.push({ msg: espTemplate.errors.userRegPasswordTam });
            }
        }


        if (errors.length > 0) {

            Users.find({ _id: req.params._id }, async function (err, docs) {
                if (err) {
                    console.log(err);
                } else {


                    res.render('user/updateUser', {
                        items: {
                            id: req.params._id,
                            req: req,
                            myObject: espTemplate,
                            errors,
                            name,
                            email,
                            username,
                            password,
                            password2,
                            rol,
                            myUsers: docs
                        }
                    });
                }
            }).sort({ _id: 1 })
        } else {
            const query = { _id: req.params._id };
            const id = req.params._id;

            if (password.length > 0) {
                var newvalues = { name: name, username: username, rol: rol, email: email, password: password };
            } else {
                var newvalues = { name: name, username: username, rol: rol, email: email };
            }

            User.findById(query).then(user => {
                if (user) {

                    const newUser = {
                        name,
                        email,
                        username,
                        rol
                    };

                    if (newvalues.password) {
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(newvalues.password, salt, (err, hash) => {
                                if (err) throw err;

                                newUser.password = hash;
                                const set = { $set: newUser };

                                Users.updateOne(query, set, (err, updateUser) => {
                                    if (err) {
                                        console.log(err);
                                    } else {

                                        req.flash(
                                            'success_msg',
                                            espTemplate.errors.updateUser
                                        );
                                        res.redirect('/users');
                                    }
                                })

                            });
                        });
                    } else {
                        const set = { $set: newUser };

                        Users.updateOne(query, set, (err, updateUser) => {
                            if (err) {
                                console.log(err);
                            } else {

                                req.flash(
                                    'success_msg',
                                    espTemplate.errors.updateUser
                                );
                                res.redirect('/users');
                            }
                        })

                    }
                }

            });

        }

    },


    logUser: function (req, res, next) {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res, next);

    },

    all: function (req, res, next) {
        res.locals.user = req.user || null;
        next();
    },

    dashboard: function (req, res) {
        res.render('user/dashboard', {
            items: {
                rol: req.user.rol,
                myObject: espTemplate
            }
        });
    },

    logout: function (req, res) {
        req.logout();
        req.flash('success_msg', espTemplate.errors.logOut);
        res.redirect('/login');

    },

    autocomplete: function (req, res) {
        const query = { shrt_desc: { $regex: req.query["term"] } };

        client.connect(function (err, client) {
            assert.equal(null, err);
            console.log("\nConnected successfully to server");
            const db = client.db(name);
            const collection = db.collection("food");
            findLimit(db, query, collection, function (data) {

                let vector = [];
                data.forEach(element => {
                    let obj = {
                        id: element._id,
                        label: element.shrt_desc,
                        ndbno: element.ndb_no
                    };
                    vector.push(obj);
                });


                res.jsonp(vector);

            });
        });
    },

    autocomplete2: function (req, res) {
        const query = { shrt_desc: { $regex: req.query["term"] } };

        client.connect(function (err, client) {
            assert.equal(null, err);
            console.log("\nConnected successfully to server");
            const db = client.db(name);
            const collection = db.collection("food");
            findLimit(db, query, collection, function (data) {

                let vector = [];
                data.forEach(element => {
                    let obj = {
                        id: element._id,
                        label: element.shrt_desc,
                        ndbno: element.ndb_no
                    };
                    vector.push(obj);
                });


                res.jsonp(vector);

            });
        });
    },

    autocompleteMenu: function (req, res) {
        const query = { _id: { $regex: req.query["term"] } };

        Dish.find(query, async function (err, docs) {
            if (err) {

                console.log(err);
            } else {

                let vector = [];
                docs.forEach(element => {
                    let obj = {
                        id: element._id,
                        label: element._id,
                        ndbno: element.ndb_no
                    };
                    vector.push(obj);
                });


                res.jsonp(vector);
            }
        }).sort({ _id: 1 })

    },

    autocompleteMenu2: function (req, res) {
        const query = { _id: { $regex: req.query["term"] } };

        Dish.find(query, async function (err, docs) {
            if (err) {

                console.log(err);
            } else {

                let vector = [];
                docs.forEach(element => {
                    let obj = {
                        id: element._id,
                        label: element._id,
                        ndbno: element.ndb_no
                    };
                    vector.push(obj);
                });


                res.jsonp(vector);
            }
        }).sort({ _id: 1 })

    },
    autocompletePlanificacion: function (req, res) {
        const query = { _id: { $regex: req.query["term"] } };

        Menu.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {

                let vector = [];
                docs.forEach(element => {
                    let obj = {
                        id: element._id,
                        label: element._id,
                        ndbno: element.ndb_no
                    };
                    vector.push(obj);
                });


                res.jsonp(vector);
            }
        }).sort({ _id: 1 })
    },

    loadDataDishes: function (req, res) {


        Dish.find()
            .then(dishes => {
                res.send(dishes);
            }).catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });

    },
    loadDataMenus: function (req, res) {


        Menu.find()
            .then(menus => {
                res.send(menus);
            }).catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });

    },
    loadDataPlanifications: function (req, res) {


        Planification.find()
            .then(plans => {
                res.send(plans);
            }).catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });

    }

};


async function findAllDocuments(db, query, collection, callback) {

    collection
        .find(query)
        .limit(200)
        .sort({ ndb_no: 1 })
        .toArray(function (err, docs) {
            assert.equal(err, null);
            callback(docs);
        });
}





async function findLimit(db, query, collection, callback) {

    collection
        .find(query)
        .limit(15)
        .sort({ ndb_no: 1 })
        .toArray(function (err, docs) {
            assert.equal(err, null);

            callback(docs);
        });

}

async function calculateKcal(docs) {

    let sumasKcal = [];
    for (let i = 0; i < docs.length; i++) {
        let nut_vector = [];
        for (const ingrediente in docs[i].ingredients) {
            console.log("------ CALCULANDO KCALORIAS -----");
            const nutrients = await dish.storeNutrients(docs[i].ingredients[ingrediente]);
            console.log("NUTRIENTS: " + util.inspect(nutrients));
            nut_vector.push(nutrients);

        }
        let suma = 0;


        // const valores = dish.computeNutrients(docs[i].ingredients, nut_vector);

        // sumasKcal.push(valores.energKcal);

    }

    return sumasKcal;
}

async function calculateNutrients(doc) {

    let nut_vector = [];
    for (let i = 0; i < doc[0].ingredients.length; i++) {
        const nutrients = await dish.storeNutrients(doc[0].ingredients[i]);
        nut_vector.push(nutrients);
    }

    const valores = dish.computeNutrients(doc[0].ingredients, nut_vector);
    let vector = [valores, nut_vector];
    return vector;
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


async function calculateNutrientsMenu(doc) {
    let vector = [];

    for (let i = 0; i < doc.dishes.length; i++) {
        let nut_vector = []
        for (let j = 0; j < doc.dishes[i].ingredients.length; j++) {
            const nutrients = await dish.storeNutrients(doc.dishes[i].ingredients[j]);

            nut_vector.push(nutrients);
        }

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




async function evaluador(recomendacion, tipo, candidato) {
    let resultados = [];
    const queryR = { _id: recomendacion };
    const recData = await myFunctionRecomendacion(queryR);


    if (tipo === "0") {

        const queryC = { _id: candidato };

        const CanData = await myFunction(queryC);

        const nutrientes = await calculateNutrientsDish(CanData);

        const datos = await calculadora(recData, nutrientes);

        return datos;

    } else if (tipo === "1") {

        const queryC = { _id: candidato };
        const CanData = await myFunctionMenu(queryC);

        const nutrientes = await calculateNutrientsMenu(CanData[0]);

        const datos = await calculadora(recData, nutrientes);

        return datos;
    } else if (tipo === "2") {

        const queryC = { _id: candidato };
        const CanData = await myFunctionPlanification(queryC);

        const nutrientes = await calculateNutrientsPlanificacion(CanData);

        const datos = await calculadora(recData, nutrientes);

        return datos;
    }



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


function showErrorsRecJson(errors, req, res) {

    return res.render('recommendation/insertRecommendationJson', {
        items: {
            req: req,
            myObject: espTemplate,
            errors
        }
    });
}




module.exports = controller;

