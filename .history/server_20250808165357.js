const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/reviews", require("./routes/reviewRoutes"));

// Server
// const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port 5000`));
