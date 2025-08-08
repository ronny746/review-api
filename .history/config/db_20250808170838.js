const mongoose = require("mongoose");

const connectDB = async () => {
  try {

    const conn = await mongoose.connect(
      "mongodb+srv://siddhupromotion:FaN2xmEs97DrSbOB@cluster0.bepvcja.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
