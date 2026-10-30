const express = require('express')
const path = require('path')
const app = express()
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config({path: '../.env'})

const paymentController = require('./controllers/paymentController');

if (!process.env.JWT_SECRETKEY) {
  console.error("❌ JWT_SECRETKEY is not defined in .env");
  process.exit(1); // หยุดการทำงานทันที
}

app.use(cookieParser());
app.use(cors({origin: ["http://localhost:5173","http://localhost:5174","https://pm-vdyh.onrender.com"],credentials: true, }));//new+++++

app.post("/api/payments/webhook", express.raw({ type: 'application/json' }), paymentController.stripeWebhook);

app.use(express.json());
app.use(express.urlencoded({extended:false}))

app.use("/api", require("./routes/authRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/communities", require("./routes/commuRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/friends", require("./routes/friendRoutes"));
app.use("/api/chats", require("./routes/chatRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/transections", require("./routes/transectionRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

app.use("/api/admin", require("./AdminRoutes/authRoutes"));
app.use("/api/admin/dashboard", require("./AdminRoutes/dashboardRoutes"));
app.use("/api/admin/users", require("./AdminRoutes/userRoutes"));
app.use("/api/admin/transactions", require("./AdminRoutes/transactionRoutes"));
app.use("/api/admin/content", require("./AdminRoutes/contentRoutes"));
app.use("/api/admin/reports", require("./AdminRoutes/reportRoutes"));
app.use(express.static(path.join(__dirname, 'public')))

// ===== SERVE ADMIN (เข้าผ่าน https://pm-vdyh.onrender.com/admin) =====
const adminBuildPath = path.join(__dirname, '../admin/dist');
app.use('/admin', express.static(adminBuildPath));
app.get(/^\/admin(\/.*)?$/, (req, res) => {
  res.sendFile(path.join(adminBuildPath, 'index.html'));
});

// ===== SERVE CLIENT (เข้าผ่าน https://pm-vdyh.onrender.com) =====
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.use((req, res) => {
    res.status(404).json({ error: "API route not found" });
});

app.listen(8080, () => {
    console.log("http://localhost:8080")
})