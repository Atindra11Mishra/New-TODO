const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/authRoutes.js");
const SolRoutes = require("./routes/SolRoutes.js");
const TaskRoutes= require("./routes/TaskRoute.js")

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Routes

app.use("/api", SolRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", TaskRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
