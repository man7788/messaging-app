const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, minLength: 1, maxLength: 50 },
  password: { type: String, required: true, minLength: 8, maxLength: 200 },
});

// Export model
module.exports = mongoose.model("User", UserSchema);
