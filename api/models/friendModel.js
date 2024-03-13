const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FriendSchema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: "User", require: true }],
});

// Export model
module.exports = mongoose.model("Friend", FriendSchema);
