const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  name: { type: String, required: true, minLength: 1, maxLength: 50 },
  about: { type: String, minLength: 1, maxLength: 2000 },
});

// Export model
module.exports = mongoose.model("Profile", ProfileSchema);
