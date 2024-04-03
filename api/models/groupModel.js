const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: "User", require: true }],
});

// Export model
module.exports = mongoose.model("Group", GroupSchema);
