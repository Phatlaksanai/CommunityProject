const express = require('express')
const router = express.Router()

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
router.post("/regiter",(req,res)=>{
    console.log("regiter.ejs")
})

module.exports = router