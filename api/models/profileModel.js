const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  full_name: { type: String, minLength: 1, maxLength: 100 },
  about: { type: String, minLength: 1, maxLength: 2000 },
});

// Export model
module.exports = mongoose.model("Profile", ProfileSchema);
