'use strict'

// MongoDB 
let mongo = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
let assert = require("assert");
const user = "myFirstUser";
const password = "myFirstPassword";
const host = "193.145.96.30";
const port = "8081";
const name = "usda-db";
const url = `mongodb://${user}:${password}@${host}:${port}/${name}`;
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

const bcrypt = require('bcryptjs')
const passport = require('passport')

// Lang template
const espTemplate = require("../templates/esp.json");
const dish = require("../public/javascripts/dish.js");

// Bring mondels
const Dish = require("../models/dish");
const User = require("../models/user");

var util = require('util');


// Routes
let controller = {
    home: function (req, res) {
        return res.status(200).render('index.ejs', {
            items: {
                myObject: espTemplate
            }
        });
    },

    food: function (req, res) {
        return res.status(200).render('food/food.ejs', {
            items: {
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
                console.log(data);
                res.render('food/getFood', {
                    items: {
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
                myObject: espTemplate
            }
        });
    },

    dishView: async function (req, res) {
        Dish.find({}, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                // console.log(docs);
                const suma = await calculateKcal(docs);

                res.render('dish/getDish', {
                    items: {
                        myObject: espTemplate,
                        myDocs: docs,
                        myKcal: suma

                    }
                });
            }
        })
    },
    dishDetails: async function (req, res) {
        let dishId = req.params._id;
        console.log(dishId);
        const query = { _id: dishId };

        Dish.find(query, async function (err, doc) {
            if (err) {
                console.log(err);
            } else {
                
                const nutrientes = await calculateNutrients(doc);
                console.log("-------------------------------------------> \n" + util.inspect(nutrientes[0]));
                res.render('dish/dishDetails', {
                    items: {
                        myObject: espTemplate,
                        myDocs: doc[0],
                        myNutrients: nutrientes[0],
                        myNutIngredients: nutrientes[1]
                    }
                });
            }
        })
    },


    getDish: async function (req, res) {
        const searchData = req.body.title;
        if ((searchData == null) || (searchData == "")) {
            req.flash('success', "Objeto no existente");
        }
        console.log(searchData);
        const query = { title: { $regex: `${searchData}` } };

        Dish.find(query, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                // console.log(docs);
                const suma = await calculateKcal(docs);
                console.log(suma);
                console.log(docs);
                res.render('dish/getDish', {
                    items: {
                        myObject: espTemplate,
                        myDocs: docs,
                        myKcal: suma
                    }
                });
            }
        })
    },

    addDish: function (req, res) {
        Dish.find({}, function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                res.render('dish/addDish.ejs', {
                    items: {
                        myObject: espTemplate,

                    }
                });
            }
        })
    },

    removeDish: function (req, res) {

        let dishId = req.params._id;
        console.log("LLama a REMOVE");
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
                    // console.log(docs);
                    const suma = await calculateKcal(docs);
    
                    res.render('dish/getDish', {
                        items: {
                            myObject: espTemplate,
                            myDocs: docs,
                            myKcal: suma
    
                        }
                    });
                }
            })
            // return res.status(200).render('getDish', {
            //     items: {
            //         myObject: espTemplate,
            //         myDocs: docs,
            //         myKcal: suma
            //     }
            // });
        })
    },


    saveDish: function (req, res) {
        let dish = new Dish();

        let params = req.body;
        dish.title = params.title;
        dish.description = params.description;
        dish.ingredients = params.ingredients;

        dish.save((err, dishStored) => {
            if (err) return res.status(500).send({ message: "Error al guardar documento" });
            if (!dishStored) return res.status(400).send({ message: "No se ha podido guardar" });
            return res.status(200).send({ message: "Se ha podido guardar" })
        })
    },

    menu: function (req, res) {
        return res.status(200).render('menu/menu.ejs', {
            items: {
                myObject: espTemplate
            }
        });
    },

    planification: function (req, res) {
        return res.status(200).render('planification/planification.ejs', {
            items: {
                myObject: espTemplate
            }
        });
    },

    recomendation: function (req, res) {
        return res.status(200).render('recomendation/recomendation.ejs', {
            items: {
                myObject: espTemplate
            }
        });
    },

    evaluation: function (req, res) {
        return res.status(200).render('evaluation/evaluation.ejs', {
            items: {
                myObject: espTemplate
            }
        });
    },


    register: function (req, res) {

        res.render('user/register', {
            items: {
                myObject: espTemplate
            }
        });
    },

    newUser: function (req, res) {
        console.log("------------------> Todo bien");
        const name = req.body.name;
        console.log("NOMBRE: " + name);
        const email = req.body.email;
        console.log("email: " + email);
        const username = req.body.username;
        console.log("username: " + username);
        const password = req.body.password;
        console.log("password: " + password);
        const password2 = req.body.password2;
        console.log("password2: " + password2);

        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('email', 'Email is not valid').isEmail();
        req.checkBody('username', 'Username is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

        let errors = req.validationErrors();
  
        if (errors) {

            res.render('user/register', {
                items: {
                    myObject: espTemplate,
                    errors
                }
            });
        } else {
            let newUser = new User({
                name: name,
                email: email,
                username: username,
                password: password
            });

            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(newUser.password, salt, function (err, hash) {
                    if (err) {
                        req.flash('danger', 'Error en la contraseña');
                        console.log(err);
                    }
                    newUser.password = hash;
                    newUser.save(function (err) {
                        if (err) {
                            console.log(err);
                            return;
                        } else {
                            req.flash('success', 'You are now registered and can log in');
                            res.render('user/login', {
                                items: {
                                    myObject: espTemplate,
                                    msg: "You are now registered and can log in"
                                }
                            });
                        }
                    });
                });
            });
        }
    },


    login: function (req, res) {
        const errors = req.flash().error || [];
        res.render('user/login', {
            items: {
                myObject: espTemplate,
                errors
            }
        });
    },

    logUser: function (req, res) {
        passport.authenticate('local', {
            successRedirect: '/home',
            failureRedirect: '/login',
            failureFlash: true

        })(req, res);

    },
};

async function findAllDocuments(db, query, collection, callback) {

    collection
        .find(query)
        .limit(10)
        .toArray(function (err, docs) {
            assert.equal(err, null);
            console.log("\nFound the following records");

            callback(docs);
        });

}

async function calculateKcal(docs) {
    let arrayNutrientes = [];
    let sumasKcal = [];
    for (let i = 0; i < docs.length; i++) {
        const nutrients = await dish.storeNutrients(docs[i].ingredients);
        let suma = 0;
        const valores = dish.computeNutrients(docs[i].ingredients, nutrients);
        sumasKcal.push(valores.energKcal);
    }
    return sumasKcal;
}

async function calculateNutrients(doc) {
    let arrayNutrientes = [];
    let sumasKcal = [];
    console.log("Calculando nutrientes:"+ doc[0].ingredients);
    const nutrients = await dish.storeNutrients(doc[0].ingredients);
    console.log(nutrients);
    const valores = dish.computeNutrients(doc[0].ingredients, nutrients);
    let vector = [valores, nutrients];
    return vector;
}




module.exports = controller;