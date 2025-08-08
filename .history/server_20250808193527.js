const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
// connectDB();

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://review-new-db-user:FaN2xmEs97DrSbOB@cluster0.bepvcja.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/reviews", require("./routes/reviewRoutes"));

// Server
// const PORT = process.env.PORT || 5000;
app.listen(2000, () => console.log(`🚀 Server running on port 2000`));
