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
const url = "mongodb://jilorio:cl0udcanteen@ds123662.mlab.com:23662/heroku_zp6jl2nt";
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
const Food = require("../models/food");



const { Console } = require("console");
const { db } = require("../models/dish");
const { query } = require("express");
const { resolve } = require("path");

let ingredientes = [];
// Routes
let controller = {
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

    foodView: function (req, res) {
        const query = {};
        client.connect(function (err, client) {
            assert.equal(null, err);
            console.log("\nConnected successfully to server");
            const db = client.db(name);
            const collection = db.collection("food");
            findAllDocuments(db, query, collection, function (data) {
                let resultArray = data;
                res.render('food/getFood', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: resultArray
                    }
                });
            });
        });

    },

    getFood: function (req, res) {
        const searchData = req.body.shrt_desc;

        if ((searchData == null) || (searchData == "")) {
            req.flash('success', espTemplate.errors.dishNotRemove);
        }
        const query = { shrt_desc: { $regex: searchData } };

        client.connect(function (err, client) {
            assert.equal(null, err);
            console.log("\nConnected successfully to server");
            const db = client.db(name);
            const collection = db.collection("food");
            findAllDocuments(db, query, collection, function (data) {
                let resultArray = data;

                res.render('food/getFood', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: resultArray
                    }
                });
            });
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

        Dish.find({}, async function (err, docs) {
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

    dishDetails: async function (req, res) {
        let dishId = req.params._id;
        const query = { _id: dishId };

        Dish.find(query, async function (err, doc) {
            if (err) {
                console.log(err);
            } else {
                const nutrientes = await calculateNutrients(doc);
                // console.log(nutrientes[0])
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

    insertDish: function (req, res) {


        let query = {};

        const searchData = req.body.shrt_desc;

        if (typeof searchData !== "undefined") {
            query = { shrt_desc: { $regex: searchData } };
        }

        client.connect(function (err, client) {
            assert.equal(null, err);
            console.log("\nConnected successfully to server");
            const db = client.db(name);
            const collection = db.collection("food");

            findAllDocuments(db, query, collection, function (data) {
                let resultArray = data;


                res.render('dish/insertDish', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: resultArray

                    }
                });
            });
        });
    },

    insertDishJson: function (req, res) {
        var beautify = require('js-beautify').js;
        let json = require("../public/dishExample.json")
        json = beautify(JSON.stringify(json), { indent_size: 2, space_in_empty_paren: true })

        res.render('dish/insertDishJson', {
            items: {
                req: req,
                myObject: espTemplate,
                json: json
            }
        });

    },

    insertDishJsonPost: async function (req, res) {
        let errors = [];

        if (!req.files) {
            errors.push({ msg: espTemplate.errors.emptyJson });
            showErrorsDishJsoN(errors, req, res);


        } else {


            let file = req.files.filename;  // here is the field name of the form

            const valor = JSON.parse(file.data)



            let noEncontrados = [];

            if (typeof valor.length === "undefined") {
                errors.push({ msg: espTemplate.errors.formatInc });

                showErrorsDishJsoN(errors, req, res);

            }



            for (let j = 0; j < valor.length; j++) {
                const title = valor[j]._id;

                const description = valor[j].description;

                const recipe = valor[j].recipe;

                const imageURL = valor[j].imageURL;

                const ingredients = valor[j].ingredients;


                if (!title) {
                    errors.push({ msg: espTemplate.errors.dishName });
                }
                if (!description) {
                    errors.push({ msg: espTemplate.errors.dishDescription });
                }

                const regex = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/);
                if (recipe) {
                    if (recipe != "") {
                        if (!recipe.match(regex)) {
                            errors.push({ msg: espTemplate.errors.dishRecipe  });
                        }
                    }
                }
                if (imageURL) {
                    if (imageURL != "") {
                        if (!imageURL.match(regex)) {
                            errors.push({ msg: espTemplate.errors.dishImage  });
                        }
                    }
                }

                if (ingredients.length === 0) {
                    errors.push({ msg: espTemplate.errors.dishIngredient });
                } else {

                    for (let i = 0; i < ingredients.length; i++) {
                        if (ingredients[i].name === ""){
                            errors.push({ msg: espTemplate.errors.ingNotFound });
                                
                        }else{
                            const result = usdaJson.filter(word => word.shrt_desc === ingredients[i].name);
                            if (result.length === 0) {
                            
                                noEncontrados.push(ingredients[i].name);
                            }
                        }

                        if (!(ingredients[i].amount)) {
                            errors.push({ msg: espTemplate.errors.amountNotFound + ingredients[i].name + "." });
                        }

                        if ((ingredients[i].amount) && (typeof (ingredients[i].amount) != "number")) {
                            errors.push({ msg: espTemplate.errors.dishAmount1 + ingredients[i].name +  espTemplate.errors.dishAmount2  });
                        }

                        if (!(ingredients[i].unitMeasure)) {
                            errors.push({ msg: espTemplate.errors.dishUnitMeasure  + ingredients[i].name + "." });
                        }

                        if ((ingredients[i].unitMeasure) && ((ingredients[i].unitMeasure != "g") && (ingredients[i].unitMeasure != "ml"))) {
                            errors.push({ msg: espTemplate.errors.dishUnitMeasure1  + ingredients[i].name + espTemplate.errors.dishUnitMeasure2 });
                        }

                        if (!(ingredients[i].ndbno) || (ingredients[i].ndbno === "")) {
                            errors.push({ msg: espTemplate.errors.dishNdbno + ingredients[i].name + "." });
                        }


                        if ((ingredients[i].ndbno) && (typeof (ingredients[i].ndbno) != "string")) {
                            errors.push({ msg: espTemplate.errors.dishNdbno1  + ingredients[i].name + espTemplate.errors.dishNdbno2  });
                        }

                    }

                    for (let i = 0; i < noEncontrados.length; i++) {
                        console.log(util.inspect(noEncontrados));
                        errors.push({ msg: espTemplate.errors.ingNotFound1 + noEncontrados[i] + espTemplate.errors.ingNotFound2 });
                    }
                }

                if (errors.length > 0) {

                    showErrorsDishJsoN(errors, req, res);

                }

                else {

                    const objetoPlato = await createPlato(valor[j]);


                    if ((j + 1) === valor.length) {
                        objetoPlato.save(async function (err) {
                            if (err) {
                                errors.push({ msg: espTemplate.errors.difDishName1 + valor[j]._id +  espTemplate.errors.difDishName1 });

                                showErrorsDishJsoN(errors, req, res);

                            } else {
                                Dish.find({}, async function (err, docs) {
                                    if (err) {
                                        errors.push({ msg: espTemplate.errors.saveError });
                                        console.log(err);
                                        showErrorsDishJsoN(errors, req, res);


                                    } else {
                                        const suma = await calculateKcal(docs);
                                        req.flash('success', espTemplate.success.insertDish);
                                        res.render('dish/getDish', {
                                            items: {
                                                req: req,
                                                myObject: espTemplate,
                                                myDocs: docs,
                                                myKcal: suma,
                                                errors

                                            }
                                        })
                                    }
                                });

                            }
                        });
                    } else {
                        objetoPlato.save(async function (err) {
                            if (err) {
                                errors.push({ msg: espTemplate.errors.difDishName3 });
                                console.log(err);
                                showErrorsDishJsoN(errors, req, res);
                            }
                        });

                    }

                }
            }

        }
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


    removeDish: function (req, res) {

        let dishId = req.params._id;

        Dish.findByIdAndRemove(dishId, (err, dishRemoved) => {
            if (err) {
                return req.flash('danger', espTemplate.errors.dishNotRemove);
            }
            if (!dishRemoved) {
                return req.flash('danger', espTemplate.errors.dishNotRemove);
            }

            res.redirect("/dish/view")


        })
    },

    insertDishPost: async function (req, res) {

        const title = req.body.title;
        const description = req.body.description;
        const recipe = req.body.recipe;
        const imageURL = req.body.imageURL;
        const vectorIngredientes = [];

        let errors = [];

        const cantidades = req.body.cantidades;
        const Unidades = req.body.Unidades;
        const ingredients = req.body.ingredients;
        let resultados = [];
        let noEncontrados = [];


        for (let i = 0; i < ingredients.length; i++) {
            const result = usdaJson.filter(word => word.shrt_desc === ingredients[i]);

            if (result.length === 0) {
                noEncontrados.push(ingredients[i]);

            } else {
                let obj = {
                    name: result[0].shrt_desc,
                    amount: cantidades[i],
                    unitMeasure: Unidades[i],
                    ndbno: result[0].ndb_no
                }
                resultados.push(obj);
            }
        }
        if (noEncontrados.length > 0) {


            for (let i = 0; i < noEncontrados.length; i++) {
                errors.push({ msg:  espTemplate.errors.ingNotFound1 + noEncontrados[i] +  espTemplate.errors.ingNotFound2 });
            }


            client.connect(function (err, client) {
                assert.equal(null, err);

                const db = client.db(name);
                const collection = db.collection("food");
                const query = {};
                findAllDocuments(db, query, collection, function (data) {
                    let resultArray = data;

                    res.render('dish/insertDish', {
                        items: {
                            req: req,
                            myObject: espTemplate,
                            myDocs: resultArray,
                            errors
                        }
                    });
                });
            });
        } else {


            const plato = new Dish({
                _id: title,
                description: description,
                ingredients: resultados,
                recipe: recipe,
                imageURL: imageURL
            });

            plato.save(async function (err) {
                if (err) {
                    console.log(err);
                } else {
                    Dish.find({}, async function (err, docs) {
                        if (err) {

                            console.log(err);
                        } else {
                            const suma = await calculateKcal(docs);
                            req.flash('success', espTemplate.success.insertDish);
                            res.render('dish/getDish', {
                                items: {
                                    req: req,
                                    myObject: espTemplate,
                                    myDocs: docs,
                                    myKcal: suma

                                }
                            })
                        }
                    });

                }
            })
        }
    },

    updateDish: function (req, res) {
        const searchData = req.params._id;

        const query = { _id: searchData };

        Dish.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                let aux = docs[0];

                client.connect(function (err, client) {
                    assert.equal(null, err);
                    console.log("\nConnected successfully to server");
                    const db = client.db(name);
                    const collection = db.collection("food");
                    let newQuery = {};
                    findAllDocuments(db, newQuery, collection, function (data) {
                        let resultArray = data;


                        res.render('dish/updateDish', {
                            items: {
                                req: req,
                                myObject: espTemplate,
                                myDocs: aux,
                                myFood: resultArray

                            }
                        });
                    });
                });

            }
        }).sort({ _id: 1 })
    },


    updateDishPost: function (req, res) {
        let dishId = req.params._id;

        const title = req.body.title;

        const description = req.body.description;

        const recipe = req.body.recipe;

        const imageURL = req.body.imageURL;

        const vectorIngredientes = [];



        let errors = [];

        const cantidades = req.body.cantidades;
        const Unidades = req.body.Unidades;
        const ingredients = req.body.ingredients;
        let resultados = [];
        let noEncontrados = [];

        for (let i = 0; i < ingredients.length; i++) {
            const result = usdaJson.filter(word => word.shrt_desc === ingredients[i]);

            if (result.length === 0) {
                noEncontrados.push(ingredients[i]);

            } else {
                let obj = {
                    name: result[0].shrt_desc,
                    amount: cantidades[i],
                    unitMeasure: Unidades[i],
                    ndbno: result[0].ndb_no
                }
                resultados.push(obj);
            }
        }
        if (noEncontrados.length > 0) {
            for (let i = 0; i < noEncontrados.length; i++) {
                errors.push({ msg: espTemplate.errors.ingNotFound1 + noEncontrados[i]._id + espTemplate.errors.ingNotFound2 });
            }

            const query = { _id: dishId }
            Dish.find(query, async function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    let aux = docs[0];

                    client.connect(function (err, client) {
                        assert.equal(null, err);
                        console.log("\nConnected successfully to server");
                        const db = client.db(name);
                        const collection = db.collection("food");
                        const query = {};
                        findAllDocuments(db, query, collection, function (data) {
                            let resultArray = data;

                            res.render('dish/updateDish', {
                                items: {
                                    errors,
                                    id: req.params._id,
                                    req: req,
                                    myObject: espTemplate,
                                    myDocs: aux,
                                    myFood: resultArray
                                }
                            });
                        });
                    });
                }
            })
        } else {


            const query = { _id: req.params._id };
            const id = req.params._id;


            var newvalues = { description: description, ingredients: resultados, recipe: recipe, imageURL: imageURL };
            Dish.findById(query).then(plato => {
                if (plato) {
                    const newPlato = {
                        description,
                        ingredients,
                        recipe,
                        imageURL
                    };
                    const set = { $set: newvalues };

                    Dish.updateOne(query, set, (err, updateDish) => {
                        if (err) {
                            console.log(err);
                        } else {

                            req.flash(
                                'success_msg',
                                espTemplate.success.updateDish
                            );
                            res.redirect('/dish/view');
                        }
                    })

                }

            });


        }


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
                console.log(valores)

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


    removeMenu: function (req, res) {

        let menuId = req.params._id;

        Menu.findByIdAndRemove(menuId, (err, menuRemoved) => {
            if (err) {
                console.log(err);
                return req.flash('danger', espTemplate.errors.menuNotExist);
            }
            if (!menuRemoved) {
                return req.flash('danger', espTemplate.errors.menuNotExist);
            }


            res.redirect("/menu/view")


        })
    },

    insertMenu: function (req, res) {

        Dish.find({}, async function (err, docs) {
            if (err) {

                console.log(err);
            } else {

                const suma = await calculateKcal(docs);
                res.render('menu/insertMenu', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: docs,
                        myKcal: suma

                    }
                });
            }
        })
    },

    insertMenuPost: async function (req, res) {
        const _id = req.body.title;
        const description = req.body.description;
        const platos = req.body.platos;
        let incorrecto = [];
        let correcto = [];
        const menu = new Menu({
            _id: _id,
            description: description,

        });

        for (let i = 0; i < platos.length; i++) {
            const query = { _id: platos[i] }

            var data = await myFunction(query);

            if (data.length === 0) {
                incorrecto.push(platos[i]);
            } else {
                menu.dishes.push(data[0]);
            }
        }

        if (incorrecto.length > 0) {

            let errors = [];
            for (let i = 0; i < incorrecto.length; i++) {
                errors.push({ msg: espTemplate.errors.dishNotFound1 + incorrecto[i]._id + espTemplate.errors.dishNotFound2 });
            }

            Dish.find({}, async function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    const suma = await calculateKcal(docs);
                    res.render('menu/insertMenu', {
                        items: {
                            req: req,
                            myObject: espTemplate,
                            myDocs: docs,
                            myKcal: suma,
                            errors

                        }
                    });
                }
            })


        } else {

            menu.save(async function (err) {
                if (err) {
                    console.log(err);
                } else {
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
                }
            })
        }

    },

    insertMenuJson: function (req, res) {
        var beautify = require('js-beautify').js;
        let json = require("../public/menuExample.json")
        json = beautify(JSON.stringify(json), { indent_size: 2, space_in_empty_paren: true })

        res.render('menu/insertMenuJson', {
            items: {
                req: req,
                myObject: espTemplate,
                json: json
            }
        });
    },

    insertMenuJsonPost: async function (req, res, next) {
        let errors = [];

        if (!req.files) {

            errors.push({ msg: espTemplate.errors.emptyJson });
            return showErrorsMenuJson(errors, req, res);

        } else {


            let file = req.files.filename;  // here is the field name of the form

            const valor = JSON.parse(file.data)



            let noEncontrados = [];

            if (typeof valor.length === "undefined") {
                errors.push({ msg: espTemplate.errors.formatInc });

                return showErrorsMenuJson(errors, req, res);

            } else {



                for (let j = 0; j < valor.length; j++) {

                    const _id = valor[j]._id;

                    const description = valor[j].description;
                    const dishes = valor[j].dishes;

                    if (!(_id)) {
                        errors.push({ msg: espTemplate.errors.menuName });

                    }
                    if (!description) {
                        errors.push({ msg: espTemplate.errors.menuDescription });

                    }


                    const menu = new Menu({
                        _id: _id,
                        description: description,

                    });

                    if (dishes.length === 0) {
                        errors.push({ msg: espTemplate.errors.menuDishes });

                    }



                    for (let i = 0; i < dishes.length; i++) {


                        const query = { _id: dishes[i]._id }

                        var data = await myFunction(query);


                        if (data.length === 0) {
                            noEncontrados.push(dishes[i]);
                        } else {
                            menu.dishes.push(data[0]);
                        }
                    }

                    if ((noEncontrados.length > 0) || (errors.length > 0)) {

                        for (let i = 0; i < noEncontrados.length; i++) {
                            errors.push({ msg: espTemplate.errors.dishNotFound1 + noEncontrados[i]._id + espTemplate.errors.dishNotFound2 });
                        }


                        return res.render('menu/insertMenuJson', {
                            items: {
                                req: req,
                                myObject: espTemplate,
                                errors
                            }
                        });

                    } else {
                        menu.save(async function (err) {
                            if (err) {
                                errors.push({ msg: espTemplate.errors.difMenuName1 + valor[j]._id + espTemplate.errors.difMenuName2 });
                                console.log(err);
                                showErrorsMenuJson(errors, req, res);
                            } else {
                                Menu.find({}, async function (err, docs) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        if ((j + 1) === valor.length) {

                                            let valores = [];
                                            for (let i = 0; i < docs.length; i++) {
                                                const value = await calculateNutrientsMenu(docs[i])
                                                valores.push(value);
                                            }

                                            res.redirect("/menu/view");


                                        } else {

                                        }


                                    }
                                }).sort({ _id: 1 })
                            }
                        })

                    }
                }
            }
        }
    },


    updateMenu: function (req, res) {
        const query = { _id: req.params._id };


        Menu.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                const menu = docs;
                Dish.find({}, async function (err, docs) {
                    if (err) {

                        console.log(err);
                    } else {
                        const suma = await calculateKcal(docs);


                        res.render('menu/updateMenu', {
                            items: {
                                req: req,
                                myObject: espTemplate,
                                myDocs: docs,
                                myKcal: suma,
                                myMenu: menu[0]

                            }
                        });
                    }
                })
            }
        }).sort({ _id: 1 })

    },
    updateMenuPost: async function (req, res) {
        const query = { _id: req.params._id };

        const _id = req.body.title;
        const description = req.body.description;
        const dishes = req.body.platos;

        let errors = [];

        let resultados = [];
        let noEncontrados = [];

        const menu = {
            _id: _id,
            description: description,

        };

        for (let i = 0; i < dishes.length; i++) {
            const query = { _id: dishes[i] }

            var data = await myFunction(query);

            if (data.length === 0) {
                noEncontrados.push(dishes[i]);
            } else {
                ;
                resultados.push(data[0])

            }

        }
        if (noEncontrados.length > 0) {


            for (let i = 0; i < noEncontrados.length; i++) {
                errors.push({ msg: espTemplate.errors.dishNotFound1 + noEncontrados[i] + espTemplate.errors.dishNotFound2 });
            }


            Menu.find(query, async function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    const menu = docs;
                    Dish.find({}, async function (err, docs) {
                        if (err) {

                            console.log(err);
                        } else {
                            const suma = await calculateKcal(docs);


                            res.render('menu/updateMenu', {
                                items: {
                                    errors,
                                    req: req,
                                    myObject: espTemplate,
                                    myDocs: docs,
                                    myKcal: suma,
                                    myMenu: menu[0]

                                }
                            });
                        }
                    })
                }
            }).sort({ _id: 1 })
        } else {



            var newvalues = { description: description, dishes: resultados };
            Menu.findById(query).then(menuEncontrado => {
                if (menuEncontrado) {
                    const newMenu = {
                        description,
                        dishes
                    };
                    const set = { $set: newvalues };
                    console.log(set)
                    Menu.updateOne(query, set, (err, updatedMenu) => {
                        if (err) {
                            console.log(err);
                        } else {

                            req.flash(
                                'success_msg',
                                espTemplate.success.updateMenu
                            );
                            res.redirect('/menu/view');
                        }
                    })

                }

            });


        }

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



    insertPlanification: function (req, res) {

        Menu.find({}, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                let valores = [];
                for (let i = 0; i < docs.length; i++) {
                    const value = await calculateNutrientsMenu(docs[i])
                    valores.push(value);
                }
                res.render('planification/insertPlanification', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: docs,
                        myNutrientsMenu: valores,

                    }
                });
            }
        }).sort({ _id: 1 });

    },

    insertPlanificationPost: async function (req, res) {

        const _id = req.body._id;
        const description = req.body.description;
        const dias = req.body.days;
        let vectorObjMenu = [];
        for (let i = 0; i < req.body.NombreMenus.length; i++) {
            const query = { _id: req.body.NombreMenus[i] }
            const obj = await myFunctionMenu(query);
            vectorObjMenu.push(obj[0]);
        }



        const menus = [];
        for (let i = 0; i < dias; i++) {
            let diasV = [];
            for (let j = 0; j < req.body.nMenus[i]; j++) {

                diasV.push(vectorObjMenu[0]);
                vectorObjMenu.shift();
            }
            menus.push(diasV);
        }

        const plan = new Planification({
            _id: _id,
            description: description,
            dias: dias,
            menus: menus
        })

        plan.save()
            .then(data => {
                res.send(data);
            }).catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });


    },

    updatePlanification: function (req, res) {
        let planId = req.params._id;
        const query = { _id: planId };

        Planification.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                const plan = docs[0];
                Menu.find({}, async function (err, docs) {
                    if (err) {
                        console.log(err);
                    } else {
                        let valores = [];
                        for (let i = 0; i < docs.length; i++) {
                            const value = await calculateNutrientsMenu(docs[i])
                            valores.push(value);
                        }
                        res.render('planification/updatePlanification.ejs', {
                            items: {
                                req: req,
                                myObject: espTemplate,
                                myDocs: plan,
                                myMenus: docs,
                                myNutrientsMenu: valores,

                            }
                        });
                    }
                }).sort({ _id: 1 });


            }
        }).sort({ _id: 1 })
    },

    updatePlanificationPost: async function (req, res) {


        const _id = req.body._id;
        const description = req.body.description;
        const dias = req.body.days;
        let vectorObjMenu = [];
        for (let i = 0; i < req.body.NombreMenus.length; i++) {
            const query = { _id: req.body.NombreMenus[i] }
            const obj = await myFunctionMenu(query);
            vectorObjMenu.push(obj[0]);
        }


        const menus = [];
        for (let i = 0; i < dias; i++) {
            let diasV = [];
            for (let j = 0; j < req.body.nMenus[i]; j++) {

                diasV.push(vectorObjMenu[0]);
                vectorObjMenu.shift();

            }
            menus.push(diasV);
        }



        const query = { _id: req.body._id };
        Planification.findById(query).then(planFound => {
            if (planFound) {

                const plan = new Planification({
                    _id: _id,
                    description: description,
                    dias: dias,
                    menus: menus
                })
                const set = { $set: plan };
                Planification.updateOne(query, set)
                    .then(data => {
                        res.send(data);
                    }).catch(err => {
                        res.status(500).send({
                            message: err.message
                        });
                    });

            }
        })



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

    insertPlanificationJson: function (req, res) {
        var beautify = require('js-beautify').js;

        let json = require("../public/planExample.json")
        json = beautify(JSON.stringify(json), { indent_size: 2, space_in_empty_paren: true })

        res.render('planification/insertPlanificationJson', {
            items: {
                req: req,
                myObject: espTemplate,
                json: json
            }
        });

    },

    insertPlanificationJsonPost: async function (req, res) {
        let errors = [];
        if (!req.files) {
            errors.push({ msg: espTemplate.errors.emptyJson });
            return showErrorsPlanificationJson(errors, req, res);

        } else {

            let file = req.files.filename;  // here is the field name of the form
            const valor = JSON.parse(file.data)


            let noEncontrados = [];

            if (typeof valor.length === "undefined") {
                errors.push({ msg: espTemplate.errors.formatInc });

                return showErrorsPlanificationJson(errors, req, res);

            } else {

                if (typeof valor.length === "undefined") {
                    errors.push({ msg: espTemplate.errors.formatInc });

                    showErrorsPlanificationJsoN(errors, req, res);
                }

                for (let j = 0; j < valor.length; j++) {
                    const title = valor[j]._id;

                    const description = valor[j].description;

                    const dias = valor[j].dias;

                    const menus = valor[j].menus;


                    if (!title) {
                        errors.push({ msg: espTemplate.errors.planName });
                    }

                    if ((title === "") || (typeof title != "string")) {
                        errors.push({ msg: espTemplate.errors.planTitle });
                    }

                    if ((description === "") || (typeof description != "string")) {
                        errors.push({ msg: espTemplate.errors.planDesc });
                    }

                    if (!dias) {
                        errors.push({ msg: espTemplate.errors.planDays});
                    }

                    if ((typeof dias != "number")) {
                        errors.push({ msg: espTemplate.errors.numberDays });
                    }

                    if ((dias < 1)) {
                        errors.push({ msg: espTemplate.errors.minDays });
                    }


                    if (menus.length != dias) {
                        errors.push({ msg: espTemplate.errors.menuLength });
                    }

                    if (errors.length > 0) {

                        showErrorsPlanificationJson(errors, req, res);
                    } else {
                        const plan = new Planification({
                            _id: title,
                            description: description,
                            dias: dias

                        });


                        for (let i = 0; i < menus.length; i++) {

                            let menusk = [];

                            for (let k = 0; k < menus[i].length; k++) {

                                const query = { _id: menus[i][k]._id };
                                const data = await myFunctionMenu(query);
                                if (data.length === 0) {
                                    noEncontrados.push(menus[i][k]);
                                } else {
                                    var beautify = require('js-beautify').js;

                                    menusk.push(data[0]);

                                }

                            }
                            plan.menus.push(menusk);
                        }



                        if ((noEncontrados.length > 0) || (errors.length > 0)) {

                            for (let i = 0; i < noEncontrados.length; i++) {
                                errors.push({ msg: espTemplate.errors.menuNotFound1 + noEncontrados[i]._id + espTemplate.errors.menuNotFound2 });
                            }

                            return res.render('planification/insertPlanificationJson', {
                                items: {
                                    req: req,
                                    myObject: espTemplate,
                                    errors
                                }
                            });

                        }


                        plan.save(async function (err) {
                            if (err) {
                                errors.push({ msg: espTemplate.errors.difPlanName1 + valor[j]._id + espTemplate.errors.difPlanName2 });
                                console.log(err);
                                showErrorsPlanificationJson(errors, req, res);
                            } else {
                                if ((j + 1) === valor.length) {

                                    Planification.find({}, async function (err, docs) {
                                        if (err) {
                                            console.log(err);
                                        } else {


                                            return res.redirect("/planification/view");


                                        }

                                    }).sort({ _id: 1 })
                                }
                            }
                        })



                    }
                }

            }

        }

    },

    removePlanification: function (req, res) {

        let menuId = req.params._id;

        Planification.findByIdAndRemove(menuId, (err, menuRemoved) => {
            if (err) {
                console.log(err);
                return req.flash('danger', espTemplate.errors.planRemoveError);
            }
            if (!menuRemoved) {
                return req.flash('danger', espTemplate.errors.planRemoveError);
            }


            res.redirect("/planification/view")


        })
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
        console.log("\n\n\n ----------------------- Recomendación view")
        Recommendation.find({}, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                console.log(docs)
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
                console.log(docs)
                console.log("VA A DETALLES------------------------->")
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
            errors.push({ msg: espTemplate.errors.protComp  });
        }
        if (parseInt(req.body.carbohydrtMin) > parseInt(req.body.carbohydrtMax)) {
            errors.push({ msg: espTemplate.errors.carbComp  });
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
        console.log(req.body);

        if (parseInt(req.body.energyMin) > parseInt(req.body.energyMax)) {
            errors.push({ msg: espTemplate.errors.enerComp  });
        }
        if (parseInt(req.body.lipidsMin) > parseInt(req.body.lipidsMax)) {
            errors.push({ msg: espTemplate.errors.lipidComp  });
        }
        if (parseInt(req.body.proteinMin) > parseInt(req.body.proteinMax)) {
            errors.push({ msg: espTemplate.errors.protComp  });
        }
        if (parseInt(req.body.carbohydrtMin) > parseInt(req.body.carbohydrtMax)) {
            errors.push({ msg: espTemplate.errors.carbComp  });
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
            errors.push({ msg:  espTemplate.errors.dishNotRemove });
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
                        errors.push({ msg: espTemplate.errors.recDescString  });
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
                        errors.push({ msg: espTemplate.errors.recProtMinNumber});
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
            errors.push({ msg: espTemplate.errors.userRegFields});
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

        if (!name || !email || !username  || !rol) {
            errors.push({ msg: espTemplate.errors.userRegFields });
        }

        const regex = new RegExp(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);

        if (!email.match(regex)) {
            errors.push({ msg: espTemplate.errors.userRegEmail });
        }


        req.checkBody('req.body.email',  espTemplate.errors.userRegEmail ).notEmpty();

        if ((password.length > 0) || (password2.length > 0)) {
            if (password != password2) {
                errors.push({ msg:  espTemplate.errors.userRegPasswordDif });
            }

            if (password.length < 6) {
                errors.push({ msg: espTemplate.errors.userRegPasswordTam});
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
                    }else{
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
        req.flash('success_msg',  espTemplate.errors.logOut);
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
            const nutrients = await dish.storeNutrients(docs[i].ingredients[ingrediente]);
            nut_vector.push(nutrients);
        }
        let suma = 0;

        const valores = dish.computeNutrients(docs[i].ingredients, nut_vector);

        sumasKcal.push(valores.energKcal);

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

    //ojo

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

async function createPlato(valor) {

    if ((valor.recipe) && (valor.imageURL)) {
        const plato = new Dish({
            _id: valor._id,
            description: valor.description,
            ingredients: valor.ingredients,
            recipe: valor.recipe,
            imageURL: valor.imageURL
        });


        return plato
    }


    if ((valor.recipe) && (!valor.imageURL)) {
        const plato = new Dish({
            _id: valor._id,
            description: valor.description,
            ingredients: valor.ingredients,
            recipe: valor.recipe
        });

        return plato
    }

    if (!(valor.recipe) && (valor.imageURL)) {
        const plato = new Dish({
            _id: valor._id,
            description: valor.description,
            ingredients: valor.ingredients,
            imageURL: valor.imageURL
        });

        return plato
    }

    if (!(valor.recipe) && !(valor.imageURL)) {
        const plato = new Dish({
            _id: valor._id,
            description: valor.description,
            ingredients: valor.ingredients,
        });

        return plato
    }

}

function showErrorsDishJsoN(errors, req, res) {

    return res.render('dish/insertDishJson', {
        items: {
            req: req,
            myObject: espTemplate,
            errors
        }
    });
}

function showErrorsMenuJson(errors, req, res) {



    return res.render('menu/insertMenuJson', {
        items: {
            req: req,
            myObject: espTemplate,
            errors
        }
    });
}

function showErrorsPlanificationJson(errors, req, res) {



    return res.render('planification/insertPlanificationJson', {
        items: {
            req: req,
            myObject: espTemplate,
            errors
        }
    });
}


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

