// const moongose = require('mongoose');
require('./config/db');

const express = require('express');
const exphbs = require('express-handlebars');
const handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const path = require('path')
const router = require('./routes/index');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const createError = require('http-errors');
const passport = require('./config/passport');

require('dotenv').config({ path: 'variables.env' });

const app = express();

//HABILITAR BODY-PARSER
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
//validacion de campo con express-validator

app.use(expressValidator());

//HABLILITAR HANDLEBARS COMO VIEW
app.engine('handlebars',
    exphbs({
        handlebars: allowInsecurePrototypeAccess(handlebars),
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars'),
    })
);

app.set('view engine', 'handlebars');

//STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE })
}));

//inicializar passport e
app.use(passport.initialize());
app.use(passport.session());

//alertas y flash mesages
app.use(flash());

//crear nuestro middleware
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    next();
})

app.use('/', router());

//404 pag no existentes
app.use((req, res, next) => {
    next(createError(404, 'No encontrado'));
});

//ADMINISTRACION DE LOS ERRORES
app.use((error, req, res, next) => {
    res.locals.mensaje = error.message;
    const status = error.status || 500;
    
    res.locals.status = status;
    res.status(status);


    res.render('error');
});


//PUERTO DE HEROKU
const host = '0.0.0.0';
const port = process.env.PORT;

app.listen(port,host, () => {
    console.log('El Servidor esta corriendo');
}); 