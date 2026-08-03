const express = require('express')
const path = require('path')
const app = express()
// const mysql = require('mysql2');
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const cors = require("cors");
// const connectDB = require('./config/db');

dotenv.config({path: '../.env'})

const paymentController = require('./controllers/paymentController');

if (!process.env.JWT_SECRETKEY) {
  console.error("❌ JWT_SECRETKEY is not defined in .env");
  process.exit(1); // หยุดการทำงานทันที
}

// const db = mysql.createConnection({
//     host: process.env.DATABASE_HOST,
//     user: process.env.DATABASE_USER,
//     password: process.env.DATABASE_PASSWORD,
//     database: process.env.DATABASE
// });

// db.connect((err) => {
//     if (err) {
//         console.error('not conect:', err);
//         return;
//     }
//     console.log('connecting!');
// });



app.use(cookieParser());
app.use(cors({origin: ["http://localhost:5173","http://localhost:5174"],credentials: true, }));//new+++++

app.post("/api/payments/webhook", express.raw({ type: 'application/json' }), paymentController.stripeWebhook);

app.use(express.json());
app.use(express.urlencoded({extended:false}))

// app.use('/api', require('./routes/MyRouter'))  
app.use("/api", require("./routes/authRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/communities", require("./routes/commuRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/friends", require("./routes/friendRoutes"));
app.use("/api/chats", require("./routes/chatRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

app.use("/api/admin", require("./AdminRoutes/authRoutes"));
app.use(express.static(path.join(__dirname, 'public')))

// ===== SERVE REACT =====
// const clientBuildPath = path.join(__dirname, '../client/dist')
// app.use(express.static(clientBuildPath))

// // สำคัญมาก: ให้ React Router ทำงาน
// app.get(/(.*)/, (req, res) => {
//   res.sendFile(path.join(clientBuildPath, 'index.html'))
// })

app.use((req, res) => {
    res.status(404).json({ error: "API route not found" });
});
// connectDB();

app.listen(8080, () => {
    console.log("http://localhost:8080")
})