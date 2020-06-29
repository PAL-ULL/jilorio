"use strict"

const express = require('express');
const controller = require("../controllers/mainController");
// const {ensureAuthenticated} = require('../config/auth')
const router = express.Router();
const {isAuthenticated, authRole, authRoleMultiple} = require("../config/helper");


router.get("/", controller.home);

router.get("/food", controller.food);
router.get("/food/view", isAuthenticated, authRoleMultiple(["admin", "cocinero", "default", "cocinero", "nutricionista"]),  controller.foodView);
router.post("/food/view", isAuthenticated, authRoleMultiple(["admin", "cocinero", "default", "cocinero", "nutricionista"]), controller.getFood);
router.post("/food/:shrt_desc?", isAuthenticated, authRoleMultiple(["admin", "cocinero"]), controller.getFood);
// router.post("/saveDish", controller.saveDish);

router.get("/dish", controller.dish);
router.get("/dish/view",controller.dishView);
router.post("/dish/view:_id?", controller.getDish);
// router.get("/dish/add", controller.addDish);
router.get("/dish/delete/:_id", isAuthenticated,  authRoleMultiple(["admin", "cocinero", "nutricionista"]), controller.removeDish);
router.get("/dish/insert", isAuthenticated, authRoleMultiple(["admin", "cocinero", "nutricionista"]), controller.insertDish);
router.get("/dish/insert/autocomplete/", isAuthenticated, authRoleMultiple(["admin", "cocinero", "nutricionista"]), controller.autocomplete);
router.get("/dish/update/:_id/autocomplete/", isAuthenticated, authRoleMultiple(["admin", "cocinero", "nutricionista"]), controller.autocomplete2);
// router.get("/dish/insert/check/", controller.check);
router.post("/dish/insert", isAuthenticated, authRoleMultiple(["admin", "cocinero", "nutricionista"]), controller.insertDishPost);
// router.get("/dish/insert/json",authRoleMultiple(["admin", "cocinero", "nutricionista"]), controller.insertDishJson);
// router.post("/dish/insert/json", authRoleMultiple(["admin", "cocinero", "nutricionista"]), controller.insertDishJsonPost);
router.get("/dish/insert/json", controller.insertDishJson);
router.post("/dish/insert/json", controller.insertDishJsonPost);
router.get("/dish/:_id", isAuthenticated, authRoleMultiple(["admin", "cocinero", "nutricionista"]), controller.dishDetails);
router.get("/dish/update/:_id",  controller.updateDish);
router.post("/dish/update/:_id",  controller.updateDishPost);




router.get("/menu", controller.menu);
router.get("/menu/view", isAuthenticated, authRoleMultiple(["admin", "cocinero", "default", "nutricionista"]), controller.menuView);
router.post("/menu/view:_id?", isAuthenticated, authRoleMultiple(["admin", "cocinero", "default", "nutricionista"]), controller.getMenu);
router.get("/menu/delete/:_id", isAuthenticated, authRoleMultiple(["admin", "cocinero", "nutricionista"]), controller.removeMenu);
router.get("/menu/insert", controller.insertMenu);
router.get("/menu/:_id?", isAuthenticated, authRoleMultiple(["admin", "cocinero"]), controller.menuDetails);
router.get("/menu/insert/autocomplete/", isAuthenticated, authRoleMultiple(["admin", "cocinero", "nutricionista"]), controller.autocompleteMenu);
router.get("/menu/update/:_id/autocomplete/", isAuthenticated, authRoleMultiple(["admin", "cocinero", "nutricionista"]), controller.autocompleteMenu2);
router.post("/menu/insert", controller.insertMenuPost);
router.get("/menu/insert/json", isAuthenticated, authRoleMultiple(["admin", "cocinero", "default", "nutricionista"]), controller.insertMenuJson);
router.post("/menu/insert/json", isAuthenticated, authRoleMultiple(["admin", "cocinero", "default", "nutricionista"]), controller.insertMenuJsonPost);
router.get("/menu/update/:_id", controller.updateMenu);
router.post("/menu/update/:_id", controller.updateMenuPost);


