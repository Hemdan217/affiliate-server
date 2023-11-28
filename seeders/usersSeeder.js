const mongoose = require('mongoose');
const { Marketer, Merchant } = require("../models/UserModel");

const users = require("../data/users.json");

const DB_HOST = "mongodb://127.0.0.1:27017/safka-v1";

mongoose.connect(DB_HOST, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: user.password,
        code: user.code,
        is_active: true,
        created_at: user.createdAt,
        updated_at: user.updatedAt
      }
      if (user.type === "sales") {
        await new Marketer({ ...userData, role: "marketer" }).save();
      } else if (user.type === "vendor") {
        await new Merchant({ ...userData, role: "merchant" }).save();
      }
    }
    console.log("users added!");
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });