var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');



const config = require('./config/database');
require('./config/passport')(passport);

mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function(err){
  console.log(err);
});

const app = express();


// Settings

app.set("views", __dirname + '/views');
app.set("view engine", 'ejs');

// cargar archivos de rutas
const rutas = require("./routes/index");

// middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('short')); // Veo las peticiones que se hacen
app.use(express.static(__dirname + '/public'));

// Express session middleware
app.use(session({
    secret: 'test secret',
    resave: true,
    saveUninitialized: true
}))

// Express passport
app.use(passport.initialize());
app.use(passport.session());



// Express Messages Middleware
app.use(flash());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
  });

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));


// rutas
app.use("/", rutas);



// Start Server
app.listen(8080, () => {
    console.log("Servidor corriendo correctamente en localhost:8080\n");
});

module.exports = app;

