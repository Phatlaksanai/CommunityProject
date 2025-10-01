const express = require('express')
const router = express.Router()

router.get("/",(req,res)=>{
    res.render("index.ejs")
})
// router.get("/",(req,res)=>{
//     res.sendFile(path.join(__dirname,"../login.html"))
// })
// router.get("/home",(req,res)=>{
//     res.status(200)
//     res.type('text/html')
//     res.sendFile(path.join(__dirname,"../index.html"))
// })
// router.get("/upload",(req,res)=>{
//     res.sendFile(path.join(__dirname,"../upload.html"))
// })
// router.get("/report",(req,res)=>{
//     res.sendFile(path.join(__dirname,"../report.html"))
// })

module.exports = router