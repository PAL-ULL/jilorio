"use strict"

const express = require('express');
const controller = require("../controllers/mainController");
// const {ensureAuthenticated} = require('../config/auth')
const router = express.Router();

router.get("/", controller.home);


router.get("/food", controller.food);
router.get("/food/view", controller.foodView);
router.post("/food/view", controller.getFood);
router.post("/food/:shrt_desc?", controller.getFood);
// router.post("/saveDish", controller.saveDish);

router.get("/dish", controller.dish);
router.get("/dish/view", controller.dishView);

router.post("/dish/view:_id?", controller.getDish);
// router.get("/dish/add", controller.addDish);
router.get("/dish/delete/:_id", controller.removeDish);
router.get("/dish/insert", controller.insertDish);
router.get("/dish/insert/autocomplete/", controller.autocomplete);
router.get("/dish/update/:_id/autocomplete/", controller.autocomplete2);
// router.get("/dish/insert/check/", controller.check);
router.post("/dish/insert", controller.insertDishPost);
router.get("/dish/:_id", controller.dishDetails);
router.get("/dish/update/:_id", controller.updateDish);
router.post("/dish/update/:_id", controller.updateDishPost);


router.get("/menu", controller.menu);
router.get("/menu/view", controller.menuView);
router.post("/menu/view:_id?", controller.getMenu);
router.get("/menu/delete/:_id", controller.removeMenu);
router.get("/menu/insert", controller.insertMenu);
router.get("/menu/:_id?", controller.menuDetails);
router.get("/menu/insert/autocomplete/", controller.autocompleteMenu);
router.post("/menu/insert", controller.insertMenuPost);

router.get("/planification", controller.planification);
router.get("/planification/view", controller.planificationView);
router.post("/planification/view:_id?", controller.getPlanification);
router.get("/planification/delete/:_id", controller.removePlanification);
router.get("/planification/:_id?", controller.planificationDetails);

router.get("/recomendation", controller.recomendation);
router.get("/evaluation", controller.evaluation);

router.get("/register", controller.register);
router.get("/login", controller.login);
router.post("/register", controller.newUser);
router.post("/login", controller.logUser);
router.get("/dashboard", controller.dashboard);
router.get("/logout", controller.logout);
router.get("/users", controller.viewUsers);
router.get("/users/delete/:_id", controller.removeUser);
router.get("/users/update/:_id", controller.updateUser);
router.post("/users/update/:_id", controller.updateUserPost);


router.get("*", controller.all);
module.exports = router;