const mongoose = require('mongoose');

const DB_HOST = process.env.DB_HOST;

const connectDb = async () => {
  try {
    const con = await mongoose.connect(DB_HOST);
    console.log(`DB CONNECTED TO HOST ${con.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(0);
  }
}

module.exports = connectDb