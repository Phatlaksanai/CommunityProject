const express = require('express')
const router = express.Router()
const mysql = require('mysql2');
require('dotenv').config();
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

router.get("/",(req,res)=>{
    res.render("home.ejs")
})
router.get("/login",(req,res)=>{
    res.render("login.ejs")
})
router.get("/register",(req,res)=>{
    res.render("register.ejs")
})
router.get("/upload",(req,res)=>{
    res.render("upload.ejs")
})
router.post("/login",(req,res)=>{
    const {username, password} = req.body
    if (!username || !password) {
        return res.render("login.ejs", {error: "Please enter username or password."});
    }
    db.query('select * from user where username = ? AND password = ?',[username, password],(error,result)=>{
        if(error){
            console.log(error)
        }
        if(result.length > 0){
            return res.render("home.ejs",{success: "Login success."})
        }else{
            return res.render("login.ejs", {error: "Username or Password is incorrect."})
        }
    });
})
router.post("/register",(req,res)=>{
    const {username, password, password2, email} = req.body
    if (!username || !password || !email) {
        return res.render("register.ejs", {error: "Please enter username or password or email."});
    }
    if(password != password2){
        return res.render("register.ejs", {error: "Passwords are not same."})
    }
    db.query('select * from user where gmail = ?',[email],(error,result)=>{
        if(error){
            console.log(error)
        }
        if(result.length > 0){
            return res.render("register.ejs",{error: "This email has been used."})
        }
        const user_data = {
            username: username,
            password: password,
            password2: password2,
            gmail: email
        }
        db.query('insert into user set ?',user_data,(error2,result)=>{
            if(error2){
                console.log(error2)
            }else{
                return res.render("login.ejs",{success: "Register success."})
            }
        });
    })
})

module.exports = router