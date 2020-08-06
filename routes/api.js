"use strict"

const express = require('express');
const apiController = require("../controllers/apiController");
const apiRouter = express.Router();


apiRouter.get("/food/search", apiController.food);

module.exports = apiRouter;