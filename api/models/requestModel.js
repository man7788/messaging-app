const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RequestSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: "User", require: true },
  to: { type: Schema.Types.ObjectId, ref: "User", require: true },
});

// Export model
module.exports = mongoose.model("Request", RequestSchema);
