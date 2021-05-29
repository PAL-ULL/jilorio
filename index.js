
'use strict'

var mongoose = require("mongoose");


const user = "jilorio";
const password = "jilorio";
const host = "127.0.0.0";
const port = "27017";
const name = "entullo";


//cargar config

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb+srv://${user}:${password}@entullo.q8g1t.mongodb.net/${name}?retryWrites=true&w=majority`)
	.then(() => {
		console.log("\nConexión a la base de datos establecida.");

	})
	.catch(err => console.log(err));
