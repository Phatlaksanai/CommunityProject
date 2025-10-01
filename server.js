const express = require('express')
const path = require('path')
const router = require('./routes/MyRouter.js')
const app = express()

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
app.use(express.static(path.join(__dirname,'public')))
app.use(router)

app.listen(8080,()=>{
    console.log("Run Server port 8080 http://localhost:8080")
})