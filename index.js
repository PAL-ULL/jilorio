
'use strict'

var mongoose = require("mongoose");
const user = "admin";
const password = "password123";
const host = "193.145.96.30";
const port = "8081";
const name = "entullo";

//cargar config

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${user}:${password}@${host}:${port}/${name}`)
.then(() =>{
  console.log("\nConexión a la base de datos establecida.");
 
})
.catch (err => console.log(err));
