const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("MONGO_URI=mongodb+srv://siddhupromotion:YOUR_PASSWORD_HERE@cluster0.bepvcja.mongodb.net/review_api?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
");
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
