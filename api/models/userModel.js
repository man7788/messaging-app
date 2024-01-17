const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true, minLength: 1, maxLength: 200 },
  password: { type: String, required: true, minLength: 8, maxLength: 200 },
  profile: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
});

// Export model
module.exports = mongoose.model("User", UserSchema);
