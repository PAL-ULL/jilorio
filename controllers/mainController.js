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
        }else{

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

    evaluation: function (req, res) {
        return res.status(200).render('evaluation/evaluation.ejs', {
            items: {
                req: req,
                myObject: espTemplate
            }
        });
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
                        password,
                        rol
                    };

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newvalues.password, salt, (err, hash) => {
                            if (err) throw err;

                            newUser.password = hash;
                            const set = { $set: newvalues };
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
                name: req.user.name,
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

    let nut_vector = [];
    for (let i = 0; i < doc[0].ingredients.length; i++) {
        const nutrients = await dish.storeNutrients(doc[0].ingredients[i]);
        nut_vector.push(nutrients);
    }

    const valores = dish.computeNutrients(doc[0].ingredients, nut_vector);
    let vector = [valores, nut_vector];
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



async function myFunction(query) {
    return Dish.find(query).exec()
}

async function myFunctionMenu(query) {
    return Menu.find(query).exec()
}

module.exports = controller;

