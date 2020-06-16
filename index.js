
'use strict'

var mongoose = require("mongoose");
const user = "admin";
const password = "password123";
const host = "127.0.0.1";
const port = "27017";
const name = "entullo";

//cargar config

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${host}:${port}/${name}`)
.then(() =>{
  console.log("\nConexión a la base de datos establecida.");
 
})
.catch (err => console.log(err));
