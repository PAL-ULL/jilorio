"use strict"

const express = require('express');
const controller = require("../controllers/mainController");

const router = express.Router();

router.get("/home", controller.home);

router.get("/food", controller.food);
router.get("/food/view", controller.foodView);
router.post("/food/view", controller.getFood);
router.post("/food/:shrt_desc?", controller.getFood);
router.post("/saveDish", controller.saveDish);

router.get("/dish", controller.dish);
router.get("/dish/view", controller.dishView);
router.post("/dish/view:title?", controller.getDish);
router.get("/dish/add", controller.addDish);
router.get("/dish/delete/:_id", controller.removeDish);
router.get("/dish/:_id", controller.dishDetails);

router.get("/menu", controller.menu);

router.get("/planification", controller.planification);

router.get("/recomendation", controller.recomendation);

router.get("/evaluation", controller.evaluation);

router.get("/register", controller.register);
router.post("/register", controller.newUser);
router.get("/login", controller.login);
router.post("/login", controller.logUser);


module.exports = router;