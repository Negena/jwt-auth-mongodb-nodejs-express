const mongoose = require("mongoose");


mongoose.connect(process.env.DB_URI, (err) => {
  if (err) throw err;
  else console.log("connected to db");
});


const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true
  }
});
const User = mongoose.model("User", schema);
module.exports = User;
