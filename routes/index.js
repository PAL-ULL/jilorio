"use strict"

const express = require('express');
const controller = require("../controllers/mainController");
// const {ensureAuthenticated} = require('../config/auth')
const router = express.Router();
const {isAuthenticated, authRole, authRoleMultiple} = require("../config/helper");
router.get("/", controller.home);


router.get("/food", controller.food);
router.get("/food/view", isAuthenticated,  controller.foodView);
router.post("/food/view", isAuthenticated,  controller.getFood);
router.post("/food/:shrt_desc?", isAuthenticated, authRole("default"), controller.getFood);
// router.post("/saveDish", controller.saveDish);

router.get("/dish", controller.dish);
router.get("/dish/view", isAuthenticated, controller.dishView);

router.post("/dish/view:_id?", isAuthenticated,controller.getDish);
// router.get("/dish/add", controller.addDish);
router.get("/dish/delete/:_id", isAuthenticated,  authRole("default"), controller.removeDish);
router.get("/dish/insert", isAuthenticated, authRole("default"), controller.insertDish);
router.get("/dish/insert/autocomplete/", isAuthenticated, authRole("default"), controller.autocomplete);
router.get("/dish/update/:_id/autocomplete/", isAuthenticated, authRole("default"), controller.autocomplete2);
// router.get("/dish/insert/check/", controller.check);
router.post("/dish/insert", isAuthenticated, authRole("default"), controller.insertDishPost);
router.get("/dish/insertJson",  controller.insertDishJson);
router.post("/dish/insertJson",  controller.insertDishJsonPost);
router.get("/dish/:_id", isAuthenticated, authRole("default"), controller.dishDetails);
router.get("/dish/update/:_id", isAuthenticated, authRole("default"), controller.updateDish);
router.post("/dish/update/:_id", isAuthenticated, authRole("default"), controller.updateDishPost);


router.get("/menu", controller.menu);
router.get("/menu/view", isAuthenticated, authRoleMultiple(["admin", "cocinero"]), controller.menuView);
router.post("/menu/view:_id?", isAuthenticated,  controller.getMenu);
router.get("/menu/delete/:_id", isAuthenticated, authRole("default"), controller.removeMenu);
router.get("/menu/insert", isAuthenticated, authRole("default"), controller.insertMenu);
router.get("/menu/:_id?", isAuthenticated, authRole("default"), controller.menuDetails);
router.get("/menu/insert/autocomplete/", authRole("default"), isAuthenticated, controller.autocompleteMenu);
router.get("/menu/update/:_id/autocomplete/", authRole("default"), isAuthenticated, controller.autocompleteMenu2);
router.post("/menu/insert", isAuthenticated, authRole("default"), controller.insertMenuPost);
router.get("/menu/update/:_id", isAuthenticated, authRole("default"), controller.updateMenu);
router.post("/menu/update/:_id", isAuthenticated, authRole("default"), controller.updateMenuPost);

router.get("/planification", controller.planification);
router.get("/planification/view", isAuthenticated,  controller.planificationView);
router.get("/planification/insert", isAuthenticated, authRole("default"), controller.insertPlanification);
router.get("/planification/:_id?", isAuthenticated, authRole("default"), controller.planificationDetails);
router.post("/planification/insert", isAuthenticated, authRole("default"), controller.insertPlanificationPost);
router.post("/planification/view:_id?", isAuthenticated, controller.getPlanification);
router.get("/planification/delete/:_id", isAuthenticated, authRole("default"), controller.removePlanification);
router.get("/planification/insert/autocomplete/", isAuthenticated, authRole("default"), controller.autocompletePlanificacion);

router.get("/recomendation", controller.recomendation);
router.get("/recomendation/view", isAuthenticated,  controller.recomendationView);
router.get("/recomendation/insert", isAuthenticated, authRole("default"), controller.insertRecomendation);
router.post("/recomendation/insert", isAuthenticated, authRole("default"), controller.insertRecomendationPost);
router.get("/recomendation/update/:_id", isAuthenticated, authRole("default"), controller.updateRecomendation);
router.post("/recomendation/update/:_id", isAuthenticated, authRole("default"), controller.updateRecomendationPost);
router.get("/recomendation/:_id?", isAuthenticated, authRole("default"), controller.recomendationDetails);
router.get("/recomendation/delete/:_id", isAuthenticated, authRole("default"), controller.removeRecomendation);

// router.post("/menu/update/:_id", controller.updateMenuPost);
router.get("/evaluation", controller.evaluation);
router.post("/evaluation/create/load/post", isAuthenticated, authRole("default"), controller.createEvaluationPost);
router.get("/evaluation/create", isAuthenticated, authRole("default"), controller.createEvaluation);
router.get("/evaluation/view", isAuthenticated, controller.getEvaluation);
router.get("/evaluation/delete/:id", isAuthenticated, authRole("default"), controller.removeEvaluation);


router.get("/evaluation/create/load/dishes", isAuthenticated, authRole("default"), controller.loadDataDishes);
router.get("/evaluation/create/load/menus", isAuthenticated, authRole("default"), controller.loadDataMenus);
router.get("/evaluation/create/load/planifications", isAuthenticated, authRole("default"),  controller.loadDataPlanifications);

router.get("/register", controller.register);
router.get("/login", controller.login);
router.post("/register", controller.newUser);
router.post("/login", controller.logUser);
router.get("/dashboard", controller.dashboard);
router.get("/logout", controller.logout);
router.get("/users", isAuthenticated, authRole("admin"), controller.viewUsers);
router.get("/users/delete/:_id", isAuthenticated, authRole("admin"), controller.removeUser);
router.get("/users/update/:_id", isAuthenticated, authRole("admin"), controller.updateUser);
router.post("/users/update/:_id", isAuthenticated, authRole("admin"), controller.updateUserPost);


router.get("*", controller.all);
module.exports = router;