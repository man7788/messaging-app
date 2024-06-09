const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  name: { type: String, minLength: 1, maxLength: 50, required: true },
  users: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
});

// Export model
module.exports = mongoose.model("Group", GroupSchema);