router.get("/planification", controller.planification);
router.get("/planification/view",  controller.planificationView);
router.get("/planification/insert", controller.insertPlanification);
router.get("/planification/update/:_id", controller.updatePlanification);
// router.post("/planification/update/:_id", controller.updatePlanificationPost);
router.get("/planification/:_id?",  controller.planificationDetails);
// router.post("/planification/insert", controller.insertPlanificationPost);
router.post("/planification/view:_id?",  controller.getPlanification);
router.get("/planification/insert/json", isAuthenticated, authRoleMultiple(["admin", "cocinero", "default", "nutricionista"]), controller.insertPlanificationJson);
router.post("/planification/insert/json", isAuthenticated, authRoleMultiple(["admin", "cocinero", "default", "nutricionista"]), controller.insertPlanificationJsonPost);
router.get("/planification/delete/:_id", isAuthenticated, authRoleMultiple(["admin", "cocinero", "nutricionista"]), controller.removePlanification);
router.get("/planification/insert/autocomplete/",  controller.autocompletePlanificacion);
router.get("/planification/create/load/menus", controller.loadDataMenus);
router.post("/planification/create/load/post", controller.insertPlanificationPost);
router.post("/planification/update/create/load/post", controller.updatePlanificationPost);

router.get("/recomendation", controller.recomendation);
router.get("/recomendation/view", controller.recomendationView);
router.get("/recomendation/insert", isAuthenticated, authRoleMultiple(["admin", "cocinero", "nutricionista"]), controller.insertRecomendation);
router.post("/recomendation/insert", isAuthenticated, authRoleMultiple(["admin", "cocinero", "nutricionista"]), controller.insertRecomendationPost);
router.get("/recomendation/update/:_id", isAuthenticated, authRoleMultiple(["admin", "cocinero", "nutricionista"]), controller.updateRecomendation);
router.post("/recomendation/update/:_id", isAuthenticated, authRoleMultiple(["admin", "cocinero", "nutricionista"]), controller.updateRecomendationPost);
router.get("/recomendation/:_id?", isAuthenticated, authRoleMultiple(["admin", "cocinero", "nutricionista"]), controller.recomendationDetails);
router.get("/recomendation/delete/:_id", isAuthenticated, authRoleMultiple(["admin", "cocinero", "nutricionista"]), controller.removeRecomendation);
router.post("/recomendation/view:_id?", isAuthenticated, authRoleMultiple(["admin", "cocinero", "default", "nutricionista"]), controller.getRecomendation);
router.get("/recomendation/insert/json",  controller.insertRecomendationJson);
router.post("/recomendation/insert/json",  controller.insertRecomendationJsonPost);

// router.post("/menu/update/:_id", controller.updateMenuPost);
router.get("/evaluation", controller.evaluation);
router.post("/evaluation/create/load/post", isAuthenticated, authRoleMultiple(["admin", "nutricionista"]), controller.createEvaluationPost);
router.get("/evaluation/create", isAuthenticated, authRoleMultiple(["admin",  "nutricionista"]), controller.createEvaluation);
router.get("/evaluation/view", isAuthenticated, authRoleMultiple(["admin", "nutricionista"]),  controller.evaluationView);
router.post("/evaluation/view", isAuthenticated, authRoleMultiple(["admin", "nutricionista"]),  controller.getEvaluation);
router.get("/evaluation/delete/:id", isAuthenticated, authRoleMultiple(["admin", "nutricionista"]), controller.removeEvaluation);


router.get("/evaluation/create/load/dishes", isAuthenticated, authRoleMultiple(["admin", "nutricionista"]), controller.loadDataDishes);
router.get("/evaluation/create/load/menus", isAuthenticated, authRoleMultiple(["admin", "nutricionista"]), controller.loadDataMenus);
router.get("/evaluation/create/load/planifications", isAuthenticated, authRoleMultiple(["admin", "nutricionista"]),  controller.loadDataPlanifications);

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