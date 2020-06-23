'use strict'

// MongoDB 
let mongo = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
let assert = require("assert");
const user = "admin";
const password = "password123";
const host = "127.0.0.1";
const port = "27017";
const name = "entullo";
const url = `mongodb://${host}:${port}/${name}`;
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

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
const Recomendation = require("../models/recomendation");
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
        console.log(searchData);
        if ((searchData == null) || (searchData == "")) {
            req.flash('success', "Objeto no existente");
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

        // console.log(Dish)
        Dish.find({}, async function (err, docs) {
            if (err) {

                console.log(err);
            } else {
                console.log("si" + docs)
                // for (let i = 0; i < docs.length; i++) {
                //     console.log(docs[i].ingredients);
                // }

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
        // console.log(dishId);
        const query = { _id: dishId };

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

    insertDish: function (req, res) {
        console.log(req.body);

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

        if (!req.files) {
            res.send("File was not found");
            return;

        } else {


            let file = req.files.filename;  // here is the field name of the form
            // console.log(file);
            const valor = JSON.parse(file.data)
            // console.log(valor[0]);
            // console.log(valor[1]);

            let errors = [];
            let noEncontrados = [];

            for (let j = 0; j < valor.length; j++) {
                const title = valor[j]._id;
                console.log("title: " + title);
                const description = valor[j].description;
                console.log("description: " + description);
                const recipe = valor[j].recipe;
                console.log("receta: " + recipe);
                const imageURL = valor[j].imageURL;
                console.log("imageURL: " + imageURL);
                const ingredients = valor[j].ingredients;
                console.log("ingredients: " + ingredients);

                if (!title) {
                    errors.push({ msg: "No se ha encontrado un nombre para el plato." });
                }
                if (!description) {
                    errors.push({ msg: "No se ha encontrado una descripción para el plato." });
                }

                const regex = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/);
                if (recipe) {
                    if (recipe != "" ){
                        if (!recipe.match(regex)) {
                            errors.push({ msg: "La URL de la receta no es correcta." });
                        }
                    }
                }
                if (imageURL) {
                    if (imageURL != ""){
                        if (!imageURL.match(regex)) {
                            errors.push({ msg: "La URL de la receta no es correcta." });
                        }
                    } 
                }

                for (let i = 0; i < ingredients.length; i++) {
                    console.log(ingredients[i]);

                    const result = usdaJson.filter(word => word.shrt_desc === ingredients[i].name);
                    if (result.length === 0) {
                        console.log(ingredients[i]);
                        noEncontrados.push(ingredients[i].name);
                    }

                    if (!(ingredients[i].amount)) {
                        errors.push({ msg: "No se ha encontrado definida la cantidad para el alimento " + ingredients[i].name + "." });
                    }
                   
                    if ((ingredients[i].amount) && (typeof (ingredients[i].amount) != "number")) {
                        errors.push({ msg: "La cantidad para el alimento " + ingredients[i].name + " debe ser expresada con un dato numérico." });
                    }

                    if (!(ingredients[i].unitMeasure)) {
                        errors.push({ msg: "No se ha encontrado definida la unidad de medida para la cantidad del alimento " + ingredients[i].name + "." });
                    }

                    if ( (ingredients[i].unitMeasure) && (  (ingredients[i].unitMeasure != "g") &&  (ingredients[i].unitMeasure != "ml") ) ) {
                        errors.push({ msg: "La unidad de medida para la cantidad del alimento " + ingredients[i].name + " debe ser expresada como un dato en 'g' para gramos o 'ml' para mililitros." });
                    }

                    if (!(ingredients[i].ndbno)) {
                        errors.push({ msg: "No se ha encontrado definido el identificador del alimento " + ingredients[i].name + "." });
                    }

               
                    if ((ingredients[i].ndbno) && (typeof (ingredients[i].ndbno) != "string")) {
                        errors.push({ msg: "La cantidad para el alimento " + ingredients[i].name + " debe ser expresada con una cadena de caracteres." });
                    }

                }

                for (let i = 0; i < noEncontrados.length; i++) {
                    errors.push({ msg: "El alimento " + noEncontrados[i] + " no ha sido encontrado." });
                }


                if (errors.length > 0) {
                    console.log("Fleje errores");
                    console.log(errors);


                    client.connect(function (err, client) {
                        assert.equal(null, err);
                        console.log("\nConnected successfully to server");
                        const db = client.db(name);
                        const collection = db.collection("food");
                        const query = {};
                        findAllDocuments(db, query, collection, function (data) {
                            let resultArray = data;

                            res.render('dish/insertDishJson', {
                                items: {
                                    req: req,
                                    myObject: espTemplate,
                                    myDocs: resultArray,
                                    errors
                                }
                            });
                        });
                    });
                }

                else {
                    console.log(valor[j].title)
                    const objetoPlato = await createPlato(valor[j]);
                    console.log("_____________________________________________________\n\n")
                    console.log(objetoPlato._id)

                    if ((j + 1) === valor.length) {
                        objetoPlato.save(async function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                Dish.find({}, async function (err, docs) {
                                    if (err) {
                                        errors.push({ msg: "Comprueba si el nombre que identifica al plato no haya sido utilizado antes. No puede existir platos con nombres iguales." });
                                        console.log(err);
                                    } else {
                                        const suma = await calculateKcal(docs);
                                        req.flash('success', 'Dish was inserted');
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
                                errors.push({ msg: "Comprueba si el nombre que identifica al plato no haya sido utilizado antes. No puede existir platos con nombres iguales." });
                                console.log(err);
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
            req.flash('success', "Objeto no existente");
        }
        console.log(searchData);
        const query = { _id: { $regex: `${searchData}` } };

        Dish.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {

                const suma = await calculateKcal(docs);
                console.log(suma);
                // console.log(docs);
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
                return req.flash('danger', "Error, no se ha podido eliminar el plato");
            }
            if (!dishRemoved) {
                return req.flash('danger', "No se puede eliminar el proyecto.");
            }

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

        })
    },

    insertDishPost: async function (req, res) {

        const title = req.body.title;
        console.log("title: " + title);
        const description = req.body.description;
        console.log("description: " + description);
        const recipe = req.body.recipe;
        console.log("receta: " + recipe);
        const imageURL = req.body.imageURL;
        console.log("imageURL: " + imageURL);
        const vectorIngredientes = [];
        console.log(req.body.ingredients)

        let errors = [];

        const cantidades = req.body.cantidades;
        const Unidades = req.body.Unidades;
        const ingredients = req.body.ingredients;
        let resultados = [];
        let noEncontrados = [];
        console.log("\n\n");

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

            console.log("NO SE HA ENCONTRADO a estos alimentos : " + util.inspect(noEncontrados));
            for (let i = 0; i < noEncontrados.length; i++) {
                errors.push({ msg: "El alimento " + noEncontrados[i] + " no ha sido encontrado." });
            }

            client.connect(function (err, client) {
                assert.equal(null, err);
                console.log("\nConnected successfully to server");
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

            console.log("VECTORES: " + util.inspect(resultados));
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
                            req.flash('success', 'Dish was inserted');
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
        // console.log(query);
        Dish.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                let aux = docs[0];
                console.log(docs[0]);

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
        console.log(req.params);
        console.log(req.body);
        console.log("Funcion deseada")
        const title = req.body.title;
        console.log("title: " + title);
        const description = req.body.description;
        console.log("description: " + description);
        const recipe = req.body.recipe;
        console.log("receta: " + recipe);
        const imageURL = req.body.imageURL;
        console.log("imageURL: " + imageURL);
        const vectorIngredientes = [];
        console.log(req.body.ingredients)


        let errors = [];

        const cantidades = req.body.cantidades;
        const Unidades = req.body.Unidades;
        const ingredients = req.body.ingredients;
        let resultados = [];
        let noEncontrados = [];
        console.log("\n\n");

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

            console.log("NO SE HA ENCONTRADO a estos alimentos : " + util.inspect(noEncontrados));
            for (let i = 0; i < noEncontrados.length; i++) {
                errors.push({ msg: "El alimento " + noEncontrados[i] + " no ha sido encontrado." });
            }

            const query = { _id: dishId }
            console.log(query);
            Dish.find(query, async function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    let aux = docs[0];
                    // console.log(docs[0])
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

            console.log("VECTORES: " + util.inspect(resultados));

            const query = { _id: req.params._id };
            const id = req.params._id;
            console.log(id);

            var newvalues = { description: description, ingredients: resultados, recipe: recipe, imageURL: imageURL };
            Dish.findById(query).then(plato => {
                if (plato) {
                    console.log("Plato encontrado" + plato);
                    const newPlato = {
                        description,
                        ingredients,
                        recipe,
                        imageURL
                    };
                    const set = { $set: newvalues };
                    console.log(set)
                    Dish.updateOne(query, set, (err, updateDish) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("\n\n\nUSUARIO ACTUALIZADO: " + updateDish)
                            req.flash(
                                'success_msg',
                                'Dish has been updated'
                            );
                            res.redirect('/dish/view');
                        }
                    })

                }

            });


        }


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
            req.flash('success', "Objeto no existente");
            console.log(searchData);
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
                        myNutrientsMenu: valores,
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
                // console.log("valores --------: " + valores)
                kcalPlatos.push(kcal);
                // console.log("kcalPlatos: " + util.inspect(kcalPlatos[0]))

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
                return req.flash('danger', "Error, no se ha podido eliminar el plato");
            }
            if (!menuRemoved) {
                return req.flash('danger', "No se puede eliminar el proyecto.");
            }

            Menu.find({}, async function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    // console.log(docs);
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

        })
    },

    insertMenu: function (req, res) {

        Dish.find({}, async function (err, docs) {
            if (err) {

                console.log(err);
            } else {
                console.log("si" + docs)
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

        console.log(req.body);
        const _id = req.body.title;
        const description = req.body.description;
        const platos = req.body.platos;
        let incorrecto = [];
        let correcto = [];
        const menu = new Menu({
            _id: _id,
            description: description,

        });
        console.log("platos: " + req.body.platos)
        for (let i = 0; i < platos.length; i++) {
            const query = { _id: platos[i] }
            console.log(query)
            var data = await myFunction(query);
            console.log("tam: " + data.length);

            if (data.length === 0) {
                incorrecto.push(platos[i]);
            } else {
                menu.dishes.push(data[0]);
            }
        }

        if (incorrecto.length > 0) {
            console.log("Algún plato está mal");
            console.log(util.inspect(incorrecto));
            console.log("NO SE HA ENCONTRADO a estos alimentos : " + util.inspect(incorrecto));
            let errors = [];
            for (let i = 0; i < incorrecto.length; i++) {
                errors.push({ msg: "El plato " + incorrecto[i] + " no ha sido encontrado." });
            }
            Dish.find({}, async function (err, docs) {
                if (err) {

                    console.log(err);
                } else {
                    // console.log("si" + docs)
                    const suma = await calculateKcal(docs);
                    // console.log("SUMA: " + suma)
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
            // console.log("Bien: -> " + correcto[0])

            // for (let i = 0; i < correcto.length; i++) {
            //     menu.dishes[i] = (correcto[i]);
            // }
            // console.log("AHORAAAAAAAAAAA" + util.inspect(menu))

            menu.save(async function (err) {
                if (err) {
                    console.log(err);
                } else {
                    Menu.find({}, async function (err, docs) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(docs)
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
        // console.log("FINAL")
        // // console.log(incorrecto.length)
        // if (incorrecto.lenght > 0){
        //     console.log("Hay alguno mal");
        // }else {
        //     console.log("Todo correcto");
        // }
    },

    updateMenu: function (req, res) {
        const query = { _id: req.params._id };
        console.log(query);

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
                        console.log(menu)

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
        console.log(query);
        console.log(req.body.title);
        const _id = req.body.title;
        const description = req.body.description;
        const dishes = req.body.platos;

        let errors = [];

        let resultados = [];
        let noEncontrados = [];
        console.log("\n\n" + dishes);

        const menu = {
            _id: _id,
            description: description,

        };

        for (let i = 0; i < dishes.length; i++) {
            const query = { _id: dishes[i] }
            console.log(query)
            var data = await myFunction(query);
            console.log("tam: " + data.length);

            if (data.length === 0) {
                noEncontrados.push(dishes[i]);
            } else {
                // console.log(menu);
                resultados.push(data[0])
                // menu.dishes.push(data[0]);
            }

        }
        if (noEncontrados.length > 0) {

            console.log("NO SE HA ENCONTRADO a estos alimentos : " + util.inspect(noEncontrados));
            for (let i = 0; i < noEncontrados.length; i++) {
                errors.push({ msg: "El plato " + noEncontrados[i] + " no ha sido encontrado." });
            }

            // const query = { _id: dishId }
            console.log(query);
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
                            console.log(menu)

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

            console.log("VECTORES: " + util.inspect(resultados));

            var newvalues = { description: description, dishes: resultados };
            Menu.findById(query).then(menuEncontrado => {
                if (menuEncontrado) {
                    console.log("Plato encontrado" + menuEncontrado);
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
                            console.log("\n\n\ Menu ACTUALIZADO: " + updatedMenu)
                            req.flash(
                                'success_msg',
                                'Menu has been updated'
                            );
                            res.redirect('/menu/view');
                        }
                    })

                }

            });


        }

    },

    insertPlanification: function (req, res) {
        console.log("En planificación");

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
        console.log(req.body);
        const _id = req.body.title;
        const description = req.body.description;
        const tipo = req.body.tipo;
        const menus = req.body.menus;

        let incorrecto = [];
        let correcto = [];
        const planificacion = new Planification({
            _id: _id,
            description: description,
            tipo: tipo

        });

        // console.log("menus: " + req.body.menus)
        // console.log(util.inspect(menus.length));

        for (let i = 0; i < menus.length; i++) {
            const query = { _id: menus[i] }
            // console.log(query)
            var data = await myFunctionMenu(query);
            // console.log("tam: " + data.length);

            if (data.length === 0) {
                incorrecto.push(menus[i]);
            } else {
                correcto.push(data[0]);
            }

        }
        if (incorrecto.length > 0) {
            console.log("Algún plato está mal");
            console.log(util.inspect(incorrecto));
            console.log("NO SE HA ENCONTRADO a estos alimentos : " + util.inspect(incorrecto));
            let errors = [];
            for (let i = 0; i < incorrecto.length; i++) {
                errors.push({ msg: "El menu " + incorrecto[i] + " no ha sido encontrado." });
            }
            Menu.find({}, async function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs)
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
                            errors,

                        }
                    });
                }
            }).sort({ _id: 1 });
        } else {

            console.log("Bueno");
            // let vector = [];
            // console.log(tipo)
            // if (tipo === "diaria"){
            //     console.log("Entra")
            //     const dias = [];
            //     let obj = {};
            //     for (let i=0; i < 1; i++){
            //         for (let j=0; j < correcto.length; j++){
            //             dias.push(correcto[j])
            //         }
            //         obj = {
            //             : dias
            //         }
            //         vector.push(obj);
            //     }
            //     console.log(util.inspect(vector[0]));
            // }
            // if (tipo === "semanal"){
            //     const vector = [];
            //     const dias = [];
            //     for (let i=0; i < 7; i++){
            //         for (let j=0; j < correcto.length; j++){
            //             dias.push(correcto[j])
            //         }
            //         vector.push(dias);
            //     }
            // }
            // if (tipo === "mensual"){
            //     const vector = [];
            //     const dias = [];
            //     for (let i=0; i < 31; i++){
            //         for (let j=0; j < correcto.length; j++){
            //             dias.push(correcto[j])
            //         }
            //         vector.push(dias);
            //     }
            // }


        }



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
            req.flash('success', "Objeto no existente");
            console.log(searchData);
        }

        const query = { _id: { $regex: `${searchData}` } };


        Planification.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                // console.log(docs);
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
        console.log("ENTRA")

        Planification.find(query, async function (err, doc) {
            if (err) {
                console.log(err);
            } else {
                let valores = [];
                console.log("\n\nDETAILS:\n ");
                // console.log(util.inspect(doc[0].menus[0]));
                for (let i = 0; i < doc[0].menus.length; i++) {
                    for (let j = 0; j < doc[0].menus[i].length; j++) {
                        console.log(util.inspect(doc[0]._id));
                        console.log(util.inspect(doc[0].menus[i][j]));
                        //     for (var k = 0; k < doc[0].menus[i][i + 1].length; k++) {
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


                // valores[0][0] + valores[1][0] + valores[2][0]
                // valores[0][1] + valores[1][1] + valores[2][1]

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

                console.log("\n----------------------------------------------------------------\n")

                console.log(util.inspect(doc[0].menus[0]));


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


    removePlanification: function (req, res) {

        let menuId = req.params._id;

        Planification.findByIdAndRemove(menuId, (err, menuRemoved) => {
            if (err) {
                console.log(err);
                return req.flash('danger', "Error, no se ha podido eliminar la planificación");
            }
            if (!menuRemoved) {
                return req.flash('danger', "No se puede eliminar el proyecto.");
            }

            Planification.find({}, async function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    // console.log(docs);
                    res.render('planification/getPlanification', {
                        items: {
                            req: req,
                            myObject: espTemplate,
                            myDocs: docs
                        }
                    });
                }
            }).sort({ _id: 1 })

        })
    },


    recomendation: function (req, res) {
        return res.status(200).render('recomendation/recomendation.ejs', {
            items: {
                req: req,
                myObject: espTemplate
            }
        });
    },

    recomendationView: function (req, res) {
        Recomendation.find({}, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                console.log(docs);
                res.render('recomendation/recomendationView.ejs', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: docs
                    }
                });
            }
        }).sort({ _id: 1 })

    },


    getRecomendation: async function (req, res) {

        const searchData = req.body._id;
        if ((searchData == null) || (searchData == "")) {
            req.flash('success', "No existente");
        }
        console.log(req.body);
        const query = { _id: { $regex: `${searchData}` } };

        Recomendation.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                res.render('recomendation/recomendationView.ejs', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: docs
                    }
                });
            }
        }).sort({ _id: 1 })
    },



    recomendationDetails: function (req, res) {
        let dishId = req.params._id;
        // console.log(dishId);
        const query = { _id: dishId };


        Recomendation.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                console.log(docs);
                res.render('recomendation/recomendationDetails.ejs', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: docs[0]
                    }
                });
            }
        }).sort({ _id: 1 })

    },

    removeRecomendation: function (req, res) {

        let recId = req.params._id;

        Recomendation.findByIdAndRemove(recId, (err, recRemoved) => {
            if (err) {
                return req.flash('danger', "Error, no se ha podido eliminar la recomendación.");
            }
            if (!recRemoved) {
                return req.flash('danger', "No se puede eliminar la recomendación.");
            }

            Recomendation.find({}, async function (err, docs) {
                if (err) {
                    console.log(err);
                } else {

                    res.render('recomendation/recomendationView', {
                        items: {
                            req: req,
                            myObject: espTemplate,
                            myDocs: docs,

                        }
                    });
                }
            }).sort({ _id: 1 })

        })
    },

    insertRecomendation: function (req, res) {

        res.render('recomendation/recomendationInsert', {
            items: {
                req: req,
                myObject: espTemplate

            }
        });

    },

    insertRecomendationPost: function (req, res) {
        console.log(req.body);
        const _id = req.body._id;
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

        const recomendacion = new Recomendation({
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
                Recomendation.find({}, async function (err, docs) {
                    if (err) {
                        console.log(err);
                    } else {

                        res.redirect("view")

                    }
                }).sort({ _id: 1 })

            }
        })
    },

    updateRecomendation: function (req, res) {
        let recId = req.params._id;
        const query = { _id: recId };

        Recomendation.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                console.log(docs);
                res.render('recomendation/updateRecomendation.ejs', {
                    items: {
                        req: req,
                        myObject: espTemplate,
                        myDocs: docs[0]
                    }
                });
            }
        }).sort({ _id: 1 })

    },




    updateRecomendationPost: function (req, res) {
        console.log(req.body);
        const query = { _id: req.params._id };


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
        Recomendation.findById(query).then(recEncontrado => {
            if (recEncontrado) {
                console.log("Recomendación encontrada" + recEncontrado);

                const set = { $set: recomendacion };
                console.log(set)
                Recomendation.updateOne(query, set, (err, updatedRec) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("\n\n\ Recomendación ACTUALIZADa: " + updatedRec)
                        req.flash(
                            'success_msg',
                            'Recomendación has been updated'
                        );
                        res.redirect('/recomendation/view');
                    }
                })
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

        Valuation.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                console.log(docs)
                console.log(query)
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
            req.flash('success', "Objeto no existente");
        }
        console.log(searchData);
        let query = { candidato: { $regex: `${searchData}` } };
        console.log(query)

        Valuation.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                console.log(docs)
                console.log(query)
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

        Recomendation.find({}, async function (err, docs) {
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
                                                myRecomendations: recomendaciones,
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
        console.log("\n\n\n")
        console.log(req.body)
        const recomendacion = req.body.recomendacion;
        const tipo = req.body.tipos;
        const candidato = req.body.select;



        const resultado = await evaluador(recomendacion, tipo, candidato);
        console.log(resultado);


        const valuation = new Valuation({
            recomendacion: recomendacion,
            tipo: tipo,
            candidato: candidato,
            resultados: resultado

        });


        valuation.save()
            .then(data => {
                res.send(data);
                // res.redirect("/");
            }).catch(err => {
                res.status(500).send({
                    message: err.message
                });
            });

    },

    removeEvaluation: function (req, res) {
        console.log(req.params)
        let evalId = req.params.id;

        Valuation.findByIdAndRemove(evalId, (err, evalIdRemoved) => {
            if (err) {
                return req.flash('danger', "Error, no se ha podido eliminar la valoración.");
            }
            if (!evalIdRemoved) {
                return req.flash('danger', "No se puede eliminar la valoración.");
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
            errors.push({ msg: 'Please enter all fields' });
        }

        // req.checkBody('req.body.email', 'Email is invalid').notEmpty();

        if (password != password2) {
            errors.push({ msg: 'Passwords do not match' });
        }

        if (password.length < 6) {
            errors.push({ msg: 'Password must be at least 6 characters' });
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
                    errors.push({ msg: 'Email already exists' });
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
                                        'You are now registered and can log in'
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
        console.log("\n\n MUESTRA USUARIOS")
        Users.find({}, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                console.log(docs);
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
                return req.flash('danger', "Error, no se ha podido eliminar el plato");
            }
            if (!userId) {
                return req.flash('danger', "No se puede eliminar el proyecto.");
            }
            console.log(userId);
            Users.find({}, async function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
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
                console.log(docs);
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
        console.log("\n\nPOST BODY: ");
        console.log(util.inspect(req.body));
        console.log("\n\nPOST PARAMS: ");
        console.log(util.inspect(req.params._id));


        const { name, email, username, password, password2, rol } = req.body;
        let errors = [];

        if (!name || !email || !username || !password || !password2 || !rol) {
            errors.push({ msg: 'Please enter all fields' });
        }

        req.checkBody('req.body.email', 'Email is invalid').notEmpty();

        if (password != password2) {
            errors.push({ msg: 'Passwords do not match' });
        }

        if (password.length < 6) {
            errors.push({ msg: 'Password must be at least 6 characters' });
        }

        if (errors.length > 0) {


            Users.find({ _id: req.params._id }, async function (err, docs) {
                if (err) {
                    console.log(err);
                } else {

                    console.log(docs);
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
            console.log(id);

            var newvalues = { name: name, username: username, rol: rol, email: email, password: password };
            User.findById(query).then(user => {
                if (user) {
                    console.log("Usuario encontrado" + user);
                    const newUser = {
                        name,
                        email,
                        username,
                        rol
                    };

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newvalues.password, salt, (err, hash) => {
                            if (err) throw err;

                            newUser.password = hash;
                            const set = { $set: newUser };
                            console.log(set);
                            Users.updateOne(query, set, (err, updateUser) => {
                                if (err) {
                                    console.log(err);
                                } else {

                                    req.flash(
                                        'success_msg',
                                        'User has been updated'
                                    );
                                    res.redirect('/users');
                                }
                            })

                        });
                    });
                }

            });

        }

    },


    logUser: function (req, res, next) {
        passport.authenticate('local', {
            successRedirect: '/dashboard',
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
        req.flash('success_msg', 'You are logged out');
        res.render('user/login', {
            items: {
                req: req,
                myObject: espTemplate
            }
        });
    },

    autocomplete: function (req, res) {
        const query = { shrt_desc: { $regex: req.query["term"] } };

        client.connect(function (err, client) {
            assert.equal(null, err);
            console.log("\nConnected successfully to server");
            const db = client.db(name);
            const collection = db.collection("food");
            findLimit(db, query, collection, function (data) {
                console.log(data)
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
        console.log(query)
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
        console.log("Fetch all Users");

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
        console.log("Fetch all Users");

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
        console.log("Fetch all Users");

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
    // console.log(query)
    collection
        .find(query)
        .limit(200)
        .sort({ ndb_no: 1 })
        .toArray(function (err, docs) {
            assert.equal(err, null);
            // console.log("\nFound the following records");
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
    console.log("calculateNutrients")
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
    console.log("calculateNutrients")
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
    vector.push(valores["cholestrl"]);
    vector.push(valores["sugar"]);

    console.log("DEVUEVE ESTO:::::::::" + util.inspect(vector))
    return vector;
}


async function calculateNutrientsMenu(doc) {
    console.log("\n\nLo que le paso a nutrients menu es: " + util.inspect(doc));
    let vector = [];
    // let nut_vector = [];
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
        sodium.toFixed(2),
        cholestrl.toFixed(2),
        sugar.toFixed(2)
    ]

    return total;
}



async function calculateNutrientsPlanificacion(doc) {
    let valores = [];
    for (let i = 0; i < doc[0].menus.length; i++) {
        for (let j = 0; j < doc[0].menus[i].length; j++) {
            console.log(util.inspect(doc[0]._id));
            console.log(util.inspect(doc[0].menus[i][j]));
            //     for (var k = 0; k < doc[0].menus[i][i + 1].length; k++) {
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


    // valores[0][0] + valores[1][0] + valores[2][0]
    // valores[0][1] + valores[1][1] + valores[2][1]

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
    return Recomendation.find(query).exec()
}




async function evaluador(recomendacion, tipo, candidato) {
    let resultados = [];
    const queryR = { _id: recomendacion };
    const recData = await myFunctionRecomendacion(queryR);
    console.log("Se ha seleccionado la recomendación: " + recData);
    console.log(tipo);

    if (tipo === "0") {
        console.log("Se ha seleccionado platos: ");
        const queryC = { _id: candidato };
        console.log(queryC);
        const CanData = await myFunction(queryC);
        console.log("Se ha seleccionado la planificacion: " + CanData._id);
        const nutrientes = await calculateNutrientsDish(CanData);
        console.log(util.inspect(nutrientes[0]));
        const datos = await calculadora(recData, nutrientes);
        console.log(datos);
        return datos;

    } else if (tipo === "1") {
        console.log("Se ha seleccionado menus: ");
        const queryC = { _id: candidato };
        const CanData = await myFunctionMenu(queryC);
        console.log("Se ha seleccionado la planificacion: " + CanData._id);
        const nutrientes = await calculateNutrientsMenu(CanData[0]);
        console.log(nutrientes);
        const datos = await calculadora(recData, nutrientes);
        console.log(datos);
        return datos;
    } else if (tipo === "2") {
        console.log("Se ha seleccionado planificacion: ");
        const queryC = { _id: candidato };
        const CanData = await myFunctionPlanification(queryC);
        console.log("Se ha seleccionado la planificacion: " + CanData[0]._id);
        const nutrientes = await calculateNutrientsPlanificacion(CanData);
        console.log(nutrientes);
        const datos = await calculadora(recData, nutrientes);
        console.log(datos);
        return datos;
    }



}


async function calculadora(recData, nutrientes) {

    console.log("-------- CALCULADORA --------");
    const obj = {
        energia: [nutrientes[1], await energy(recData[0], nutrientes)],
        proteinas: [nutrientes[2], await proteinas(recData[0], nutrientes)],
        lipidos: [nutrientes[3], await lipidos(recData[0], nutrientes)],
        carbohidratos: [nutrientes[4], await carbohidratos(recData[0], nutrientes)]
    }

    return (obj);

};

async function energy(recData, nutrientes) {
    if ((parseInt(nutrientes[1]) > recData.energyMin) && (parseInt(nutrientes[1]) < recData.energyMax)) {
        const resultEnergia = "Muy recomendable"
        console.log(resultEnergia);
        return resultEnergia;
    } else if ((parseInt(nutrientes[1]) > recData.energyMin - 200) && (parseInt(nutrientes[1]) < recData.energyMax + 200)) {
        const resultEnergia = "Recomendable"
        console.log(resultEnergia);
        return resultEnergia;
    } else {
        const resultEnergia = "No recomendable"
        console.log(resultEnergia);
        return resultEnergia;
    }

};

async function proteinas(recData, nutrientes) {
    if ((parseInt(nutrientes[2]) > recData.proteinMin) && (parseInt(nutrientes[2]) < recData.proteinMax)) {
        const resultproteins = "Muy recomendable"
        console.log(resultproteins);
        return resultproteins;
    } else if ((parseInt(nutrientes[2]) > recData.proteinMin - 50) && (parseInt(nutrientes[2]) < recData.proteinMax + 50)) {
        const resultproteins = "Recomendable"
        return resultproteins;
    } else {
        const resultproteins = "No recomendable"
        console.log(resultproteins);
        return resultproteins;
    }

};

async function lipidos(recData, nutrientes) {
    if ((parseInt(nutrientes[3]) > recData.lipidsMin) && (parseInt(nutrientes[3]) < recData.lipidsMax)) {
        const resultlipidos = "Muy recomendable"
        console.log(resultlipidos);
        return resultlipidos;
    } else if ((parseInt(nutrientes[3]) > recData.lipidsMin - 100) && (parseInt(nutrientes[3]) < recData.lipidsMax + 100)) {
        const resultlipidos = "Recomendable"
        console.log(resultlipidos);
        return resultlipidos;
    } else {
        const resultlipidos = "No recomendable"
        console.log(resultlipidos);
        return resultlipidos;
    }
};

async function carbohidratos(recData, nutrientes) {
    if ((parseInt(nutrientes[4]) > recData.carbohydrtMin) && (parseInt(nutrientes[4]) < recData.carbohydrtMax)) {
        const resultcarbohidratos = "Muy recomendable"
        console.log(resultcarbohidratos);
        return resultcarbohidratos;
    } else if ((parseInt(nutrientes[4]) > recData.carbohydrtMin - 300) && (parseInt(nutrientes[4]) < recData.carbohydrtMax + 300)) {
        const resultcarbohidratos = "Recomendable"
        console.log(resultcarbohidratos);
        return resultcarbohidratos;
    } else {
        const resultcarbohidratos = "No recomendable"
        console.log(resultcarbohidratos);
        return resultcarbohidratos;
    }

};

function isValidURL(url) {
    var RegExp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

    if (RegExp.test(url)) {
        return true;
    } else {
        return false;
    }
}

async function createPlato (valor){

    if ((valor.recipe) && (valor.imageURL)) {
        const plato = new Dish({
            _id: valor._id,
            description: valor.description,
            ingredients: valor.ingredients,
            recipe: valor.recipe,
            imageURL: valor.imageURL
        });
      
        console.log(plato._id)
        return plato
    }


    if ((valor.recipe) && (!valor.imageURL)) {
        const plato = new Dish({
            _id: valor._id,
            description: valor.description,
            ingredients: valor.ingredients,
            recipe: valor.recipe
        });
        console.log(plato._id)
        return plato
    }

    if (!(valor.recipe) && (valor.imageURL)) {
        const plato = new Dish({
            _id: valor._id,
            description: valor.description,
            ingredients: valor.ingredients,
            imageURL: valor.imageURL
        });
        console.log(plato._id)
        return plato
    }

    if (!(valor.recipe) && !(valor.imageURL)) {
        const plato = new Dish({
            _id: valor._id,
            description: valor.description,
            ingredients: valor.ingredients,
        });
        console.log(plato._id)
        return plato
    }

}

module.exports = controller;

