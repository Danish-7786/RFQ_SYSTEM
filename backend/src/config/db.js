const mongoose = require('mongoose');

const {MONGODB_URI,DB_NAME} = process.env;


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;