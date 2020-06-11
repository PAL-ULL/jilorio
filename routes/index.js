"use strict"

const express = require('express');
const controller = require("../controllers/mainController");

const router = express.Router();

router.get("/", controller.home);

router.get("/food", controller.food);
router.get("/food/view", controller.foodView);
router.post("/food/view", controller.getFood);
router.post("/food/:shrt_desc?", controller.getFood);
router.post("/saveDish", controller.saveDish);

router.get("/dish", controller.dish);
router.get("/dish/view", controller.dishView);
router.post("/dish/view:_id?", controller.getDish);
// router.get("/dish/add", controller.addDish);
router.get("/dish/delete/:_id", controller.removeDish);
router.get("/dish/insert", controller.insertDish);
router.post("/dish/insert", controller.insertDish);
router.get("/dish/:_id", controller.dishDetails);


router.get("/menu", controller.menu);
router.get("/menu/view", controller.menuView);
router.post("/menu/view:_id?", controller.getMenu);
router.get("/menu/:_id", controller.menuDetails);
router.get("/menu/delete/:_id", controller.removeMenu);

router.get("/planification", controller.planification);
router.get("/planification/view", controller.planificationView);
router.post("/planification/view:_id?", controller.getPlanification);
router.get("/planification/delete/:_id", controller.removePlanification);
router.get("/planification/:_id?", controller.planificationDetails);

router.get("/recomendation", controller.recomendation);

router.get("/evaluation", controller.evaluation);

router.get("/register", controller.register);
router.post("/register", controller.newUser);
router.get("/login", controller.login);
router.post("/login", controller.logUser);


module.exports = router;