const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
  text: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 10000,
  },
  date: { type: Date, default: new Date() },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

// Export model
module.exports = mongoose.model("Message", MessageSchema);
