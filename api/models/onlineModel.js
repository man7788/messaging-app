const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OnlineSchema = new Schema({
  online: { type: Boolean, default: false, required: true },
});

// Export model
module.exports = mongoose.model("Online", OnlineSchema);
