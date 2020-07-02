"use strict"

const express = require('express');
const controller = require("../controllers/mainController");
// const {ensureAuthenticated} = require('../config/auth')
const router = express.Router();
const {isAuthenticated, authRole, authRoleMultiple} = require("../config/helper");


router.get("/", controller.home);

router.get("/food", controller.food);
router.get("/food/view", authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]), controller.foodView);
router.post("/food/view",  authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]), controller.getFood);
router.post("/food/:shrt_desc?",  authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]), controller.getFood);
// router.post("/saveDish", controller.saveDish);


router.get("/dish", controller.dish);
router.get("/dish/view",  authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]), controller.dishView);
router.post("/dish/view:_id?",  authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]), controller.getDish);
// router.get("/dish/add", controller.addDish);
router.get("/dish/delete/:_id",  authRoleMultiple(["admin", "nutricionista", "cocinero"]),  controller.removeDish);
router.get("/dish/insert", authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.insertDish);
router.get("/dish/insert/autocomplete/", authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.autocomplete);
router.get("/dish/update/:_id/autocomplete/", authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.autocomplete2);
// router.get("/dish/insert/check/", controller.check);
router.post("/dish/insert", authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.insertDishPost);

// router.get("/dish/insert/json",authRoleMultiple(["admin", "cocinero", "nutricionista"]), controller.insertDishJson);
// router.post("/dish/insert/json", authRoleMultiple(["admin", "cocinero", "nutricionista"]), controller.insertDishJsonPost);
router.get("/dish/insert/json", authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.insertDishJson);
router.post("/dish/insert/json", controller.insertDishJsonPost);
router.get("/dish/:_id", authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]), controller.dishDetails);
router.get("/dish/update/:_id", authRoleMultiple(["admin", "nutricionista", "cocinero"]),  controller.updateDish);
router.post("/dish/update/:_id",  authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.updateDishPost);
router.get("/dish/download/:_id",  authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]),  controller.downloadDish);



router.get("/menu", controller.menu);
router.get("/menu/view",  authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]),  controller.menuView);
router.post("/menu/view:_id?", authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]),  controller.getMenu);
router.get("/menu/delete/:_id", authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.removeMenu);
router.get("/menu/insert",  authRoleMultiple(["admin", "nutricionista", "cocinero"]),  controller.insertMenu);
router.get("/menu/:_id?",  authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]),   controller.menuDetails);
router.get("/menu/insert/autocomplete/",  authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.autocompleteMenu);
router.get("/menu/update/:_id/autocomplete/", authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.autocompleteMenu2);
router.post("/menu/insert", authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.insertMenuPost);
router.get("/menu/insert/json", authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.insertMenuJson);
router.post("/menu/insert/json", authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.insertMenuJsonPost);
router.get("/menu/update/:_id", authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.updateMenu);
router.post("/menu/update/:_id", authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.updateMenuPost);
router.get("/menu/download/:_id", authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]), controller.downloadMenu);


router.get("/planification", controller.planification);
router.get("/planification/view",  authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]),  controller.planificationView);
router.get("/planification/insert",  authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.insertPlanification);
router.get("/planification/update/:_id",  authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.updatePlanification);
// router.post("/planification/update/:_id", controller.updatePlanificationPost);
router.get("/planification/:_id?",  authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]),  controller.planificationDetails);
// router.post("/planification/insert", controller.insertPlanificationPost);
router.post("/planification/view:_id?", authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]),  controller.getPlanification);
router.get("/planification/insert/json", authRoleMultiple(["admin", "nutricionista", "cocinero"]),  controller.insertPlanificationJson);
router.post("/planification/insert/json",  authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.insertPlanificationJsonPost);
router.get("/planification/delete/:_id",  authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.removePlanification);
router.get("/planification/insert/autocomplete/",  authRoleMultiple(["admin", "nutricionista", "cocinero"]),  controller.autocompletePlanificacion);
router.get("/planification/create/load/menus",  authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.loadDataMenus);
router.post("/planification/create/load/post",  authRoleMultiple(["admin", "nutricionista", "cocinero"]),  controller.insertPlanificationPost);
router.post("/planification/update/create/load/post",  authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.updatePlanificationPost);
router.get("/planification/download/:_id",  authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]),  controller.downloadPlanification);

router.get("/recomendation", controller.recomendation);
router.get("/recomendation/view",  isAuthenticated,  authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]), controller.recomendationView);
router.get("/recomendation/insert",   authRoleMultiple(["admin", "nutricionista"]), controller.insertRecomendation);
router.post("/recomendation/insert", authRoleMultiple(["admin", "nutricionista"]), controller.insertRecomendationPost);
router.get("/recomendation/update/:_id",   authRoleMultiple(["admin", "nutricionista"]), controller.updateRecomendation);
router.post("/recomendation/update/:_id",   authRoleMultiple(["admin", "nutricionista"]),  controller.updateRecomendationPost);
router.get("/recomendation/:_id?",  authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]), controller.recomendationDetails);
router.get("/recomendation/delete/:_id",  authRoleMultiple(["admin", "nutricionista", "cocinero"]),  controller.removeRecomendation);
router.post("/recomendation/view:_id?",  authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]),  controller.getRecomendation);
router.get("/recomendation/insert/json",  authRoleMultiple(["admin", "nutricionista"]),  controller.insertRecomendationJson);
router.post("/recomendation/insert/json",  authRoleMultiple(["admin", "nutricionista"]),  controller.insertRecomendationJsonPost);
router.get("/recomendation/download/:_id",  authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]),  controller.downloadRecomendation);


// router.post("/menu/update/:_id", controller.updateMenuPost);
router.get("/evaluation", controller.evaluation);
router.post("/evaluation/create/load/post",  authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.createEvaluationPost);
router.get("/evaluation/create",  authRoleMultiple(["admin", "nutricionista", "cocinero"]),  controller.createEvaluation);
router.get("/evaluation/view",   authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]),  controller.evaluationView);
router.post("/evaluation/view",  authRoleMultiple(["admin", "nutricionista", "cocinero", "default"]),  controller.getEvaluation);
router.get("/evaluation/delete/:id",  authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.removeEvaluation);


router.get("/evaluation/create/load/dishes",  authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.loadDataDishes);
router.get("/evaluation/create/load/menus",  authRoleMultiple(["admin", "nutricionista", "cocinero"]),  controller.loadDataMenus);
router.get("/evaluation/create/load/planifications",   authRoleMultiple(["admin", "nutricionista", "cocinero"]), controller.loadDataPlanifications);

router.get("/register", controller.register);
router.get("/login", controller.login);
router.post("/register", controller.newUser);
router.post("/login", controller.logUser);
router.get("/dashboard", controller.dashboard);
router.get("/logout", controller.logout);
router.get("/users",  authRoleMultiple(["admin"]),  controller.viewUsers);
router.post("/users/:_id?", authRoleMultiple(["admin"]),  controller.viewUsersPost);
router.get("/users/delete/:_id", authRoleMultiple(["admin"]),  controller.removeUser);
router.get("/users/update/:_id", authRoleMultiple(["admin"]), controller.updateUser);
router.post("/users/update/:_id", authRoleMultiple(["admin"]),  controller.updateUserPost);


router.get("*", controller.all);
module.exports = router;