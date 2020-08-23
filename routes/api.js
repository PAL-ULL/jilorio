"use strict"

const express = require('express');
const apiController = require("../controllers/apiController");
const apiRouter = express.Router();


apiRouter.get("/api/food/search", apiController.food);
apiRouter.get("/api/food/:limit?/:name?", apiController.foodDocs);
apiRouter.get("/api/dish/:limit?/:name?", apiController.dishDocs);
apiRouter.get("/api/menu/:limit?/:name?", apiController.menuDocs);
apiRouter.get("/api/planning/:limit?/:name?", apiController.planDocs);
apiRouter.get("/api/recommendation/:limit?/:name?", apiController.recDocs);
apiRouter.get("/api/evaluation/:limit?/:name?", apiController.evalDocs);

module.exports = apiRouter;