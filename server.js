const express = require('express')
const path = require('path')
const app = express()

const indexPage = path.join(__dirname,"index.html")

app.get("/",(req,res)=>{
    res.status(200)
    res.type('text/html')
    res.sendFile(indexPage)
})
app.listen(8080,()=>{
    console.log("Run Server port 8080 http://localhost:8080") 
})