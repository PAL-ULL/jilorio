'use strict'

// MongoDB 
let mongo = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
let assert = require("assert");
const user = "admin";
const password = "password123";
const host = "193.145.96.30";
const port = "8081";
const name = "entullo";
const url = `mongodb://${user}:${password}@${host}:${port}/${name}`;
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

const bcrypt = require('bcryptjs')
const passport = require('passport')

// Lang template
const espTemplate = require("../templates/esp.json");
const dish = require("../public/javascripts/dish.js");


// Bring mondels
const Dish = require("../models/dish");
const Menu = require("../models/menu");
const Planification = require("../models/planification");
const User = require("../models/user");

var util = require('util');

let ingredientes = [];
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

                for (let i = 0; i < docs.length; i++) {
                    console.log(docs[i].ingredients);
                }

                const suma = await calculateKcal(docs);

                res.render('dish/getDish', {
                    items: {
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
        console.log(dishId);
        const query = { _id: dishId };

        Dish.find(query, async function (err, doc) {
            if (err) {
                console.log(err);
            } else {
                const nutrientes = await calculateNutrients(doc);
                res.render('dish/dishDetails', {
                    items: {
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
        const title = req.body.title;
        console.log("title: " + title);
        const description = req.body.description;
        console.log("description: " + description);
        const recipe = req.body.recipe;
        console.log("receta: " + recipe);
        const imageURL = req.body.imageURL;
        console.log("imageURL: " + imageURL);


        req.checkBody('title', 'title is required').notEmpty();
        req.checkBody('description', 'description is required').notEmpty();
        let errors = req.validationErrors();
        if (typeof req.body.group !== "undefined") {
            console.log("\n\n\n" + util.inspect(req.body));
        }

        let query = {};

        const searchData = req.body.shrt_desc;
        console.log(searchData)
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
                console.log(resultArray.length)
                res.render('dish/insertDish', {
                    items: {
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
                console.log(docs);
                res.render('dish/getDish', {
                    items: {
                        myObject: espTemplate,
                        myDocs: docs,
                        myKcal: suma
                    }
                });
            }
        }).sort({ _id: 1 })
    },

    addDish: function (req, res) {
        Dish.find({}, function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                res.render('dish/addDish', {
                    items: {
                        myObject: espTemplate,

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
                            myObject: espTemplate,
                            myDocs: docs,
                            myKcal: suma

                        }
                    });
                }
            }).sort({ _id: 1 })

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

                res.render('menu/getMenu', {
                    items: {
                        myObject: espTemplate,
                        myDocs: docs
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
                    console.log(docs);
                    res.render('menu/getMenu', {
                        items: {
                            myObject: espTemplate,
                            myDocs: docs
                        }
                    });
                }
            }).sort({ _id: 1 })

        })
    },



    planification: function (req, res) {
        return res.status(200).render('planification/planification.ejs', {
            items: {
                myObject: espTemplate
            }
        });
    },

    planificationView: async function (req, res) {
        Planification.find({}, async function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                // for (var i = 0; i < docs[4].menus[4].length; i++) {
                for (var k = 0; k < docs[4].menus[4][5].length; k++) {
                    console.log(docs[4].menus[19][20][k]._id);
                }
                // console.log(docs[4].menus[4][5][k]._id);
                // }
                console.log(docs[4].menus[3][4].length);
                console.log(docs[4].menus[3][4].length);
                res.render('planification/getPlanification', {
                    items: {
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
                console.log(docs);
                res.render('planification/getPlanification', {
                    items: {
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
                console.log("\n\n\n" + doc[0] + "\n\n\n");
                // console.log(doc[0]);
                for (let i = 0; i < doc[0].menus.length; i++) {
                    for (var k = 0; k < doc[0].menus[i][i + 1].length; k++) {
                        const value = await calculateNutrientsMenu(doc[0].menus[i][i + 1][k])
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
                    water += (parseFloat(valores[i][0]))
                    energKcal += (parseFloat(valores[i][1]))
                    protein += (parseFloat(valores[i][2]))
                    lipidTotal += (parseFloat(valores[i][3]))
                    carbohydrt += (parseFloat(valores[i][4]))
                    fiber += (parseFloat(valores[i][5]))
                    sodium += (parseFloat(valores[i][6]))
                    cholestrl += (parseFloat(valores[i][7]))
                    sugar += (parseFloat(valores[i][8]))

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

                // console.log(util.inspect(newVector));


                res.render('planification/planificationDetails', {
                    items: {
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
                    console.log(docs);
                    res.render('planification/getPlanification', {
                        items: {
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

    // newUser: function (req, res) {
    //     console.log("------------------> Todo bien");
    //     const name = req.body.name;
    //     console.log("NOMBRE: " + name);
    //     const email = req.body.email;
    //     console.log("email: " + email);
    //     const username = req.body.username;
    //     console.log("username: " + username);
    //     const password = req.body.password;
    //     console.log("password: " + password);
    //     const password2 = req.body.password2;
    //     console.log("password2: " + password2);

    //     req.checkBody('name', 'Name is required').notEmpty();
    //     req.checkBody('email', 'Email is required').notEmpty();
    //     req.checkBody('email', 'Email is not valid').isEmail();
    //     req.checkBody('username', 'Username is required').notEmpty();
    //     req.checkBody('password', 'Password is required').notEmpty();
    //     req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    //     let errors = req.validationErrors();

    //     if (errors) {
    //         res.render('user/register', {
    //             items: {
    //                 myObject: espTemplate,
    //                 errors: errors
    //             }
    //         });
    //     } else {
    //         let newUser = new User({
    //             name: name,
    //             email: email,
    //             username: username,
    //             password: password
    //         });

    //         bcrypt.genSalt(10, function (err, salt) {
    //             bcrypt.hash(newUser.password, salt, function (err, hash) {
    //                 if (err) {
    //                     req.flash('danger', 'Error en la contraseña');
    //                     console.log(err);
    //                 }
    //                 newUser.password = hash;
    //                 newUser.save(function (err) {
    //                     if (err) {
    //                         console.log(err);
    //                         return;
    //                     } else {
    //                         req.flash('success', 'You are now registered and can log in');
    //                         res.redirect('login');
    //                     }
    //                 });
    //             });
    //         });
    //     }
    // },

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
            res.render('user/register',{items:  {
                myObject: espTemplate,
                errors,
                name,
                email,
                username,
                password,
                password2}
            });
        } else {
            User.findOne({ email: email }).then(user => {
                if (user) {
                    errors.push({ msg: 'Email already exists' });
                    res.render('user/register', {
                                    items: {
                        myObject: espTemplate,
                        errors,
                        name,
                        email,
                        username,
                        password,
                        password2}
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
                myObject: espTemplate,
                errors: errors
            }
        });
    },

    logUser: function (req, res, next) {
        passport.authenticate('local', {
            successRedirect: '/dashboard',
            failureRedirect: '/login',
            failureFlash: true
          })(req, res, next);

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
                myObject: espTemplate
            }
        });
    }
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

    let vector = [];
    let nut_vector = [];
    for (let i = 0; i < doc.dishes.length; i++) {
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




module.exports = controller;

