const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mysql = require('mysql');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Parsing middleware
// Parse application
app.use(bodyParser.urlencoded({extended : false}));

// Parse application/json
app.use(bodyParser.json());

// Static files or public files
app.use(express.static('public'));

// Handlebars Setup
app.engine('hbs', exphbs.engine({extname: '.hbs' }));
app.set('view engine', 'hbs');

// Connection to Database
const pool = mysql.createPool({
    connectionLimit : 100,
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME
})

pool.getConnection((err, connection) => {
    if(err) throw err; // Error occur
    console.log('Connected as ID '+connection.threadId);
});

const routes = require('./server/routes/user');
app.use('/', routes);

app.listen(port, () => console.log(`Listening on port ${port}`));