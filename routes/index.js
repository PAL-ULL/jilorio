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
router.get("/menu/update/:_id/autocomplete/", controller.autocompleteMenu2);
router.post("/menu/insert", controller.insertMenuPost);
router.get("/menu/update/:_id", controller.updateMenu);
router.post("/menu/update/:_id", controller.updateMenuPost);

router.get("/planification", controller.planification);
router.get("/planification/view", controller.planificationView);
router.get("/planification/insert", controller.insertPlanification);
router.get("/planification/:_id?", controller.planificationDetails);
router.post("/planification/insert", controller.insertPlanificationPost);
router.post("/planification/view:_id?", controller.getPlanification);
router.get("/planification/delete/:_id", controller.removePlanification);
router.get("/planification/insert/autocomplete/", controller.autocompletePlanificacion);

router.get("/recomendation", controller.recomendation);
router.get("/recomendation/view", controller.recomendationView);
router.get("/recomendation/insert", controller.insertRecomendation);
router.post("/recomendation/insert", controller.insertRecomendationPost);
router.get("/recomendation/update/:_id", controller.updateRecomendation);
router.post("/recomendation/update/:_id", controller.updateRecomendationPost);
router.get("/recomendation/:_id?", controller.recomendationDetails);
router.get("/recomendation/delete/:_id", controller.removeRecomendation);

// router.post("/menu/update/:_id", controller.updateMenuPost);
router.get("/evaluation", controller.evaluation);
router.post("/evaluation/create/load/post", controller.createEvaluationPost);
router.get("/evaluation/create", controller.createEvaluation);
router.get("/evaluation/view", controller.getEvaluation);
router.get("/evaluation/delete/:id", controller.removeEvaluation);


router.get("/evaluation/create/load/dishes", controller.loadDataDishes);
router.get("/evaluation/create/load/menus", controller.loadDataMenus);
router.get("/evaluation/create/load/planifications", controller.loadDataPlanifications);

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