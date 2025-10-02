const express = require('express')
const path = require('path')
const router = require('./routes/MyRouter.js')
const app = express()
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Fatcat14.exe',
    database: 'community'
});

connection.connect((err) => {
    if (err) {
        console.error('not conect:', err);
        return;
    }
    console.log('connecting!');
});
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(router)

app.listen(8080, () => {
    console.log("http://localhost:8080")
})