const express = require('express')
const path = require('path')
const router = require('./routes/MyRouter.js')
const app = express()
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config({path: './.env'})

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});
db.connect((err) => {
    if (err) {
        console.error('not conect:', err);
        return;
    }
    console.log('connecting!');
});

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.json());//new+++++
app.use(express.urlencoded({extended:false}))
app.use(router)
app.use(express.static(path.join(__dirname, 'public')))

app.listen(8080, () => {
    console.log("http://localhost:8080")
})